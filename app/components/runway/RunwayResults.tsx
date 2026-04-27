import type { RunwayResult, AwardScenario, Currency } from '../../lib/types'
import ResultCard from '../shared/ResultCard'
import { formatMonths, formatCurrency, formatDate } from '../../lib/formatters'
import './RunwayResults.css'

interface Props {
  result: RunwayResult | null
  currency: Currency
}

export default function RunwayResults({ result, currency }: Props) {
  if (!result) return null

  if (result.error === 'NET_BURN_NOT_POSITIVE') {
    return (
      <div className="runway-results">
        <ResultCard
          label="Runway status"
          value="Not limited"
          sub="Monthly inflows meet or exceed burn — runway is not constrained"
        />
      </div>
    )
  }

  return (
    <section className="runway-results">
      <div className="runway-results__primary">
        <ResultCard
          label="Current runway"
          value={formatMonths(result.currentRunwayMonths)}
        />
        {result.awardScenario && <AwardScenarioCard scenario={result.awardScenario} currency={currency} />}
        {result.cashOutDate && (
          <ResultCard
            label="Estimated cash-out"
            value={formatDate(result.cashOutDate)}
          />
        )}
        <ResultCard
          label="Capital needed — 18 months"
          value={formatCurrency(result.capitalTo18Months, currency)}
          sub="Additional capital to reach 18-month milestone"
        />
        <ResultCard
          label="Capital needed — 24 months"
          value={formatCurrency(result.capitalTo24Months, currency)}
          sub="Includes pending award if on-schedule"
        />
      </div>
      <p className="runway-results__formula">
        Runway = cash / (burn - inflows). Pending awards are modeled as cash received on the midpoint of your selected window.
      </p>
      <p className="runway-results__milestone">
        Use this to estimate whether your capital mix reaches your next regulatory, clinical, technical, or commercial milestone (e.g., Pre-IND / CTA, CE Mark or Health Canada submission, pilot readout, pivotal study, Phase 1/2 data).
      </p>
    </section>
  )
}

function AwardScenarioCard({ scenario, currency }: { scenario: AwardScenario; currency: Currency }) {
  if (scenario.type === 'AWARD_ON_SCHEDULE') {
    return (
      <ResultCard
        label="Runway with pending award (scenario)"
        value={formatMonths(scenario.totalRunwayWithAward)}
        sub={`If award arrives in ~${scenario.timingMidpoint} months`}
        accent="amber"
      />
    )
  }
  if (scenario.type === 'CASH_OUT_BEFORE_AWARD') {
    return (
      <ResultCard
        label="Warning — cash out before award arrives"
        value={formatCurrency(scenario.bridgeNeeded, currency)}
        sub={`Bridge needed to reach award timing (${scenario.timingMidpoint} mo). If funded: ${formatMonths(scenario.bridgeFundedRunway)} total.`}
        accent="warning"
      />
    )
  }
  return (
    <ResultCard
      label="Pending award — timing uncertain"
      value={formatMonths(scenario.ifAwardedMonths)}
      sub="Excluded from primary runway. Shown only if award arrives."
      accent="amber"
    />
  )
}
