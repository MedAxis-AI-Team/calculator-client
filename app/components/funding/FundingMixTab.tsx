import type { AppState, AppAction } from '../../lib/types'
import CompanyBasics from './CompanyBasics'
import FundingSourcesList from './FundingSourcesList'
import FundingResults from './FundingResults'
import { aggregateSources, calculateFundingMix } from '../../lib/calculations'

interface Props {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  onLoadExample: () => void
}

export default function FundingMixTab({ state, dispatch, onLoadExample }: Props) {
  const { company, fundingSources, currency } = state
  const buckets = aggregateSources(fundingSources)
  const mix = calculateFundingMix(company, buckets)

  return (
    <div>
      <CompanyBasics company={company} currency={currency} dispatch={dispatch} />
      <FundingSourcesList
        fundingSources={fundingSources}
        currency={currency}
        dispatch={dispatch}
        onLoadExample={onLoadExample}
      />
      <FundingResults mix={mix} buckets={buckets} currency={currency} />
    </div>
  )
}
