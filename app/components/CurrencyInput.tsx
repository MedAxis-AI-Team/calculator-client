import NumericFormField from './NumericFormField'
import type { Currency } from '../lib/types'
import { getCurrencySymbol } from '../lib/formatters'

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
    <NumericFormField
      label={label}
      hint={hint}
      value={value === 0 ? '' : value}
      thousandSeparator
      prefix={prefix}
      decimalScale={0}
      allowNegative={false}
      placeholder={`${prefix}0`}
      onValueChange={({ floatValue }) => onChange(Math.round(floatValue ?? 0))}
    />
  )
}
