import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RunwayResults from '../../features/runway/RunwayResults'
import type { RunwayResult } from '../../lib/types'

const notPositiveResult: RunwayResult = {
  error: 'NET_BURN_NOT_POSITIVE',
  message: 'Runway not limited at current net burn',
  netBurn: 0,
  currentRunwayMonths: Infinity,
  cashOutDate: null,
  awardScenario: null,
  capitalTo18Months: null,
  capitalTo24Months: null,
}

const validResult: RunwayResult = {
  error: null,
  netBurn: 45_000,
  currentRunwayMonths: 8.888,
  cashOutDate: new Date(2026, 6, 1),
  awardScenario: null,
  capitalTo18Months: 410_000,
  capitalTo24Months: 680_000,
}

const cashOutResult: RunwayResult = {
  error: null,
  netBurn: 45_000,
  currentRunwayMonths: 3.333,
  cashOutDate: new Date(2026, 3, 1),
  awardScenario: {
    type: 'CASH_OUT_BEFORE_AWARD',
    message: 'Cash out before pending award arrives. Primary runway excludes this grant.',
    bridgeNeeded: 255_000,
    bridgeFundedRunway: 15.11,
    timingMidpoint: 9,
  },
  capitalTo18Months: 660_000,
  capitalTo24Months: 930_000,
}

describe('RunwayResults — null', () => {
  it('renders nothing when result is null', () => {
    const { container } = render(<RunwayResults result={null} currency="USD" />)
    expect(container.firstChild).toBeNull()
  })
})

describe('RunwayResults — NET_BURN_NOT_POSITIVE', () => {
  it('renders "Not limited" status card', () => {
    render(<RunwayResults result={notPositiveResult} currency="USD" />)
    expect(screen.getByText('Not limited')).toBeInTheDocument()
  })
})

describe('RunwayResults — valid result', () => {
  it('renders currentRunwayMonths formatted as "8.9 mo"', () => {
    render(<RunwayResults result={validResult} currency="USD" />)
    expect(screen.getByText('8.9 mo')).toBeInTheDocument()
  })

  it('renders capital to 18 months card', () => {
    render(<RunwayResults result={validResult} currency="USD" />)
    expect(screen.getByText(/Capital needed — 18 months/)).toBeInTheDocument()
  })
})

describe('RunwayResults — CASH_OUT_BEFORE_AWARD', () => {
  it('renders warning card label', () => {
    render(<RunwayResults result={cashOutResult} currency="USD" />)
    expect(screen.getByText(/Warning — cash out before award arrives/)).toBeInTheDocument()
  })

  it('renders bridge needed amount', () => {
    render(<RunwayResults result={cashOutResult} currency="USD" />)
    expect(screen.getByText('$255K')).toBeInTheDocument()
  })
})
