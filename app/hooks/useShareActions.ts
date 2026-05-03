import { useState } from 'react'
import { usePostHog } from 'posthog-js/react'
import type { AppState } from '../lib/types'
import { aggregateSources, calculateFundingMix, calculateRunway, generateCopySummary } from '../lib/calculations'
import { encodeState } from '../lib/validators'
import { INITIAL_STATE } from '../lib/reducer'

function isRunwayDirty(state: AppState): boolean {
  return JSON.stringify(state.runway) !== JSON.stringify(INITIAL_STATE.runway)
}

type CopiedBtn = 'share' | 'summary' | null

interface UseShareActionsReturn {
  copiedBtn: CopiedBtn
  handleShare: () => Promise<void>
  handleCopySummary: () => Promise<void>
}

export function useShareActions(state: AppState): UseShareActionsReturn {
  const [copiedBtn, setCopiedBtn] = useState<CopiedBtn>(null)
  const posthog = usePostHog()

  async function handleShare() {
    const buckets = aggregateSources(state.fundingSources)
    const url = new URL(window.location.href)
    url.searchParams.set('model', encodeState(state))
    try {
      await navigator.clipboard.writeText(url.toString())
      posthog?.capture('share_click', {
        active_tab: state.activeTab,
        source_count: state.fundingSources.length,
        has_safe_note: buckets.safe_note_estimate > 0,
        has_pending_award: state.runway.pendingAwardAmount > 0,
      })
      setCopiedBtn('share')
      setTimeout(() => setCopiedBtn(null), 1500)
    } catch {
      window.prompt('Copy this URL to share:', url.toString())
    }
  }

  async function handleCopySummary() {
    const buckets = aggregateSources(state.fundingSources)
    const mix = calculateFundingMix(state.company, buckets)
    const runway = calculateRunway(state.runway)
    const shareUrl = new URL(window.location.href)
    shareUrl.searchParams.set('model', encodeState(state))
    const dirty = isRunwayDirty(state)
    const text = generateCopySummary(state.company, buckets, mix, dirty ? runway : null, shareUrl.toString(), state.currency, dirty ? state.runway : undefined)
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

  return { copiedBtn, handleShare, handleCopySummary }
}
