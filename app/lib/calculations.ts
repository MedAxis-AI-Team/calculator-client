import type { FundingSource, Company, RunwayState, SourceBuckets, FundingMixResult, RunwayResult, AwardScenario } from './types'

/**
 * Aggregates raw funding sources into categorised buckets.
 * `operating_cash` is excluded from `totalCapitalRaised` — it is existing revenue, not raised capital.
 */
export function aggregateSources(fundingSources: FundingSource[]): SourceBuckets {
  const buckets = {
    priced_equity: 0,
    safe_note_estimate: 0,
    grant_like: 0,
    operating_cash: 0,
    totalCapitalRaised: 0,
    totalModeledCash: 0,
    totalDilutive: 0,
    totalNonDilutive: 0,
  }

  for (const source of fundingSources) {
    const amt = Number(source.amount) || 0
    switch (source.type) {
      case 'equity':
        buckets.priced_equity += amt; break
      case 'safe':
      case 'convertible_note':
        buckets.safe_note_estimate += amt; break
      case 'public_grant':
      case 'rd_tax_credit':
      case 'foundation_award':
        buckets.grant_like += amt; break
      case 'operating_revenue':
        buckets.operating_cash += amt; break
    }
  }

  // operating_cash excluded from totalCapitalRaised
  buckets.totalCapitalRaised = buckets.priced_equity + buckets.safe_note_estimate + buckets.grant_like
  buckets.totalModeledCash   = buckets.totalCapitalRaised + buckets.operating_cash
  buckets.totalDilutive      = buckets.priced_equity + buckets.safe_note_estimate
  buckets.totalNonDilutive   = buckets.grant_like + buckets.operating_cash

  return buckets
}

/**
 * Calculates founder dilution and ownership metrics from priced equity only.
 * SAFE/note appears in `estimatedCombinedDilutionPct` (secondary) but never in the primary metric.
 * Returns `{ error: 'NO_PRE_MONEY' }` when `company.preMoney <= 0`.
 */
export function calculateFundingMix(company: Company, buckets: SourceBuckets): FundingMixResult {
  const { preMoney, founderOwnershipPct } = company
  const { priced_equity, safe_note_estimate, grant_like, totalCapitalRaised } = buckets

  if (preMoney <= 0) return { error: 'NO_PRE_MONEY' }

  const actualDilutionPct =
    priced_equity > 0 ? priced_equity / (preMoney + priced_equity) : 0

  const actualFounderOwnershipPct = founderOwnershipPct * (1 - actualDilutionPct)

  // All-equity comparison: priced_equity + grant_like (SAFE/note and operating excluded)
  const allEquityAmount = priced_equity + grant_like
  const allEquityDilutionPct =
    allEquityAmount > 0 ? allEquityAmount / (preMoney + allEquityAmount) : 0
  const allEquityFounderOwnershipPct = founderOwnershipPct * (1 - allEquityDilutionPct)

  const founderOwnershipPreservedPts = actualFounderOwnershipPct - allEquityFounderOwnershipPct
  const actualPostMoneyValuation = preMoney + priced_equity
  const illustrativeValuePreserved = (founderOwnershipPreservedPts / 100) * actualPostMoneyValuation

  const estimatedCombinedDilutionPct =
    priced_equity + safe_note_estimate > 0
      ? (priced_equity + safe_note_estimate) / (preMoney + priced_equity + safe_note_estimate)
      : 0

  const nonDilutiveSharePct =
    totalCapitalRaised > 0 ? (grant_like / totalCapitalRaised) * 100 : 0

  return {
    error: null,
    actualDilutionPct: actualDilutionPct * 100,
    actualFounderOwnershipPct,
    allEquityFounderOwnershipPct,
    founderOwnershipPreservedPts,
    actualPostMoneyValuation,
    illustrativeValuePreserved,
    estimatedCombinedDilutionPct: estimatedCombinedDilutionPct * 100,
    hasSafeNote: safe_note_estimate > 0,
    nonDilutiveSharePct,
  }
}

const TIMING_MIDPOINTS: Record<string, number | null> = {
  '1-3': 2, '3-6': 4.5, '6-12': 9, 'uncertain': null,
}

/**
 * Calculates runway and pending award scenarios.
 * The award scenario is always secondary — it never replaces `currentRunwayMonths`.
 * Returns `{ error: 'NET_BURN_NOT_POSITIVE' }` when `monthlyBurn <= monthlyInflows`.
 */
