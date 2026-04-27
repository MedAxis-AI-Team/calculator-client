import type { RunwayState, PendingTiming, Currency, AppAction } from '../../lib/types'
import CurrencyInput from '../shared/CurrencyInput'
import './RunwayInputs.css'

const TIMING_OPTIONS: { value: PendingTiming; label: string }[] = [
  { value: '1-3',       label: '1–3 months' },
  { value: '3-6',       label: '3–6 months' },
  { value: '6-12',      label: '6–12 months' },
  { value: 'uncertain', label: 'Uncertain / not applied yet' },
]

interface Props {
  runway: RunwayState
  currency: Currency
  dispatch: React.Dispatch<AppAction>
}

export default function RunwayInputs({ runway, currency, dispatch }: Props) {
  function setField(field: keyof RunwayState, value: number | string) {
    dispatch({ type: 'SET_RUNWAY_FIELD', field, value })
  }

  return (
    <section className="runway-inputs">
      <h2 className="runway-inputs__title">Runway Inputs</h2>
      <div className="runway-inputs__grid">
        <CurrencyInput label="Cash on hand"    value={runway.cashOnHand}    currency={currency} onChange={v => setField('cashOnHand', v)} />
        <CurrencyInput label="Monthly burn"    value={runway.monthlyBurn}   currency={currency} onChange={v => setField('monthlyBurn', v)} />
        <CurrencyInput label="Monthly inflows" value={runway.monthlyInflows} currency={currency} onChange={v => setField('monthlyInflows', v)}
          hint="Revenue, contracts, or other recurring cash in"
        />
      </div>

      <div className="runway-inputs__award">
        <h3 className="runway-inputs__award-title">Pending Award (optional)</h3>
        <div className="runway-inputs__grid">
          <CurrencyInput label="Expected amount" value={runway.pendingAwardAmount} currency={currency} onChange={v => setField('pendingAwardAmount', v)} />
          <div className="form-field">
            <label className="form-field__label">Expected timing</label>
            <select
              className="form-field__input"
              value={runway.pendingTiming}
              onChange={e => setField('pendingTiming', e.target.value as PendingTiming)}
            >
              {TIMING_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="runway-inputs__award-note">
          Pending awards are shown as a secondary scenario — not included in your primary runway.
        </p>
      </div>
    </section>
  )
}
