export type FundingSourceType =
  | 'equity'
  | 'safe'
  | 'convertible_note'
  | 'public_grant'
  | 'rd_tax_credit'
  | 'foundation_award'
  | 'operating_revenue'

export type Currency = 'USD' | 'CAD' | 'EUR' | 'GBP'

export type PendingTiming = '1-3' | '3-6' | '6-12' | 'uncertain'

export type ActiveTab = 'funding_mix' | 'runway'

export interface FundingSource {
  id: string
  type: FundingSourceType
  amount: number
}

export interface Company {
  preMoney: number
  founderOwnershipPct: number
}

export interface RunwayState {
  cashOnHand: number
  monthlyBurn: number
  monthlyInflows: number
  pendingAwardAmount: number
  pendingTiming: PendingTiming
}

export interface AppState {
  activeTab: ActiveTab
  currency: Currency
  company: Company
  fundingSources: FundingSource[]
  runway: RunwayState
}

export interface SourceBuckets {
  priced_equity: number
  safe_note_estimate: number
  grant_like: number
  operating_cash: number
  totalCapitalRaised: number
  totalModeledCash: number
  totalDilutive: number
  totalNonDilutive: number
}

export type FundingMixResult =
  | { error: 'NO_PRE_MONEY' }
  | {
      error: null
      actualDilutionPct: number
      actualFounderOwnershipPct: number
      allEquityFounderOwnershipPct: number
      founderOwnershipPreservedPts: number
      actualPostMoneyValuation: number
      illustrativeValuePreserved: number
      estimatedCombinedDilutionPct: number
      hasSafeNote: boolean
      nonDilutiveSharePct: number
    }

export type AwardScenario =
  | { type: 'AWARD_ON_SCHEDULE'; totalRunwayWithAward: number; timingMidpoint: number }
  | { type: 'CASH_OUT_BEFORE_AWARD'; message: string; bridgeNeeded: number; bridgeFundedRunway: number; timingMidpoint: number }
  | { type: 'TIMING_UNCERTAIN'; message: string; ifAwardedMonths: number }

export type RunwayResult =
  | {
      error: 'NET_BURN_NOT_POSITIVE'
      message: string
      netBurn: number
      currentRunwayMonths: number
      cashOutDate: null
      awardScenario: null
      capitalTo18Months: null
      capitalTo24Months: null
    }
  | {
      error: null
      netBurn: number
      currentRunwayMonths: number
      cashOutDate: Date
      awardScenario: AwardScenario | null
      capitalTo18Months: number
      capitalTo24Months: number
    }

export type AppAction =
  | { type: 'SET_ACTIVE_TAB'; tab: ActiveTab }
  | { type: 'SET_CURRENCY'; currency: Currency }
  | { type: 'SET_COMPANY_FIELD'; field: keyof Company; value: number }
  | { type: 'ADD_SOURCE' }
  | { type: 'REMOVE_SOURCE'; id: string }
  | { type: 'UPDATE_SOURCE'; id: string; field: 'type'; value: FundingSourceType }
  | { type: 'UPDATE_SOURCE'; id: string; field: 'amount'; value: number }
  | { type: 'LOAD_EXAMPLE' }
  | { type: 'SET_RUNWAY_FIELD'; field: keyof RunwayState; value: number | string }
  | { type: 'HYDRATE_FROM_URL'; state: AppState }
