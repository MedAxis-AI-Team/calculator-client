import { describe, it, expect } from 'vitest'
import { getCurrencySymbol, formatCurrency, formatPct, formatMonths, formatDate } from '../formatters'

describe('getCurrencySymbol', () => {
  it('returns $ for USD', () => expect(getCurrencySymbol('USD')).toBe('$'))
  it('returns CA$ for CAD', () => expect(getCurrencySymbol('CAD')).toBe('CA$'))
  it('returns € for EUR', () => expect(getCurrencySymbol('EUR')).toBe('€'))
  it('returns £ for GBP', () => expect(getCurrencySymbol('GBP')).toBe('£'))
})

describe('formatCurrency', () => {
  it('formats millions', () => expect(formatCurrency(2_000_000, 'USD')).toBe('$2.0M'))
  it('formats thousands', () => expect(formatCurrency(275_000, 'USD')).toBe('$275K'))
  it('uses currency symbol for CAD millions', () => expect(formatCurrency(1_500_000, 'CAD')).toBe('CA$1.5M'))
  it('uses currency symbol for GBP thousands', () => expect(formatCurrency(50_000, 'GBP')).toBe('£50K'))
  it('uses currency symbol for EUR thousands', () => expect(formatCurrency(100_000, 'EUR')).toBe('€100K'))
  it('rounds thousands to integer', () => expect(formatCurrency(123_456, 'USD')).toBe('$123K'))
  it('shows one decimal for millions', () => expect(formatCurrency(1_234_567, 'USD')).toBe('$1.2M'))
})

describe('formatPct', () => {
  it('formats whole number', () => expect(formatPct(20)).toBe('20.0%'))
  it('formats decimal', () => expect(formatPct(13.043)).toBe('13.0%'))
  it('formats zero', () => expect(formatPct(0)).toBe('0.0%'))
  it('formats 100', () => expect(formatPct(100)).toBe('100.0%'))
})

describe('formatMonths', () => {
  it('returns ∞ for Infinity', () => expect(formatMonths(Infinity)).toBe('∞'))
  it('formats decimal months', () => expect(formatMonths(8.888)).toBe('8.9 mo'))
  it('formats whole months', () => expect(formatMonths(15)).toBe('15.0 mo'))
  it('formats zero', () => expect(formatMonths(0)).toBe('0.0 mo'))
  // Intentional deviation from reference: reference returns "8.9 months" (full word).
  // We use "mo" as a UI abbreviation. Copy summary uses .toFixed(1) + " months" directly.
  it('uses "mo" abbreviation, not full "months" word', () => {
    expect(formatMonths(8.888)).not.toContain('months')
    expect(formatMonths(8.888)).toContain('mo')
  })
})

describe('formatDate', () => {
  it('returns em-dash for null', () => expect(formatDate(null)).toBe('—'))
  it('returns short month + year string', () => {
    const d = new Date(2026, 0, 1) // Jan 2026
    const result = formatDate(d)
    expect(result).toMatch(/Jan/)
    expect(result).toMatch(/2026/)
  })
})
