import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CurrencySelector from '../shared/CurrencySelector'

// Regression: active button text was invisible on hover because `.currency-selector__btn:hover`
// overrode `background` to near-white while `color: white` from `--active` remained.
// These tests verify the active/inactive class contract — if the `--active` class is removed or
// misapplied the CSS fix becomes moot.

describe('CurrencySelector — active class', () => {
  it('applies --active class only to the selected currency', () => {
    render(<CurrencySelector currency="USD" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'USD' })).toHaveClass('currency-selector__btn--active')
    for (const label of ['CAD', 'EUR', 'GBP']) {
      expect(screen.getByRole('button', { name: label })).not.toHaveClass('currency-selector__btn--active')
    }
  })

  it('moves --active class when currency prop changes', () => {
    const { rerender } = render(<CurrencySelector currency="USD" onChange={() => {}} />)
    rerender(<CurrencySelector currency="EUR" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'EUR' })).toHaveClass('currency-selector__btn--active')
    expect(screen.getByRole('button', { name: 'USD' })).not.toHaveClass('currency-selector__btn--active')
  })
})

describe('CurrencySelector — aria-pressed', () => {
  it('sets aria-pressed=true on active button, false on others', () => {
    render(<CurrencySelector currency="CAD" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'CAD' })).toHaveAttribute('aria-pressed', 'true')
    for (const label of ['USD', 'EUR', 'GBP']) {
      expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
    }
  })
})

describe('CurrencySelector — interaction', () => {
  it('calls onChange with the clicked currency', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CurrencySelector currency="USD" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'GBP' }))
    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledWith('GBP')
  })

  it('calls onChange even when clicking the already-active button', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CurrencySelector currency="USD" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'USD' }))
    expect(onChange).toHaveBeenCalledWith('USD')
  })
})
