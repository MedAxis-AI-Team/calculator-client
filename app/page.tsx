'use client'

import { useReducer } from 'react'
import Image from 'next/image'

import type { Currency } from './lib/types'
import Tabs from './components/Tabs'
import CurrencySelector from './components/CurrencySelector'
import FundingMixTab from './features/funding/FundingMixTab'
import RunwayTab from './features/runway/RunwayTab'
import FooterCTA from './layouts/FooterCTA'

import { useMobile, useUrlHydration, useShareActions, usePostHogTracking } from './hooks'
import { reducer, INITIAL_STATE } from './lib/reducer'
import './page.css'

export default function CalculatorPage() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  useUrlHydration(dispatch)

  const { copiedBtn, handleShare, handleCopySummary } = useShareActions(state)
  const { trackedDispatch, handleTabSwitch, handleLoadExample, resultsRef } = usePostHogTracking(state, dispatch)

  const isMobile = useMobile()

  function handleLoadExampleClick() {
    handleLoadExample(state.fundingSources.length > 0, () => dispatch({ type: 'LOAD_EXAMPLE' }))
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
            {copiedBtn === 'share' ? 'Copied!' : isMobile ? 'Share' : 'Share URL'}
          </button>
          <button
            className={`page-actions__btn${copiedBtn === 'summary' ? ' page-actions__btn--copied' : ''}`}
            onClick={handleCopySummary}
          >
            {copiedBtn === 'summary' ? 'Copied!' : isMobile ? 'Copy' : 'Copy Summary'}
          </button>
        </div>

        <Tabs activeTab={state.activeTab} onSwitch={handleTabSwitch} />

        <div ref={resultsRef}>
          {state.activeTab === 'funding_mix' && (
            <FundingMixTab state={state} dispatch={trackedDispatch} onLoadExample={handleLoadExampleClick} />
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
