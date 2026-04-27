import { describe, it, expect } from 'vitest'
import { aggregateSources, calculateFundingMix, calculateRunway, generateCopySummary } from '../calculations'
import type { FundingSource, Company, RunwayState } from '../types'

function src(type: FundingSource['type'], amount: number): FundingSource {
  return { id: type, type, amount }
}

function company(preMoney: number, founderOwnershipPct: number): Company {
  return { preMoney, founderOwnershipPct }
}

function runway(
  cashOnHand: number,
  monthlyBurn: number,
  monthlyInflows = 0,
  pendingAwardAmount = 0,
  pendingTiming: RunwayState['pendingTiming'] = 'uncertain',
): RunwayState {
  return { cashOnHand, monthlyBurn, monthlyInflows, pendingAwardAmount, pendingTiming }
}

describe('Scenario A — priced equity only', () => {
  it('dilution 20.0%, ownership 80.0%', () => {
    const buckets = aggregateSources([src('equity', 2_000_000)])
    const mix = calculateFundingMix(company(8_000_000, 100), buckets)
    expect(mix.error).toBeNull()
    if (mix.error !== null) return
    expect(mix.actualDilutionPct).toBeCloseTo(20.0, 1)
    expect(mix.actualFounderOwnershipPct).toBeCloseTo(80.0, 1)
  })
})

describe('Scenario B — equity + grants', () => {
  it('dilution 13.04%, ownership 65.2%, preserved ~2.5pts, illustrative ~$230K', () => {
    const sources = [
      src('equity', 1_200_000),
      src('public_grant', 275_000),
      src('rd_tax_credit', 100_000),
    ]
    const buckets = aggregateSources(sources)
    const mix = calculateFundingMix(company(8_000_000, 75), buckets)
    expect(mix.error).toBeNull()
    if (mix.error !== null) return
    expect(mix.actualDilutionPct).toBeCloseTo(13.04, 1)
    expect(mix.actualFounderOwnershipPct).toBeCloseTo(65.2, 1)
    expect(mix.founderOwnershipPreservedPts).toBeCloseTo(2.5, 0)
    expect(mix.illustrativeValuePreserved).toBeCloseTo(230_000, -4)
  })
})

describe('Scenario C — basic runway', () => {
  it('runway ~8.9 months', () => {
    const result = calculateRunway(runway(400_000, 45_000))
    expect(result.error).toBeNull()
    if (result.error !== null) return
    expect(result.currentRunwayMonths).toBeCloseTo(8.9, 1)
  })
})

describe('Scenario D — award on schedule (3-6 mo timing)', () => {
  it('total runway ~15.0 months', () => {
    const result = calculateRunway(runway(400_000, 45_000, 0, 275_000, '3-6'))
    expect(result.error).toBeNull()
    if (result.error !== null) return
    expect(result.awardScenario?.type).toBe('AWARD_ON_SCHEDULE')
    if (result.awardScenario?.type !== 'AWARD_ON_SCHEDULE') return
    expect(result.awardScenario.totalRunwayWithAward).toBeCloseTo(15.0, 1)
  })
})

describe('Scenario E — cash out before award (6-12 mo timing)', () => {
  it('returns CASH_OUT_BEFORE_AWARD with bridge amount', () => {
    const result = calculateRunway(runway(150_000, 45_000, 0, 275_000, '6-12'))
    expect(result.error).toBeNull()
    if (result.error !== null) return
    expect(result.awardScenario?.type).toBe('CASH_OUT_BEFORE_AWARD')
    if (result.awardScenario?.type !== 'CASH_OUT_BEFORE_AWARD') return
    expect(result.awardScenario.bridgeNeeded).toBeCloseTo(255_000, -3)
  })
})

describe('Scenario F — net burn not positive', () => {
  it('returns NET_BURN_NOT_POSITIVE when burn equals inflows', () => {
    const result = calculateRunway(runway(400_000, 45_000, 45_000))
    expect(result.error).toBe('NET_BURN_NOT_POSITIVE')
  })

  it('returns NET_BURN_NOT_POSITIVE when inflows exceed burn', () => {
    const result = calculateRunway(runway(400_000, 30_000, 50_000))
    expect(result.error).toBe('NET_BURN_NOT_POSITIVE')
  })
})

