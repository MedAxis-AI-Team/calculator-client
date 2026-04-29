import type { FundingSource, Currency, AppAction } from '../../lib/types'
import FundingSourceRow from './FundingSourceRow'
import './FundingSourcesList.css'

interface Props {
  fundingSources: FundingSource[]
  currency: Currency
  dispatch: React.Dispatch<AppAction>
  onLoadExample: () => void
}

export default function FundingSourcesList({ fundingSources, currency, dispatch, onLoadExample }: Props) {
  return (
    <section className="sources-list">
      <div className="sources-list__header">
        <h2 className="sources-list__title">Funding Sources</h2>
        <button className="sources-list__example-btn" onClick={onLoadExample}>
          Load typical early-stage example
        </button>
      </div>

      {fundingSources.length === 0 && (
        <p className="sources-list__empty">
          No sources added yet. Add a funding source below or load an example.
        </p>
      )}

      <div className="sources-list__rows">
        {fundingSources.map(source => (
          <FundingSourceRow key={source.id} source={source} currency={currency} dispatch={dispatch} />
        ))}
      </div>

      <button className="sources-list__add-btn" onClick={() => dispatch({ type: 'ADD_SOURCE' })}>
        + Add funding source
      </button>
    </section>
  )
}
