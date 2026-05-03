import { describe, it, expect } from 'vitest'
import { reducer, INITIAL_STATE } from '../reducer'
import type { AppState, AppAction } from '../types'

function apply(state: AppState, ...actions: Parameters<typeof reducer>[1][]): AppState {
  return actions.reduce((s, a) => reducer(s, a), state)
}

describe('SET_CURRENCY', () => {
  it('updates currency and nothing else', () => {
    const next = apply(INITIAL_STATE, { type: 'SET_CURRENCY', currency: 'GBP' })
    expect(next.currency).toBe('GBP')
    expect(next.company).toBe(INITIAL_STATE.company)
    expect(next.fundingSources).toBe(INITIAL_STATE.fundingSources)
  })
})

describe('ADD_SOURCE', () => {
  it('appends a source with unique id, default type equity, amount $1.5M', () => {
    const next = apply(INITIAL_STATE, { type: 'ADD_SOURCE' }, { type: 'ADD_SOURCE' })
    expect(next.fundingSources).toHaveLength(2)
    expect(next.fundingSources[0].type).toBe('equity')
    expect(next.fundingSources[0].amount).toBe(1_500_000)
    expect(next.fundingSources[0].id).not.toBe(next.fundingSources[1].id)
  })
})

describe('REMOVE_SOURCE', () => {
  it('removes only the targeted source by id', () => {
    const withTwo = apply(INITIAL_STATE, { type: 'ADD_SOURCE' }, { type: 'ADD_SOURCE' })
    const idToRemove = withTwo.fundingSources[0].id
    const idToKeep = withTwo.fundingSources[1].id
    const next = apply(withTwo, { type: 'REMOVE_SOURCE', id: idToRemove })
    expect(next.fundingSources).toHaveLength(1)
    expect(next.fundingSources[0].id).toBe(idToKeep)
  })
})

describe('UPDATE_SOURCE', () => {
  it('updates type field on the correct source', () => {
    const withOne = apply(INITIAL_STATE, { type: 'ADD_SOURCE' })
    const id = withOne.fundingSources[0].id
    const next = apply(withOne, { type: 'UPDATE_SOURCE', id, field: 'type', value: 'public_grant' })
    expect(next.fundingSources[0].type).toBe('public_grant')
  })

  it('updates amount field on the correct source', () => {
    const withOne = apply(INITIAL_STATE, { type: 'ADD_SOURCE' })
    const id = withOne.fundingSources[0].id
    const next = apply(withOne, { type: 'UPDATE_SOURCE', id, field: 'amount', value: 500_000 })
    expect(next.fundingSources[0].amount).toBe(500_000)
  })
})

describe('LOAD_EXAMPLE', () => {
  it('replaces sources with non-empty example data', () => {
    const next = apply(INITIAL_STATE, { type: 'LOAD_EXAMPLE' })
    expect(next.fundingSources.length).toBeGreaterThan(0)
    expect(next.company.preMoney).toBe(8_000_000)
  })
})

describe('SET_ACTIVE_TAB', () => {
  it('updates activeTab and nothing else', () => {
    const next = apply(INITIAL_STATE, { type: 'SET_ACTIVE_TAB', tab: 'runway' })
    expect(next.activeTab).toBe('runway')
    expect(next.company).toBe(INITIAL_STATE.company)
    expect(next.fundingSources).toBe(INITIAL_STATE.fundingSources)
  })
})

describe('SET_COMPANY_FIELD', () => {
  it('updates preMoney without touching founderOwnershipPct', () => {
    const next = apply(INITIAL_STATE, { type: 'SET_COMPANY_FIELD', field: 'preMoney', value: 5_000_000 })
    expect(next.company.preMoney).toBe(5_000_000)
    expect(next.company.founderOwnershipPct).toBe(INITIAL_STATE.company.founderOwnershipPct)
  })

  it('updates founderOwnershipPct without touching preMoney', () => {
    const next = apply(INITIAL_STATE, { type: 'SET_COMPANY_FIELD', field: 'founderOwnershipPct', value: 60 })
    expect(next.company.founderOwnershipPct).toBe(60)
    expect(next.company.preMoney).toBe(INITIAL_STATE.company.preMoney)
  })
})

describe('HYDRATE_FROM_URL', () => {
  it('replaces full state', () => {
    const hydrated: AppState = {
      activeTab: 'runway',
      currency: 'EUR',
      company: { preMoney: 5_000_000, founderOwnershipPct: 60 },
      fundingSources: [],
      runway: { cashOnHand: 200_000, monthlyBurn: 30_000, monthlyInflows: 5_000, pendingAwardAmount: 0, pendingTiming: 'uncertain' },
    }
    const next = apply(INITIAL_STATE, { type: 'HYDRATE_FROM_URL', state: hydrated })
    expect(next.activeTab).toBe('runway')
    expect(next.currency).toBe('EUR')
    expect(next.company.preMoney).toBe(5_000_000)
  })
})

describe('reducer default', () => {
  it('returns state unchanged for unknown action type', () => {
    const next = reducer(INITIAL_STATE, { type: 'UNKNOWN' } as unknown as AppAction)
    expect(next).toBe(INITIAL_STATE)
  })
})
