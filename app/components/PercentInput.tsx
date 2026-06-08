import NumericFormField from './NumericFormField'

interface Props {
  label?: string
  value: number
  onChange: (n: number) => void
  hint?: string
}

export default function PercentInput({ label, value, onChange, hint }: Props) {
  return (
    <NumericFormField
      label={label}
      hint={hint}
      value={value === 0 ? '' : value}
      suffix="%"
      decimalScale={1}
      allowNegative={false}
      placeholder="0%"
      onValueChange={({ floatValue }) => onChange(floatValue ?? 0)}
      onBlur={() => onChange(Math.min(100, Math.max(0, value)))}
    />
  )
}
