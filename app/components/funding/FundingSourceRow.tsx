import { NumericFormat } from 'react-number-format'
import type { FundingSource, FundingSourceType, Currency, AppAction } from '../../lib/types'
import { getCurrencySymbol } from '../../lib/formatters'
import './FundingSourceRow.css'

const SOURCE_TYPES: { value: FundingSourceType; label: string }[] = [
  { value: 'equity',            label: 'Priced equity round' },
  { value: 'safe',              label: 'SAFE / convertible (estimate)' },
  { value: 'convertible_note',  label: 'Convertible note (estimate)' },
  { value: 'public_grant',      label: 'Grant / contract / award (non-equity)' },
  { value: 'rd_tax_credit',     label: 'R&D tax credit' },
  { value: 'foundation_award',  label: 'Foundation award' },
  { value: 'operating_revenue', label: 'Operating revenue / bootstrap' },
]

interface Props {
  source: FundingSource
  currency: Currency
  dispatch: React.Dispatch<AppAction>
}

export default function FundingSourceRow({ source, currency, dispatch }: Props) {
  const prefix = getCurrencySymbol(currency)

  return (
    <div className="source-row">
      <select
        className="source-row__type"
        value={source.type}
        onChange={e => dispatch({ type: 'UPDATE_SOURCE', id: source.id, field: 'type', value: e.target.value as FundingSourceType })}
        aria-label="Funding type"
      >
        {SOURCE_TYPES.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      <NumericFormat
        className="source-row__amount"
        value={source.amount === 0 ? '' : source.amount}
        thousandSeparator
        prefix={prefix}
        decimalScale={0}
        allowNegative={false}
        placeholder={`${prefix}0`}
        aria-label="Amount"
        onValueChange={({ floatValue }) =>
          dispatch({ type: 'UPDATE_SOURCE', id: source.id, field: 'amount', value: floatValue ?? 0 })
        }
      />

      <button
        className="source-row__remove"
        onClick={() => dispatch({ type: 'REMOVE_SOURCE', id: source.id })}
        aria-label="Remove funding source"
      >
        ×
      </button>
    </div>
  )
}
