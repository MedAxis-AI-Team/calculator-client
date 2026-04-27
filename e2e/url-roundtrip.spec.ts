import { test, expect } from '@playwright/test'

// Scenario A encoded: preMoney=8M, founderOwnershipPct=100, equity=2M → dilution 20.0%
const SCENARIO_A_ENCODED = btoa(JSON.stringify({
  version: 1,
  activeTab: 'funding_mix',
  currency: 'USD',
  company: { preMoney: 8_000_000, founderOwnershipPct: 100 },
  fundingSources: [{ id: 'equity', type: 'equity', amount: 2_000_000 }],
  runway: { cashOnHand: 0, monthlyBurn: 0, monthlyInflows: 0, pendingAwardAmount: 0, pendingTiming: 'uncertain' },
}))

test.describe('URL round-trip — state hydration', () => {
  test('loads Scenario A from URL and shows 20.0% dilution result', async ({ page }) => {
    await page.goto(`/?model=${SCENARIO_A_ENCODED}`)
    // Founder ownership = 80.0% (100% × (1 - 20%))
    await expect(page.getByText('80.0%')).toBeVisible({ timeout: 5000 })
  })

  test('invalid model param falls back to default state', async ({ page }) => {
    await page.goto('/?model=!!!invalid!!!')
    // Should still load without crashing
    await expect(page.getByRole('tab', { name: /Funding Mix/i })).toBeVisible()
  })
})