export function calculateRunway(runway: RunwayState): RunwayResult {
  const { cashOnHand, monthlyBurn, monthlyInflows, pendingAwardAmount, pendingTiming } = runway
  const netBurn = monthlyBurn - monthlyInflows

  if (netBurn <= 0) {
    return {
      error: 'NET_BURN_NOT_POSITIVE',
      message: 'Runway not limited at current net burn',
      netBurn,
      currentRunwayMonths: Infinity,
      cashOutDate: null,
      awardScenario: null,
      capitalTo18Months: null,
      capitalTo24Months: null,
    }
  }

  const currentRunwayMonths = cashOnHand / netBurn
  const cashOutDate = new Date()
  cashOutDate.setMonth(cashOutDate.getMonth() + Math.floor(currentRunwayMonths))

  const capitalTo18Months = Math.max(0, 18 * netBurn - cashOnHand)
  const capitalTo24MonthsBase = Math.max(0, 24 * netBurn - cashOnHand)

  const timingMidpoint = TIMING_MIDPOINTS[pendingTiming] ?? null
  let awardScenario: AwardScenario | null = null

  if (timingMidpoint !== null && pendingAwardAmount > 0) {
    const cashAtAwardArrival = cashOnHand - timingMidpoint * netBurn
    if (cashAtAwardArrival <= 0) {
      const bridgeNeeded = Math.max(0, timingMidpoint * netBurn - cashOnHand)
      awardScenario = {
        type: 'CASH_OUT_BEFORE_AWARD',
        message: 'Cash out before pending award arrives. Primary runway excludes this grant.',
        bridgeNeeded,
        bridgeFundedRunway: timingMidpoint + pendingAwardAmount / netBurn,
        timingMidpoint,
      }
    } else {
      const remainingAfterAward = (cashAtAwardArrival + pendingAwardAmount) / netBurn
      awardScenario = {
        type: 'AWARD_ON_SCHEDULE',
        totalRunwayWithAward: timingMidpoint + remainingAfterAward,
        timingMidpoint,
      }
    }
  } else if (pendingTiming === 'uncertain' && pendingAwardAmount > 0) {
    awardScenario = {
      type: 'TIMING_UNCERTAIN',
      message: 'Pending award excluded from projection (timing uncertain)',
      ifAwardedMonths: currentRunwayMonths + pendingAwardAmount / netBurn,
    }
  }

  const capitalTo24Months =
    awardScenario?.type === 'AWARD_ON_SCHEDULE'
      ? Math.max(0, capitalTo24MonthsBase - pendingAwardAmount)
      : capitalTo24MonthsBase

  return {
    error: null,
    netBurn,
    currentRunwayMonths,
    cashOutDate,
    awardScenario,
    capitalTo18Months,
    capitalTo24Months,
  }
}

/**
 * Builds a plain-text copy summary for clipboard sharing.
 * Returns an empty string when `fundingMix.error` is set — callers must guard before displaying.
 */
export function generateCopySummary(
  company: Company,
  buckets: SourceBuckets,
  fundingMix: FundingMixResult,
  runwayResult: RunwayResult | null,
  url: string,
): string {
  if (fundingMix.error) return ''

  const fmt = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
    return `$${v.toLocaleString()}`
  }

  const parts: string[] = []
  if (buckets.priced_equity > 0) parts.push(`${fmt(buckets.priced_equity)} equity`)
  if (buckets.safe_note_estimate > 0) parts.push(`${fmt(buckets.safe_note_estimate)} SAFE/note`)
  if (buckets.grant_like > 0) parts.push(`${fmt(buckets.grant_like)} non-dilutive`)

  let summary = `Modeled ${fmt(buckets.totalCapitalRaised)} blended raise`
  if (parts.length > 0) summary += ` (${parts.join(' + ')})`

  if (fundingMix.founderOwnershipPreservedPts > 0) {
    summary += ` preserving ${fundingMix.founderOwnershipPreservedPts.toFixed(1)} founder ownership points`
  }

  if (runwayResult && !runwayResult.error && runwayResult.currentRunwayMonths < Infinity) {
    summary += `. Runway: ${runwayResult.currentRunwayMonths.toFixed(1)} months`
    if (runwayResult.awardScenario?.type === 'AWARD_ON_SCHEDULE') {
      summary += `, extending to ${runwayResult.awardScenario.totalRunwayWithAward.toFixed(1)} with pending award`
    }
  }

  if (buckets.safe_note_estimate > 0) {
    summary += '. SAFE/note amounts are estimate-only and excluded from the primary ownership metric'
  }

  summary += `. Built for life sciences: ${url}`
  return summary
}
