import { describe, it, expect } from 'vitest'
import { encodeState, parseSharedState } from '../validators'
import { INITIAL_STATE } from '../reducer'
import type { AppState } from '../types'

const BASE_STATE: AppState = {
  ...INITIAL_STATE,
  fundingSources: [{ id: 'src-1', type: 'equity', amount: 1_000_000 }],
}

describe('encodeState + parseSharedState round-trip', () => {
  it('returns equal state after encode → decode', () => {
    const encoded = encodeState(BASE_STATE)
    const decoded = parseSharedState(encoded)
    expect(decoded).not.toBeNull()
    expect(decoded?.currency).toBe(BASE_STATE.currency)
    expect(decoded?.activeTab).toBe(BASE_STATE.activeTab)
    expect(decoded?.company.preMoney).toBe(BASE_STATE.company.preMoney)
    expect(decoded?.fundingSources).toHaveLength(1)
    expect(decoded?.fundingSources[0].amount).toBe(1_000_000)
  })
})

describe('parseSharedState — invalid inputs', () => {
  it('returns null for invalid base64', () => {
    expect(parseSharedState('not-valid-base64!!!')).toBeNull()
  })

  it('returns null for wrong version', () => {
    const raw = btoa(JSON.stringify({ version: 2, ...INITIAL_STATE }))
    expect(parseSharedState(raw)).toBeNull()
  })

  it('returns null for invalid activeTab', () => {
    const raw = btoa(JSON.stringify({ version: 1, ...INITIAL_STATE, activeTab: 'unknown' }))
    expect(parseSharedState(raw)).toBeNull()
  })

  it('returns null for invalid currency', () => {
    const raw = btoa(JSON.stringify({ version: 1, ...INITIAL_STATE, currency: 'JPY' }))
    expect(parseSharedState(raw)).toBeNull()
  })

  it('returns null when company.preMoney is missing', () => {
    const state = { version: 1, ...INITIAL_STATE, company: { founderOwnershipPct: 75 } }
    const raw = btoa(JSON.stringify(state))
    expect(parseSharedState(raw)).toBeNull()
  })

  it('returns null for invalid fundingSource type', () => {
    const state = {
      version: 1,
      ...INITIAL_STATE,
      fundingSources: [{ id: 'x', type: 'invalid_type', amount: 100 }],
    }
    const raw = btoa(JSON.stringify(state))
    expect(parseSharedState(raw)).toBeNull()
  })

  it('returns null for negative source amount', () => {
    const state = {
      version: 1,
      ...INITIAL_STATE,
      fundingSources: [{ id: 'x', type: 'equity', amount: -500 }],
    }
    const raw = btoa(JSON.stringify(state))
    expect(parseSharedState(raw)).toBeNull()
  })

  it('returns null for invalid pendingTiming', () => {
    const state = {
      version: 1,
      ...INITIAL_STATE,
      runway: { ...INITIAL_STATE.runway, pendingTiming: 'NEVER' },
    }
    const raw = btoa(JSON.stringify(state))
    expect(parseSharedState(raw)).toBeNull()
  })
})
