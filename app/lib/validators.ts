import type { AppState, ActiveTab, Currency, PendingTiming, FundingSourceType } from './types'

const VALID_TABS: ActiveTab[]          = ['funding_mix', 'runway']
const VALID_CURRENCIES: Currency[]     = ['USD', 'CAD', 'EUR', 'GBP']
const VALID_TIMINGS: PendingTiming[]   = ['1-3', '3-6', '6-12', 'uncertain']
const VALID_TYPES: FundingSourceType[] = [
  'equity', 'safe', 'convertible_note', 'public_grant',
  'rd_tax_credit', 'foundation_award', 'operating_revenue',
]

/**
 * Parses and validates a base64-encoded shared state string from the URL `model` param.
 * Returns `null` if the payload is malformed, has an unknown version, or contains invalid enum values —
 * the caller should fall back to default state.
 */
export function parseSharedState(raw: string): AppState | null {
  try {
    const s = JSON.parse(atob(raw)) as Record<string, unknown>
    if (s['version'] !== 1) return null
    if (!VALID_TABS.includes(s['activeTab'] as ActiveTab)) return null
    if (!VALID_CURRENCIES.includes(s['currency'] as Currency)) return null

    const company = s['company'] as Record<string, unknown> | undefined
    if (typeof company?.['preMoney'] !== 'number') return null
    if (typeof company?.['founderOwnershipPct'] !== 'number') return null

    if (!Array.isArray(s['fundingSources'])) return null
    for (const src of s['fundingSources'] as Record<string, unknown>[]) {
      if (!VALID_TYPES.includes(src['type'] as FundingSourceType)) return null
      if (typeof src['amount'] !== 'number' || (src['amount'] as number) < 0) return null
    }

    const runway = s['runway'] as Record<string, unknown> | undefined
    if (!VALID_TIMINGS.includes(runway?.['pendingTiming'] as PendingTiming)) return null

    return s as unknown as AppState
  } catch {
    return null
  }
}

/** Serialises app state to a base64 string suitable for the URL `model` param. */
export function encodeState(state: AppState): string {
  return btoa(JSON.stringify({ version: 1, ...state }))
}
