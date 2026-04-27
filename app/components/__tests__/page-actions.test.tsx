import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Regression: "Share URL" and "Copy Summary" buttons previously gave no visual
// feedback after a successful clipboard write — users saw nothing happen.
// These tests verify the `copiedBtn` state change: buttons show "Copied!" after
// a click and revert to their original label once the 1.5 s timeout fires.

vi.mock('posthog-js/react', () => ({ usePostHog: () => null }))

const { default: CalculatorPage } = await import('../../page')

beforeEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    configurable: true,
    writable: true,
  })
})

describe('Share URL button — copy feedback', () => {
  it('shows "Copied!" after a successful clipboard write', async () => {
    const user = userEvent.setup()
    render(<CalculatorPage />)
    await user.click(screen.getByRole('button', { name: 'Share URL' }))
    expect(await screen.findByRole('button', { name: 'Copied!' })).toBeInTheDocument()
  })

  it('reverts to "Share URL" after 1.5 seconds', async () => {
    const user = userEvent.setup()
    render(<CalculatorPage />)
    await user.click(screen.getByRole('button', { name: 'Share URL' }))
    await screen.findByRole('button', { name: 'Copied!' })
    // Wait for the real 1.5 s setTimeout to fire
    await screen.findByRole('button', { name: 'Share URL' }, { timeout: 2500 })
  }, 4000)
})

describe('Copy Summary button — copy feedback', () => {
  it('shows "Copied!" after a successful clipboard write', async () => {
    const user = userEvent.setup()
    render(<CalculatorPage />)
    await user.click(screen.getByRole('button', { name: 'Copy Summary' }))
    expect(await screen.findByRole('button', { name: 'Copied!' })).toBeInTheDocument()
  })

  it('reverts to "Copy Summary" after 1.5 seconds', async () => {
    const user = userEvent.setup()
    render(<CalculatorPage />)
    await user.click(screen.getByRole('button', { name: 'Copy Summary' }))
    await screen.findByRole('button', { name: 'Copied!' })
    await screen.findByRole('button', { name: 'Copy Summary' }, { timeout: 2500 })
  }, 4000)
})
