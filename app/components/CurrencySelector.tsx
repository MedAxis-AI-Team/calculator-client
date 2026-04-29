import type { Currency } from '../lib/types'
import './CurrencySelector.css'

const CURRENCIES: Currency[] = ['USD', 'CAD', 'EUR', 'GBP']

interface Props {
  currency: Currency
  onChange: (c: Currency) => void
}

export default function CurrencySelector({ currency, onChange }: Props) {
  return (
    <div className="currency-selector" role="group" aria-label="Currency">
      {CURRENCIES.map(c => (
        <button
          key={c}
          className={`currency-selector__btn${currency === c ? ' currency-selector__btn--active' : ''}`}
          onClick={() => onChange(c)}
          aria-pressed={currency === c}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
