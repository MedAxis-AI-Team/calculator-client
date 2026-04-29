import { NumericFormat } from 'react-number-format'
import './FormField.css'

interface Props {
  label?: string
  value: number
  onChange: (n: number) => void
  hint?: string
}

export default function PercentInput({ label, value, onChange, hint }: Props) {
  return (
    <div className="form-field">
      {label && <label className="form-field__label">{label}</label>}
      <NumericFormat
        className="form-field__input"
        value={value === 0 ? '' : value}
        suffix="%"
        decimalScale={1}
        allowNegative={false}
        placeholder="0%"
        onValueChange={({ floatValue }) => onChange(floatValue ?? 0)}
        onBlur={() => onChange(Math.min(100, Math.max(0, value)))}
      />
      {hint && <span className="form-field__hint">{hint}</span>}
    </div>
  )
}
