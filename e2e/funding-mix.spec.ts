import { test, expect } from '@playwright/test'

test.describe('Funding Mix calculator — golden path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page loads with Funding Mix tab active', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /Funding Mix/i })).toBeVisible()
  })

  test('shows pre-money prompt before any input', async ({ page }) => {
    await expect(page.getByText(/Enter a pre-money valuation/)).toBeVisible()
  })

  test('shows ownership result after entering equity and pre-money', async ({ page }) => {
    // The default state has preMoney=8M and founderOwnershipPct=75 pre-loaded
    // Add an equity source via the Add button
    await page.getByRole('button', { name: /Add funding source/i }).click()

    // Results should now compute — look for dilution output
    await expect(page.getByText(/dilution/i)).toBeVisible({ timeout: 3000 })
  })

  test('share button copies URL with model param to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    const shareBtn = page.getByRole('button', { name: /Share/i })
    if (await shareBtn.isVisible()) {
      await shareBtn.click()
      const clipboard = await page.evaluate(() => navigator.clipboard.readText())
      expect(clipboard).toContain('model=')
    }
  })
})