describe('Scenario G — no pre-money valuation', () => {
  it('returns NO_PRE_MONEY when preMoney is 0', () => {
    const buckets = aggregateSources([src('equity', 2_000_000)])
    const mix = calculateFundingMix(company(0, 75), buckets)
    expect(mix.error).toBe('NO_PRE_MONEY')
  })
})

describe('aggregateSources', () => {
  it('excludes operating_cash from totalCapitalRaised', () => {
    const buckets = aggregateSources([
      src('equity', 1_000_000),
      src('operating_revenue', 500_000),
    ])
    expect(buckets.totalCapitalRaised).toBe(1_000_000)
    expect(buckets.operating_cash).toBe(500_000)
  })

  it('groups safe and convertible_note into safe_note_estimate', () => {
    const buckets = aggregateSources([
      src('safe', 300_000),
      src('convertible_note', 200_000),
    ])
    expect(buckets.safe_note_estimate).toBe(500_000)
  })

  it('groups grant types into grant_like', () => {
    const buckets = aggregateSources([
      src('public_grant', 100_000),
      src('rd_tax_credit', 50_000),
      src('foundation_award', 25_000),
    ])
    expect(buckets.grant_like).toBe(175_000)
  })
})

describe('Edge — grants-only (no priced equity)', () => {
  it('dilution is 0, but preserved pts are positive vs all-equity alternative', () => {
    const buckets = aggregateSources([src('public_grant', 500_000)])
    const mix = calculateFundingMix(company(5_000_000, 80), buckets)
    expect(mix.error).toBeNull()
    if (mix.error !== null) return
    expect(mix.actualDilutionPct).toBe(0)
    expect(mix.actualFounderOwnershipPct).toBe(80)
    expect(mix.founderOwnershipPreservedPts).toBeCloseTo(7.27, 1)
  })

  it('nonDilutiveSharePct is 100% when only grant sources', () => {
    const buckets = aggregateSources([src('public_grant', 300_000), src('foundation_award', 200_000)])
    const mix = calculateFundingMix(company(5_000_000, 80), buckets)
    expect(mix.error).toBeNull()
    if (mix.error !== null) return
    expect(mix.nonDilutiveSharePct).toBe(100)
  })
})

describe('Edge — SAFE + equity combined dilution', () => {
  it('estimatedCombinedDilutionPct > actualDilutionPct when SAFE is present', () => {
    const buckets = aggregateSources([src('equity', 1_000_000), src('safe', 500_000)])
    const mix = calculateFundingMix(company(8_000_000, 75), buckets)
    expect(mix.error).toBeNull()
    if (mix.error !== null) return
    expect(mix.hasSafeNote).toBe(true)
    expect(mix.estimatedCombinedDilutionPct).toBeCloseTo(15.79, 1)
    expect(mix.estimatedCombinedDilutionPct).toBeGreaterThan(mix.actualDilutionPct)
  })

  it('hasSafeNote is false with no SAFE/convertible sources', () => {
    const buckets = aggregateSources([src('equity', 1_000_000)])
    const mix = calculateFundingMix(company(8_000_000, 75), buckets)
    expect(mix.error).toBeNull()
    if (mix.error !== null) return
    expect(mix.hasSafeNote).toBe(false)
  })
})

