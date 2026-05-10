import { useEffect, useRef, useCallback } from 'react'
import { usePostHog } from 'posthog-js/react'
import type { AppAction, AppState } from '../lib/types'
import { aggregateSources } from '../lib/calculations'

interface UsePostHogTrackingReturn {
  trackedDispatch: (action: AppAction) => void
  handleTabSwitch: (tab: AppState['activeTab']) => void
  handleLoadExample: (hasSources: boolean, onConfirm: () => void) => void
  resultsRef: React.RefObject<HTMLDivElement | null>
}

export function usePostHogTracking(
  state: Pick<AppState, 'activeTab' | 'fundingSources'>,
  dispatch: React.Dispatch<AppAction>,
): UsePostHogTrackingReturn {
  const posthog = usePostHog()
  const loadTimeRef = useRef<number>(0)
  const timeOnPageFiredRef = useRef(false)
  const interactionCountRef = useRef(0)
  const interactionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resultsRef = useRef<HTMLDivElement | null>(null)
  const isResultsInViewRef = useRef(false)
  const hasTrackedResultsViewRef = useRef(false)

  useEffect(() => {
    loadTimeRef.current = Date.now()
  }, [])

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
      has_safe_note: buckets.safe_note_estimate > 0,
      has_pending_award: state.fundingSources.length > 0,
    })
  }, [posthog, state.activeTab, state.fundingSources])

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
      const field = action.type === 'UPDATE_SOURCE' && action.field === 'type'
        ? 'source_type'
        : 'field' in action ? String(action.field) : action.type
      posthog?.capture('calculator_interaction', {
        active_tab: state.activeTab,
        input_field: field,
        source_count: state.fundingSources.length,
      })
    }, 800)
  }, [dispatch, posthog, state.activeTab, state.fundingSources.length])

  const handleTabSwitch = useCallback((tab: AppState['activeTab']) => {
    dispatch({ type: 'SET_ACTIVE_TAB', tab })
    posthog?.capture('tab_switch', { tab })
  }, [dispatch, posthog])

  const handleLoadExample = useCallback((hasSources: boolean, onConfirm: () => void) => {
    posthog?.capture('load_example_click', { example: 'typical_early_stage' })
    if (hasSources) {
      if (!window.confirm('This will overwrite your current numbers with the example scenario. Continue?')) return
    }
    onConfirm()
  }, [posthog])

  return { trackedDispatch, handleTabSwitch, handleLoadExample, resultsRef }
}
