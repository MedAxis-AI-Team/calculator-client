import { NumericFormat, type NumericFormatProps } from 'react-number-format'
import './FormField.css'

interface Props extends Omit<NumericFormatProps, 'className'> {
  label?: string
  hint?: string
}

/** Shared wrapper around NumericFormat that renders the form-field label/hint shell. */
export default function NumericFormField({ label, hint, ...numericProps }: Props) {
  return (
    <div className="form-field">
      {label && <label className="form-field__label">{label}</label>}
      <NumericFormat className="form-field__input" {...numericProps} />
      {hint && <span className="form-field__hint">{hint}</span>}
    </div>
  )
}
