import type { SourceBuckets, Currency } from '../../lib/types'
import { formatCurrency } from '../../lib/formatters'
import './StackedBar.css'

interface Props {
  buckets: SourceBuckets
  currency: Currency
}

interface Segment {
  key: string
  amount: number
  label: string
  color: string
}

export default function StackedBar({ buckets, currency }: Props) {
  const total = buckets.totalCapitalRaised
  if (total <= 0) return null

  const pct = (n: number) => Math.max(0, (n / total) * 100)

  const segments: Segment[] = [
    { key: 'equity',      amount: buckets.priced_equity,     label: 'Priced equity', color: 'amber' },
    { key: 'safe',        amount: buckets.safe_note_estimate, label: 'SAFE / note',   color: 'amber-light' },
    { key: 'nondilutive', amount: buckets.grant_like,         label: 'Non-dilutive',  color: 'teal' },
  ].filter(s => s.amount > 0)

  return (
    <div className="stacked-bar">
      <div className="stacked-bar__track" role="img" aria-label="Funding mix breakdown">
        {segments.map(s => (
          <div
            key={s.key}
            className={`stacked-bar__segment stacked-bar__segment--${s.color}`}
            style={{ width: `${pct(s.amount)}%` }}
            title={`${s.label}: ${formatCurrency(s.amount, currency)}`}
          />
        ))}
      </div>
      <div className="stacked-bar__legend">
        {segments.map(s => (
          <span key={s.key} className={`stacked-bar__legend-item stacked-bar__legend-item--${s.color}`}>
            <span className="stacked-bar__dot" />
            {s.label}: {formatCurrency(s.amount, currency)}
          </span>
        ))}
      </div>
    </div>
  )
}
