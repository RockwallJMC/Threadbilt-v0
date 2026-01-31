import { test, expect } from '@playwright/test';

test.describe('Phase 1.4 - Deal Details Hooks', () => {
  test('useCRMDealApi hook fetches and caches deal data', async ({ page }) => {
    await page.goto('/apps/crm/deal-details?id=test-deal-id');

    // Wait for data to load
    await page.waitForSelector('[data-testid="deal-name"]');

    // Verify deal data rendered
    const dealName = await page.textContent('[data-testid="deal-name"]');
    expect(dealName).toBeTruthy();

    // Verify nested contact rendered
    await expect(page.locator('[data-testid="associated-contact"]')).toBeVisible();

    // Verify company rendered
    await expect(page.locator('[data-testid="account-name"]')).toBeVisible();

    // Verify collaborators rendered
    await expect(page.locator('[data-testid="deal-owner"]')).toBeVisible();
  });

  test('useCRMDealApi handles loading state', async ({ page }) => {
    await page.goto('/apps/crm/deal-details?id=test-deal-id');

    // Should show loading initially
    await expect(page.locator('[data-testid="loading-skeleton"]')).toBeVisible();
  });

  test('useCRMDealApi handles error state', async ({ page }) => {
    await page.goto('/apps/crm/deal-details?id=invalid-id');

    // Should show error
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});
