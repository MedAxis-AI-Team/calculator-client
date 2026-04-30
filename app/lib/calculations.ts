import type { FundingSource, Company, RunwayState, SourceBuckets, FundingMixResult, RunwayResult, AwardScenario, Currency } from './types'
import { formatCurrency, formatDate } from './formatters'

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
  cashOutDate.setDate(cashOutDate.getDate() + Math.round(currentRunwayMonths * 30.4))

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
  currency: Currency = 'USD',
  runwayState: RunwayState | null = null,
): string {
  const fmt = (v: number) => formatCurrency(v, currency)
  const pct = (v: number) => `${v.toFixed(1)}%`
  const generated = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const lines: string[] = []

  lines.push('# MedAxis AI — Funding Mix Summary')
  lines.push('')
  lines.push(`*Generated ${generated} · For strategic planning only — not legal or financial advice.*`)
  lines.push('')
  lines.push('---')
  lines.push('')

  // Funding sources
  if (buckets.totalModeledCash > 0) {
    lines.push('## Funding Sources')
    lines.push('')
    lines.push('| Type | Amount |')
    lines.push('|---|---|')
    if (buckets.priced_equity > 0)      lines.push(`| Priced equity | ${fmt(buckets.priced_equity)} |`)
    if (buckets.safe_note_estimate > 0) lines.push(`| SAFE / convertible note | ${fmt(buckets.safe_note_estimate)} |`)
    if (buckets.grant_like > 0)         lines.push(`| Grant / non-dilutive | ${fmt(buckets.grant_like)} |`)
    if (buckets.operating_cash > 0)     lines.push(`| Operating revenue | ${fmt(buckets.operating_cash)} |`)
    lines.push('')
    lines.push(`**Total capital raised:** ${fmt(buckets.totalCapitalRaised)}`)
    if (buckets.operating_cash > 0) {
      lines.push(`**Total modeled cash:** ${fmt(buckets.totalModeledCash)} *(operating revenue excluded from dilution math)*`)
    }
    const breakdown: string[] = []
    if (buckets.totalDilutive > 0)    breakdown.push(`Dilutive: ${fmt(buckets.totalDilutive)}`)
    if (buckets.totalNonDilutive > 0) breakdown.push(`Non-dilutive: ${fmt(buckets.totalNonDilutive)}`)
    if (breakdown.length > 0) lines.push(`*${breakdown.join(' · ')}*`)
    lines.push('')
    lines.push('---')
    lines.push('')
  }

  // Ownership & dilution
  if (!fundingMix.error) {
    lines.push('## Ownership & Dilution')
    lines.push('')
    lines.push('| Metric | Value |')
    lines.push('|---|---|')
    lines.push(`| Pre-money valuation | ${fmt(company.preMoney)} |`)
    lines.push(`| Founder ownership entering | ${pct(company.founderOwnershipPct)} |`)
    lines.push(`| Actual dilution (priced equity only) | ${pct(fundingMix.actualDilutionPct)} |`)
    lines.push(`| **Founder ownership after raise** | **${pct(fundingMix.actualFounderOwnershipPct)}** |`)
    lines.push(`| Post-money valuation | ${fmt(fundingMix.actualPostMoneyValuation)} |`)
    if (fundingMix.founderOwnershipPreservedPts > 0) {
      lines.push(`| Ownership preserved vs. all-equity scenario | +${fundingMix.founderOwnershipPreservedPts.toFixed(1)} pts |`)
    }
    if (fundingMix.illustrativeValuePreserved > 0) {
      lines.push(`| Illustrative equity value preserved | ~${fmt(fundingMix.illustrativeValuePreserved)} |`)
    }
    if (fundingMix.nonDilutiveSharePct > 0) {
      lines.push(`| Non-dilutive share of raise | ${pct(fundingMix.nonDilutiveSharePct)} |`)
    }
    lines.push('')
    if (fundingMix.hasSafeNote) {
      lines.push(`> *Estimated combined dilution if SAFE/note converts: ~${pct(fundingMix.estimatedCombinedDilutionPct)}. SAFE/note amounts are estimates only and excluded from the primary ownership metric.*`)
      lines.push('')
    }
    lines.push('---')
    lines.push('')
  }

  // Runway
  const hasRunway = runwayState !== null || runwayResult !== null
  if (hasRunway) {
    lines.push('## Runway')
    lines.push('')

    if (runwayState) {
      lines.push('### Inputs')
      lines.push('')
      lines.push('| | |')
      lines.push('|---|---|')
      lines.push(`| Cash on hand | ${fmt(runwayState.cashOnHand)} |`)
      lines.push(`| Monthly burn | ${fmt(runwayState.monthlyBurn)} |`)
      if (runwayState.monthlyInflows > 0) {
        lines.push(`| Monthly inflows | ${fmt(runwayState.monthlyInflows)} |`)
        lines.push(`| Net burn | ${fmt(runwayState.monthlyBurn - runwayState.monthlyInflows)} |`)
      }
      lines.push('')
    }

    if (runwayResult) {
      if (runwayResult.error === 'NET_BURN_NOT_POSITIVE') {
        lines.push(`> **Runway not limited** — ${runwayResult.message}`)
        lines.push('')
      } else {
        lines.push('### Results')
        lines.push('')
        lines.push('| Metric | Value |')
        lines.push('|---|---|')
        lines.push(`| Current runway | ${runwayResult.currentRunwayMonths.toFixed(1)} months |`)
        if (runwayResult.cashOutDate) {
          lines.push(`| Estimated cash-out | ${formatDate(runwayResult.cashOutDate)} |`)
        }
        if (runwayResult.capitalTo18Months != null) {
          lines.push(`| Capital needed — 18 months | ${fmt(runwayResult.capitalTo18Months)} |`)
        }
        if (runwayResult.capitalTo24Months != null) {
          lines.push(`| Capital needed — 24 months | ${fmt(runwayResult.capitalTo24Months)} |`)
        }
        lines.push('')

        const scenario = runwayResult.awardScenario
        if (scenario) {
          if (scenario.type === 'AWARD_ON_SCHEDULE') {
            lines.push('### Pending Award Scenario')
            lines.push('')
            lines.push('| | |')
            lines.push('|---|---|')
            if (runwayState?.pendingAwardAmount) {
              lines.push(`| Award amount | ${fmt(runwayState.pendingAwardAmount)} |`)
            }
            lines.push(`| Timing midpoint | ${scenario.timingMidpoint} months |`)
            lines.push(`| **Total runway with award** | **${scenario.totalRunwayWithAward.toFixed(1)} months** |`)
            lines.push('')
          } else if (scenario.type === 'CASH_OUT_BEFORE_AWARD') {
            lines.push(`> ⚠️ **Cash out before award arrives.** Bridge funding needed: **${fmt(scenario.bridgeNeeded)}**`)
            if (scenario.bridgeFundedRunway) {
              lines.push(`> If bridge secured: ${scenario.bridgeFundedRunway.toFixed(1)} months total runway.`)
            }
            lines.push('')
          } else if (scenario.type === 'TIMING_UNCERTAIN') {
            lines.push(`> *Pending award excluded from projection — timing uncertain. If funded: ${scenario.ifAwardedMonths.toFixed(1)} months total runway.*`)
            lines.push('')
          }
        }
      }
    }

    lines.push('---')
    lines.push('')
  }

  lines.push('*Supports US, Canadian, UK, and European non-equity funding contexts.*')
  lines.push('')
  lines.push(`[View or share this model](${url})`)
  lines.push('')
  lines.push('*Built for life sciences founders by [MedAxis AI](https://medaxisai.org)*')

  return lines.join('\n')
}