describe('Edge — runway boundary conditions', () => {
  it('cashOnHand=0 gives 0 months runway', () => {
    const result = calculateRunway(runway(0, 45_000))
    expect(result.error).toBeNull()
    if (result.error !== null) return
    expect(result.currentRunwayMonths).toBe(0)
    expect(result.capitalTo18Months).toBe(18 * 45_000)
  })

  it('exactly 18-month runway gives capitalTo18Months=0', () => {
    const result = calculateRunway(runway(18 * 45_000, 45_000))
    expect(result.error).toBeNull()
    if (result.error !== null) return
    expect(result.currentRunwayMonths).toBeCloseTo(18, 5)
    expect(result.capitalTo18Months).toBe(0)
  })

  it('pendingAwardAmount=0 with explicit timing produces no award scenario', () => {
    const result = calculateRunway(runway(400_000, 45_000, 0, 0, '3-6'))
    expect(result.error).toBeNull()
    if (result.error !== null) return
    expect(result.awardScenario).toBeNull()
  })

  it('CASH_OUT_BEFORE_AWARD message includes primary runway note', () => {
    const result = calculateRunway(runway(150_000, 45_000, 0, 275_000, '6-12'))
    expect(result.error).toBeNull()
    if (result.error !== null) return
    expect(result.awardScenario?.type).toBe('CASH_OUT_BEFORE_AWARD')
    if (result.awardScenario?.type !== 'CASH_OUT_BEFORE_AWARD') return
    expect(result.awardScenario.message).toContain('Primary runway excludes this grant')
  })

  it('bridgeFundedRunway for CASH_OUT_BEFORE_AWARD matches reference (15.11 months)', () => {
    const result = calculateRunway(runway(150_000, 45_000, 0, 275_000, '6-12'))
    expect(result.error).toBeNull()
    if (result.error !== null) return
    if (result.awardScenario?.type !== 'CASH_OUT_BEFORE_AWARD') return
    expect(result.awardScenario.bridgeFundedRunway).toBeCloseTo(15.11, 1)
  })

  it('capitalTo24Months is reduced by award when AWARD_ON_SCHEDULE', () => {
    const result = calculateRunway(runway(400_000, 45_000, 0, 275_000, '3-6'))
    expect(result.error).toBeNull()
    if (result.error !== null) return
    expect(result.awardScenario?.type).toBe('AWARD_ON_SCHEDULE')
    expect(result.capitalTo24Months).toBe(405_000)
  })

  it('TIMING_UNCERTAIN scenario when pendingTiming is uncertain', () => {
    const result = calculateRunway(runway(400_000, 45_000, 0, 275_000, 'uncertain'))
    expect(result.error).toBeNull()
    if (result.error !== null) return
    expect(result.awardScenario?.type).toBe('TIMING_UNCERTAIN')
    if (result.awardScenario?.type !== 'TIMING_UNCERTAIN') return
    expect(result.awardScenario.ifAwardedMonths).toBeCloseTo(15.0, 1)
  })
})

describe('Edge — illustrativeValuePreserved precision', () => {
  it('matches reference output for scenario B within $1', () => {
    const sources = [
      src('equity', 1_200_000),
      src('public_grant', 275_000),
      src('rd_tax_credit', 100_000),
    ]
    const buckets = aggregateSources(sources)
    const mix = calculateFundingMix(company(8_000_000, 75), buckets)
    expect(mix.error).toBeNull()
    if (mix.error !== null) return
    // Raw float: 234986.945... — rounds to $235K in UI, within spec "≈$230K" estimate
    expect(mix.illustrativeValuePreserved).toBeCloseTo(234_987, 0)
  })
})

describe('generateCopySummary', () => {
  const co: Company = { preMoney: 8_000_000, founderOwnershipPct: 75 }
  const url = 'https://calculator.medaxisai.org'

  it('returns empty string when fundingMix has error', () => {
    const buckets = aggregateSources([])
    expect(generateCopySummary(co, buckets, { error: 'NO_PRE_MONEY' }, null, url)).toBe('')
  })

  it('omits runway sentence when runwayResult is null', () => {
    const buckets = aggregateSources([src('equity', 1_000_000)])
    const mix = calculateFundingMix(co, buckets)
    const result = generateCopySummary(co, buckets, mix, null, url)
    expect(result).not.toContain('Runway:')
    expect(result).toContain(url)
  })

  it('includes SAFE/note in parts and appends disclaimer', () => {
    const buckets = aggregateSources([src('equity', 1_000_000), src('safe', 500_000)])
    const mix = calculateFundingMix(co, buckets)
    const result = generateCopySummary(co, buckets, mix, null, url)
    expect(result).toContain('SAFE/note')
    expect(result).toContain('estimate-only')
  })

  it('formats amounts under $1K using toLocaleString', () => {
    const buckets = aggregateSources([src('equity', 500)])
    const mix = calculateFundingMix(co, buckets)
    const result = generateCopySummary(co, buckets, mix, null, url)
    expect(result).toContain('$500')
  })
})
