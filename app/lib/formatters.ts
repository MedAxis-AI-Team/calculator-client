import type { Currency } from './types'

export function getCurrencySymbol(currency: Currency): string {
  const symbols: Record<Currency, string> = { USD: '$', CAD: 'CA$', EUR: '€', GBP: '£' }
  return symbols[currency] ?? '$'
}

export function formatCurrency(value: number, currency: Currency = 'USD'): string {
  const symbol = getCurrencySymbol(currency)
  if (value >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${symbol}${(value / 1_000).toFixed(0)}K`
  return `${symbol}${value.toLocaleString()}`
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatMonths(value: number): string {
  if (value === Infinity) return '∞'
  return `${value.toFixed(1)} mo`
}

export function formatDate(date: Date | null): string {
  if (!date) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
