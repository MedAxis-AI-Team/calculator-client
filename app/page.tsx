'use client'

import { useReducer, useEffect, useRef, useCallback, useState } from 'react'
import Image from 'next/image'
import { usePostHog } from 'posthog-js/react'

import type { AppAction, ActiveTab, Currency } from './lib/types'
import Tabs from './components/shared/Tabs'
import CurrencySelector from './components/shared/CurrencySelector'
import FundingMixTab from './components/funding/FundingMixTab'
import RunwayTab from './components/runway/RunwayTab'
import FooterCTA from './components/layout/FooterCTA'

import { reducer, INITIAL_STATE } from './lib/reducer'
import { parseSharedState, encodeState } from './lib/validators'
import { aggregateSources, calculateFundingMix, calculateRunway, generateCopySummary } from './lib/calculations'
import './page.css'

export default function CalculatorPage() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const posthog = usePostHog()
  const loadTimeRef = useRef<number>(0)
  const timeOnPageFiredRef = useRef(false)
  const interactionCountRef = useRef(0)
  const interactionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const isResultsInViewRef = useRef(false)
  const hasTrackedResultsViewRef = useRef(false)
  const [copiedBtn, setCopiedBtn] = useState<'share' | 'summary' | null>(null)

  useEffect(() => {
    loadTimeRef.current = Date.now()
  }, [])

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('model')
    if (raw) {
      const parsed = parseSharedState(raw)
      if (parsed) dispatch({ type: 'HYDRATE_FROM_URL', state: parsed })
    }
  }, [])

  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('model', encodeState(state))
    window.history.replaceState(null, '', url.toString())
  }, [state])

  useEffect(() => {
    return () => { if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current) }
  }, [])

  useEffect(() => {
    if (!resultsRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { isResultsInViewRef.current = entry.isIntersecting },
      { threshold: 0.5 },
    )
    observer.observe(resultsRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (hasTrackedResultsViewRef.current) return
    if (!isResultsInViewRef.current) return
    if (interactionCountRef.current === 0) return
    hasTrackedResultsViewRef.current = true
    const buckets = aggregateSources(state.fundingSources)
    posthog?.capture('results_viewed', {
      active_tab: state.activeTab,
      source_count: state.fundingSources.length,
      priced_equity_amount: buckets.priced_equity,
      grant_like_amount: buckets.grant_like,
    })
  }, [posthog, state])

  useEffect(() => {
    function fireTimeOnPage() {
      if (timeOnPageFiredRef.current) return
      timeOnPageFiredRef.current = true
      posthog?.capture('time_on_page', {
        seconds_on_page: Math.round((Date.now() - loadTimeRef.current) / 1000),
      })
    }
    const onVisibility = () => { if (document.visibilityState === 'hidden') fireTimeOnPage() }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('beforeunload', fireTimeOnPage)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('beforeunload', fireTimeOnPage)
    }
  }, [posthog])

  const trackedDispatch = useCallback((action: AppAction) => {
    dispatch(action)
    const trackable: AppAction['type'][] = ['SET_COMPANY_FIELD', 'UPDATE_SOURCE', 'SET_RUNWAY_FIELD', 'SET_CURRENCY']
    if (!trackable.includes(action.type)) return
    interactionCountRef.current += 1
    if (interactionCountRef.current <= 1) return
    if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current)
    interactionTimerRef.current = setTimeout(() => {
      const field = 'field' in action ? String(action.field) : action.type
      posthog?.capture('calculator_interaction', {
        active_tab: state.activeTab,
        input_field: field,
        source_count: state.fundingSources.length,
      })
    }, 800)
  }, [posthog, state.activeTab, state.fundingSources.length])

  function handleTabSwitch(tab: ActiveTab) {
    dispatch({ type: 'SET_ACTIVE_TAB', tab })
    posthog?.capture('tab_switch', { tab })
  }

  function handleLoadExample() {
    posthog?.capture('load_example_click', { example: 'typical_early_stage' })
    if (state.fundingSources.length > 0) {
      if (!window.confirm('This will overwrite your current numbers with the example scenario. Continue?')) return
    }
    dispatch({ type: 'LOAD_EXAMPLE' })
  }

  async function handleShare() {
    const buckets = aggregateSources(state.fundingSources)
    try {
      await navigator.clipboard.writeText(window.location.href)
      posthog?.capture('share_click', {
        active_tab: state.activeTab,
        source_count: state.fundingSources.length,
        has_safe_note: buckets.safe_note_estimate > 0,
        has_pending_award: state.runway.pendingAwardAmount > 0,
      })
      setCopiedBtn('share')
      setTimeout(() => setCopiedBtn(null), 1500)
    } catch {
      window.prompt('Copy this URL to share:', window.location.href)
    }
  }

  async function handleCopySummary() {
    const buckets = aggregateSources(state.fundingSources)
    const mix = calculateFundingMix(state.company, buckets)
    const runway = calculateRunway(state.runway)
    const text = generateCopySummary(state.company, buckets, mix, runway, window.location.href, state.currency, state.runway)
    try {
      await navigator.clipboard.writeText(text)
      posthog?.capture('copy_summary_click', {
        active_tab: state.activeTab,
        includes_runway: !runway?.error,
        has_safe_note: buckets.safe_note_estimate > 0,
      })
      setCopiedBtn('summary')
      setTimeout(() => setCopiedBtn(null), 1500)
    } catch {
      window.prompt('Copy this summary:', text)
    }
  }

  return (
    <>
      <header className="site-header">
        <a href="https://medaxisai.org" className="site-header__logo-link" aria-label="MedAxis AI">
          <Image src="/md.png" alt="MedAxis AI" width={32} height={32} className="site-header__logo" />
        </a>
        <CurrencySelector
          currency={state.currency}
          onChange={(c: Currency) => trackedDispatch({ type: 'SET_CURRENCY', currency: c })}
        />
      </header>

      <main className="page-wrap">
        <div className="hero">
          <h1 className="hero__title">Life Sciences Funding Mix Calculator</h1>
          <p className="hero__sub">
            A free calculator built for life sciences founders combining grants, tax credits, and equity.
          </p>
          <p className="hero__disclaimer">
            For strategic planning only — not legal or financial advice. Supports US, Canadian, UK, and European non-equity funding contexts.
          </p>
        </div>

        <div className="page-actions">
          <button
            className={`page-actions__btn${copiedBtn === 'share' ? ' page-actions__btn--copied' : ''}`}
            onClick={handleShare}
          >
            {copiedBtn === 'share' ? 'Copied!' : 'Share URL'}
          </button>
          <button
            className={`page-actions__btn${copiedBtn === 'summary' ? ' page-actions__btn--copied' : ''}`}
            onClick={handleCopySummary}
          >
            {copiedBtn === 'summary' ? 'Copied!' : 'Copy Summary'}
          </button>
        </div>

        <Tabs activeTab={state.activeTab} onSwitch={handleTabSwitch} />

        <div ref={resultsRef}>
          {state.activeTab === 'funding_mix' && (
            <FundingMixTab state={state} dispatch={trackedDispatch} onLoadExample={handleLoadExample} />
          )}
          {state.activeTab === 'runway' && (
            <RunwayTab state={state} dispatch={trackedDispatch} />
          )}
        </div>

        <FooterCTA />
      </main>
    </>
  )
}
