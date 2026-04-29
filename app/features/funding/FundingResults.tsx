import type { FundingMixResult, SourceBuckets, Currency } from '../../lib/types'
import ResultCard from '../../components/ResultCard'
import StackedBar from './StackedBar'
import { formatCurrency, formatPct } from '../../lib/formatters'
import './FundingResults.css'

interface Props {
  mix: FundingMixResult
  buckets: SourceBuckets
  currency: Currency
}

export default function FundingResults({ mix, buckets, currency }: Props) {
  if (buckets.totalCapitalRaised <= 0) {
    return (
      <div className="funding-results funding-results--empty">
        <p>Add funding sources above to see results.</p>
      </div>
    )
  }

  if (mix.error === 'NO_PRE_MONEY') {
    return (
      <div className="funding-results funding-results--empty">
        <p>Enter a pre-money valuation to calculate dilution.</p>
      </div>
    )
  }

  return (
    <section className="funding-results">
      <StackedBar buckets={buckets} currency={currency} />
      <div className="funding-results__cards">
        <ResultCard
          label="Founder ownership after round"
          value={formatPct(mix.actualFounderOwnershipPct)}
          sub={`${formatPct(mix.actualDilutionPct)} dilution from priced equity`}
        />
        <ResultCard
          label="Ownership preserved"
          value={`+${mix.founderOwnershipPreservedPts.toFixed(1)} pts`}
          sub={`Worth ~${formatCurrency(mix.illustrativeValuePreserved, currency)} vs. all-equity raise`}
        />
        <ResultCard
          label="Non-dilutive share"
          value={formatPct(mix.nonDilutiveSharePct)}
          sub={`${formatCurrency(buckets.grant_like, currency)} of ${formatCurrency(buckets.totalCapitalRaised, currency)} total`}
        />
        {mix.hasSafeNote && (
          <ResultCard
            label="Estimated combined dilution (incl. SAFE/note)"
            value={formatPct(mix.estimatedCombinedDilutionPct)}
            sub="Estimate only — actual conversion depends on terms"
            accent="amber"
          />
        )}
      </div>
      <p className="funding-results__disclaimer">
        Primary ownership metric uses priced equity only. SAFE/note dilution is an estimate and excluded from the primary metric.
      </p>
    </section>
  )
}
