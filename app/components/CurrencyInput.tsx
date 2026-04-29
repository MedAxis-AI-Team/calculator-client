import { NumericFormat } from 'react-number-format'
import type { Currency } from '../lib/types'
import { getCurrencySymbol } from '../lib/formatters'
import './FormField.css'

interface Props {
  label?: string
  value: number
  currency: Currency
  onChange: (n: number) => void
  hint?: string
}

export default function CurrencyInput({ label, value, currency, onChange, hint }: Props) {
  const prefix = getCurrencySymbol(currency)

  return (
    <div className="form-field">
      {label && <label className="form-field__label">{label}</label>}
      <NumericFormat
        className="form-field__input"
        value={value === 0 ? '' : value}
        thousandSeparator
        prefix={prefix}
        decimalScale={0}
        allowNegative={false}
        placeholder={`${prefix}0`}
        onValueChange={({ floatValue }) => onChange(floatValue ?? 0)}
      />
      {hint && <span className="form-field__hint">{hint}</span>}
    </div>
  )
}
