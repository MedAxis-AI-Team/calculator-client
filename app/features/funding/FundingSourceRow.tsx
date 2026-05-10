import { NumericFormat } from 'react-number-format'
import type { FundingSource, FundingSourceType, Currency, AppAction } from '../../lib/types'
import { getCurrencySymbol } from '../../lib/formatters'
import { useMobile } from '../../hooks'
import './FundingSourceRow.css'

const SOURCE_TYPES: { value: FundingSourceType; label: string }[] = [
  { value: 'equity',            label: 'Priced equity round' },
  { value: 'safe',              label: 'SAFE / ASA / convertible (estimate)' },
  { value: 'convertible_note',  label: 'Convertible note (estimate)' },
  { value: 'public_grant',      label: 'Grant / contract / award (non-equity)' },
  { value: 'rd_tax_credit',     label: 'R&D tax credit' },
  { value: 'foundation_award',  label: 'Foundation award' },
  { value: 'operating_revenue', label: 'Operating revenue / bootstrap' },
]

const TYPE_HINTS: Record<FundingSourceType, string> = {
  equity:            'Seed: $500K–$2M · Series A: $3M–$10M',
  safe:              'Typical: $100K–$1M per note',
  convertible_note:  'Typical: $100K–$1M per note',
  public_grant:      'SBIR/STTR Phase I: ~$275K · Phase II: ~$1M',
  rd_tax_credit:     'SR&ED (CA): 15–35% of eligible spend · UK R&D: ~33%',
  foundation_award:  'Typical: $50K–$500K',
  operating_revenue: '',
}

const TYPE_DEFAULTS: Record<FundingSourceType, number> = {
  equity:            1_500_000,
  safe:              500_000,
  convertible_note:  500_000,
  public_grant:      275_000,
  rd_tax_credit:     100_000,
  foundation_award:  100_000,
  operating_revenue: 0,
}

interface Props {
  source: FundingSource
  currency: Currency
  dispatch: React.Dispatch<AppAction>
}

export default function FundingSourceRow({ source, currency, dispatch }: Props) {
  const isMobile = useMobile()
  const prefix = getCurrencySymbol(currency)

  const typeSelect = (
    <select
      className="source-row__type"
      value={source.type}
      onChange={e => {
        const newType = e.target.value as FundingSourceType
        dispatch({ type: 'UPDATE_SOURCE', id: source.id, field: 'type', value: newType })
        dispatch({ type: 'UPDATE_SOURCE', id: source.id, field: 'amount', value: TYPE_DEFAULTS[newType] })
      }}
      aria-label="Funding type"
    >
      {SOURCE_TYPES.map(t => (
        <option key={t.value} value={t.value}>{t.label}</option>
      ))}
    </select>
  )

  const hint = TYPE_HINTS[source.type]

  const amountInput = (
    <div className="source-row__amount-wrap">
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
          dispatch({ type: 'UPDATE_SOURCE', id: source.id, field: 'amount', value: Math.round(floatValue ?? 0) })
        }
      />
      {hint && <span className="source-row__hint">{hint}</span>}
    </div>
  )

  const removeBtn = (
    <button
      className="source-row__remove"
      onClick={() => dispatch({ type: 'REMOVE_SOURCE', id: source.id })}
      aria-label="Remove funding source"
    >
      ×
    </button>
  )

  if (isMobile) {
    return (
      <div className="source-row source-row--mobile">
        {typeSelect}
        <div className="source-row__mobile-row">
          {amountInput}
          {removeBtn}
        </div>
      </div>
    )
  }

  return (
    <div className="source-row">
      {typeSelect}
      {amountInput}
      {removeBtn}
    </div>
  )
}
