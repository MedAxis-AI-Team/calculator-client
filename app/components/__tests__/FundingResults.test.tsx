import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FundingResults from '../funding/FundingResults'
import type { FundingMixResult, SourceBuckets } from '../../lib/types'

const emptyBuckets: SourceBuckets = {
  priced_equity: 0, safe_note_estimate: 0, grant_like: 0, operating_cash: 0,
  totalCapitalRaised: 0, totalModeledCash: 0, totalDilutive: 0, totalNonDilutive: 0,
}

const bucketsWithEquity: SourceBuckets = {
  priced_equity: 2_000_000, safe_note_estimate: 0, grant_like: 0, operating_cash: 0,
  totalCapitalRaised: 2_000_000, totalModeledCash: 2_000_000,
  totalDilutive: 2_000_000, totalNonDilutive: 0,
}

const validMix: FundingMixResult = {
  error: null,
  actualDilutionPct: 20.0,
  actualFounderOwnershipPct: 80.0,
  allEquityFounderOwnershipPct: 80.0,
  founderOwnershipPreservedPts: 0,
  actualPostMoneyValuation: 10_000_000,
  illustrativeValuePreserved: 0,
  estimatedCombinedDilutionPct: 20.0,
  hasSafeNote: false,
  nonDilutiveSharePct: 0,
}

describe('FundingResults — NO_PRE_MONEY', () => {
  it('renders pre-money prompt when error is NO_PRE_MONEY', () => {
    render(<FundingResults mix={{ error: 'NO_PRE_MONEY' }} buckets={bucketsWithEquity} currency="USD" />)
    expect(screen.getByText(/Enter a pre-money valuation/)).toBeInTheDocument()
  })
})

describe('FundingResults — empty sources', () => {
  it('renders add sources prompt when totalCapitalRaised is 0', () => {
    render(<FundingResults mix={{ error: 'NO_PRE_MONEY' }} buckets={emptyBuckets} currency="USD" />)
    expect(screen.getByText(/Add funding sources/)).toBeInTheDocument()
  })
})

describe('FundingResults — valid mix', () => {
  it('renders founder ownership percentage', () => {
    render(<FundingResults mix={validMix} buckets={bucketsWithEquity} currency="USD" />)
    expect(screen.getByText('80.0%')).toBeInTheDocument()
  })

  it('does not render SAFE/note card when hasSafeNote is false', () => {
    render(<FundingResults mix={validMix} buckets={bucketsWithEquity} currency="USD" />)
    expect(screen.queryByText(/Estimated combined dilution/)).not.toBeInTheDocument()
  })

  it('renders SAFE/note card when hasSafeNote is true', () => {
    const mixWithSafe: FundingMixResult = { ...validMix, hasSafeNote: true, estimatedCombinedDilutionPct: 25.0 }
    render(<FundingResults mix={mixWithSafe} buckets={bucketsWithEquity} currency="USD" />)
    expect(screen.getByText(/Estimated combined dilution/)).toBeInTheDocument()
  })
})
