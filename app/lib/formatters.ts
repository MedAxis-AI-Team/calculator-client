import type { Currency } from './types'

/** Returns the currency prefix symbol for a given currency code (e.g. 'USD' → '$'). */
export function getCurrencySymbol(currency: Currency): string {
  const symbols: Record<Currency, string> = { USD: '$', CAD: 'CA$', EUR: '€', GBP: '£' }
  return symbols[currency] ?? '$'
}

/** Formats a number as a compact currency string (e.g. 1500000 → '$1.5M', 45000 → '$45K'). */
export function formatCurrency(value: number, currency: Currency = 'USD'): string {
  const symbol = getCurrencySymbol(currency)
  if (value >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${symbol}${(value / 1_000).toFixed(0)}K`
  return `${symbol}${value.toLocaleString()}`
}

/** Formats a percentage to one decimal place (e.g. 13.04 → '13.0%'). */
export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`
}

/** Formats a month count to one decimal place, returning '∞' for Infinity. */
export function formatMonths(value: number): string {
  if (value === Infinity) return '∞'
  return `${value.toFixed(1)} mo`
}

/** Formats a date as 'Mon YYYY' (e.g. 'Jun 2026'), returning '—' for null. */
export function formatDate(date: Date | null): string {
  if (!date) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
