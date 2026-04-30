import type { AppState, AppAction, FundingSource } from './types'

export const INITIAL_STATE: AppState = {
  activeTab: 'funding_mix',
  currency: 'USD',
  company: { preMoney: 8_000_000, founderOwnershipPct: 75 },
  fundingSources: [],
  runway: {
    cashOnHand: 400_000,
    monthlyBurn: 45_000,
    monthlyInflows: 0,
    pendingAwardAmount: 275_000,
    pendingTiming: 'uncertain',
  },
}

const EXAMPLE_SOURCES: FundingSource[] = [
  { id: 'ex1', type: 'equity',          amount: 1_200_000 },
  { id: 'ex2', type: 'public_grant',    amount: 275_000 },
  { id: 'ex3', type: 'rd_tax_credit',   amount: 100_000 },
  { id: 'ex4', type: 'safe',            amount: 500_000 },
]

let nextId = 1
export function newId(): string { return `src-${nextId++}` }

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.tab }

    case 'SET_CURRENCY':
      return { ...state, currency: action.currency }

    case 'SET_COMPANY_FIELD':
      return { ...state, company: { ...state.company, [action.field]: action.value } }

    case 'ADD_SOURCE':
      return {
        ...state,
        fundingSources: [...state.fundingSources, { id: newId(), type: 'equity', amount: 1_500_000 }],
      }

    case 'REMOVE_SOURCE':
      return { ...state, fundingSources: state.fundingSources.filter(s => s.id !== action.id) }

    case 'UPDATE_SOURCE':
      return {
        ...state,
        fundingSources: state.fundingSources.map(s =>
          s.id === action.id ? { ...s, [action.field]: action.value } : s
        ),
      }

    case 'LOAD_EXAMPLE':
      return {
        ...state,
        company: { preMoney: 8_000_000, founderOwnershipPct: 75 },
        fundingSources: EXAMPLE_SOURCES,
        runway: { cashOnHand: 400_000, monthlyBurn: 45_000, monthlyInflows: 0, pendingAwardAmount: 275_000, pendingTiming: '3-6' },
      }

    case 'SET_RUNWAY_FIELD':
      return { ...state, runway: { ...state.runway, [action.field]: action.value } }

    case 'HYDRATE_FROM_URL':
      return { ...action.state }

    default:
      return state
  }
}
