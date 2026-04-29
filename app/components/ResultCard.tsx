import type { ReactNode } from 'react'
import './ResultCard.css'

type Accent = 'teal' | 'amber' | 'warning'

interface Props {
  label: string
  value: string
  sub?: string
  accent?: Accent
  children?: ReactNode
}

export default function ResultCard({ label, value, sub, accent = 'teal', children }: Props) {
  return (
    <div className={`result-card result-card--${accent}`}>
      <span className="result-card__label">{label}</span>
      <span className="result-card__value">{value}</span>
      {sub && <span className="result-card__sub">{sub}</span>}
      {children}
    </div>
  )
}
