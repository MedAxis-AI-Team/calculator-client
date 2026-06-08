import { test, expect } from '@playwright/test'

// Scenario C encoded: cash=400K, burn=45K → 8.9 months runway
const SCENARIO_C_ENCODED = btoa(JSON.stringify({
  version: 1,
  activeTab: 'runway',
  currency: 'USD',
  company: { preMoney: 8_000_000, founderOwnershipPct: 75 },
  fundingSources: [],
  runway: { cashOnHand: 400_000, monthlyBurn: 45_000, monthlyInflows: 0, pendingAwardAmount: 0, pendingTiming: 'uncertain' },
}))

// Scenario E encoded: cash=150K, burn=45K, award=275K, timing=6-12 → CASH_OUT_BEFORE_AWARD
const SCENARIO_E_ENCODED = btoa(JSON.stringify({
  version: 1,
  activeTab: 'runway',
  currency: 'USD',
  company: { preMoney: 8_000_000, founderOwnershipPct: 75 },
  fundingSources: [],
  runway: { cashOnHand: 150_000, monthlyBurn: 45_000, monthlyInflows: 0, pendingAwardAmount: 275_000, pendingTiming: '6-12' },
}))

test.describe('Runway tab — URL-loaded scenarios', () => {
  test('Scenario C: shows 8.9 months runway from URL state', async ({ page }) => {
    await page.goto(`/?model=${SCENARIO_C_ENCODED}`)
    await expect(page.getByText(/8\.9/)).toBeVisible({ timeout: 5000 })
  })

  test('Scenario E: shows CASH_OUT_BEFORE_AWARD warning from URL state', async ({ page }) => {
    await page.goto(`/?model=${SCENARIO_E_ENCODED}`)
    await expect(page.getByText(/cash out before/i)).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Runway tab — navigation', () => {
  test('switches to Runway tab and shows input fields', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: /Runway/i }).click()
    await expect(page.getByText(/Cash on hand/i)).toBeVisible()
    await expect(page.getByText(/Monthly burn/i)).toBeVisible()
  })
})
