import { describe, it, expect } from 'vitest'
import { reducer, INITIAL_STATE } from '../reducer'
import { aggregateSources, calculateFundingMix, calculateRunway, generateCopySummary } from '../calculations'
import { encodeState, parseSharedState } from '../validators'
import { formatMonths, formatCurrency } from '../formatters'
import type { AppState } from '../types'

function applyActions(base: AppState, ...actions: Parameters<typeof reducer>[1][]): AppState {
  return actions.reduce((s, a) => reducer(s, a), base)
}

describe('Smoke 1 — full funding mix session (reducer → calculations → copy)', () => {
  it('produces correct mix results and a non-empty copy summary', () => {
    // INITIAL_STATE already has preMoney=8M, founderOwnershipPct=75
    let state = applyActions(INITIAL_STATE,
      { type: 'ADD_SOURCE' },
    )
    const id1 = state.fundingSources[0].id
    state = applyActions(state,
      { type: 'UPDATE_SOURCE', id: id1, field: 'type',   value: 'equity'      },
      { type: 'UPDATE_SOURCE', id: id1, field: 'amount', value: 1_200_000     },
    )

    state = applyActions(state, { type: 'ADD_SOURCE' })
    const id2 = state.fundingSources[1].id
    state = applyActions(state,
      { type: 'UPDATE_SOURCE', id: id2, field: 'type',   value: 'public_grant' },
      { type: 'UPDATE_SOURCE', id: id2, field: 'amount', value: 275_000        },
    )

    state = applyActions(state, { type: 'ADD_SOURCE' })
    const id3 = state.fundingSources[2].id
    state = applyActions(state,
      { type: 'UPDATE_SOURCE', id: id3, field: 'type',   value: 'rd_tax_credit' },
      { type: 'UPDATE_SOURCE', id: id3, field: 'amount', value: 100_000         },
    )

    expect(state.fundingSources).toHaveLength(3)

    const buckets = aggregateSources(state.fundingSources)
    expect(buckets.priced_equity).toBe(1_200_000)
    expect(buckets.grant_like).toBe(375_000)
    expect(buckets.totalCapitalRaised).toBe(1_575_000)

    const mix = calculateFundingMix(state.company, buckets)
    expect(mix.error).toBeNull()
    if (mix.error !== null) return

    expect(mix.actualDilutionPct).toBeCloseTo(13.04, 1)
    expect(mix.actualFounderOwnershipPct).toBeCloseTo(65.2, 1)
    expect(mix.founderOwnershipPreservedPts).toBeCloseTo(2.5, 0)

    const summary = generateCopySummary(state.company, buckets, mix, null, 'https://calculator.medaxisai.org')
    expect(summary.length).toBeGreaterThan(0)
    expect(summary).toContain('$1.6M')
    expect(summary).toContain('medaxisai.org')
  })
})

describe('Smoke 2 — URL round-trip preserves calculation fidelity', () => {
  it('decoded state produces identical mix results', () => {
    let state = applyActions(INITIAL_STATE, { type: 'ADD_SOURCE' })
    const id = state.fundingSources[0].id
    state = applyActions(state,
      { type: 'UPDATE_SOURCE', id, field: 'type',   value: 'equity'  },
      { type: 'UPDATE_SOURCE', id, field: 'amount', value: 2_000_000 },
    )

    const originalBuckets = aggregateSources(state.fundingSources)
    const originalMix = calculateFundingMix(state.company, originalBuckets)
    expect(originalMix.error).toBeNull()
    if (originalMix.error !== null) return

    const encoded = encodeState(state)
    expect(typeof encoded).toBe('string')
    expect(encoded.length).toBeGreaterThan(0)

    const decoded = parseSharedState(encoded)
    expect(decoded).not.toBeNull()
    if (!decoded) return

    const decodedBuckets = aggregateSources(decoded.fundingSources)
    const decodedMix = calculateFundingMix(decoded.company, decodedBuckets)
    expect(decodedMix.error).toBeNull()
    if (decodedMix.error !== null) return

    expect(decodedMix.actualDilutionPct).toBeCloseTo(originalMix.actualDilutionPct, 5)
    expect(decodedMix.actualFounderOwnershipPct).toBeCloseTo(originalMix.actualFounderOwnershipPct, 5)
  })
})

describe('Smoke 3 — full runway session (reducer → calculateRunway → formatters)', () => {
  it('produces AWARD_ON_SCHEDULE scenario and formats output correctly', () => {
    // Switch timing to '3-6' to get AWARD_ON_SCHEDULE (INITIAL_STATE defaults to 'uncertain')
    const state = applyActions(INITIAL_STATE,
      { type: 'SET_RUNWAY_FIELD', field: 'pendingTiming', value: '3-6' },
    )

    expect(state.runway.cashOnHand).toBe(400_000)
    expect(state.runway.monthlyBurn).toBe(45_000)
    expect(state.runway.pendingAwardAmount).toBe(275_000)
    expect(state.runway.pendingTiming).toBe('3-6')

    const result = calculateRunway(state.runway)
    expect(result.error).toBeNull()
    if (result.error !== null) return

    expect(result.currentRunwayMonths).toBeCloseTo(8.9, 1)
    expect(result.awardScenario?.type).toBe('AWARD_ON_SCHEDULE')
    if (result.awardScenario?.type !== 'AWARD_ON_SCHEDULE') return
    expect(result.awardScenario.totalRunwayWithAward).toBeCloseTo(15.0, 1)

    expect(formatMonths(result.currentRunwayMonths)).toBe('8.9 mo')
    expect(formatCurrency(result.capitalTo18Months ?? 0, 'USD')).toBeTruthy()
    expect(formatCurrency(result.capitalTo24Months ?? 0, 'USD')).toBeTruthy()
  })
})

describe('Smoke 4 — LOAD_EXAMPLE produces valid, encodable non-error results', () => {
  it('calculates mix and runway without errors and survives URL encoding', () => {
    const state = reducer(INITIAL_STATE, { type: 'LOAD_EXAMPLE' })

    expect(state.fundingSources.length).toBeGreaterThan(0)

    const buckets = aggregateSources(state.fundingSources)
    const mix = calculateFundingMix(state.company, buckets)
    expect(mix.error).toBeNull()

    const runway = calculateRunway(state.runway)
    expect(runway.error).toBeNull()

    const encoded = encodeState(state)
    const decoded = parseSharedState(encoded)
    expect(decoded).not.toBeNull()
    if (!decoded) return

    const decodedBuckets = aggregateSources(decoded.fundingSources)
    const decodedMix = calculateFundingMix(decoded.company, decodedBuckets)
    expect(decodedMix.error).toBeNull()
    if (mix.error !== null || decodedMix.error !== null) return
    expect(decodedMix.actualDilutionPct).toBeCloseTo(mix.actualDilutionPct, 5)
  })
})
