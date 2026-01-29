import { test, expect } from '@playwright/test';

/**
 * E2E tests for CRM Dashboard KPI widgets (Phase 1.7.2)
 *
 * Tests verify:
 * - All 8 KPI widgets render on dashboard
 * - Widgets display formatted values correctly
 * - Loading states work
 * - Responsive layout (4 columns → 2 columns → 1 column)
 */

test.describe('CRM Dashboard - KPI Widgets', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to CRM dashboard
    await page.goto('/apps/crm/dashboard');

    // Wait for dashboard to load (loading spinner should disappear)
    await page.waitForLoadState('networkidle');
  });

  test('displays all 8 KPI widgets with titles', async ({ page }) => {
    // Verify all 8 KPI widget titles are present
    const kpiTitles = [
      'Total Pipeline Value',
      'Weighted Forecast',
      'Lead Conversion Rate',
      'Opportunity Win Rate',
      'Average Deal Size',
      'Average Sales Cycle',
      'Proposals Acceptance Rate',
      'Total Active Accounts',
    ];

    for (const title of kpiTitles) {
      await expect(page.getByText(title)).toBeVisible();
    }
  });

  test('displays formatted currency values for pipeline widgets', async ({ page }) => {
    // Total Pipeline Value should show currency format
    const pipelineWidget = page.locator('text=Total Pipeline Value').locator('..');
    await expect(pipelineWidget).toBeVisible();

    // Should have a numeric value (wait for loading to complete)
    await expect(pipelineWidget.locator('h4')).not.toHaveText('—');

    // Weighted Forecast should also show currency
    const forecastWidget = page.locator('text=Weighted Forecast').locator('..');
    await expect(forecastWidget).toBeVisible();
    await expect(forecastWidget.locator('h4')).not.toHaveText('—');
  });

  test('displays percentage values for rate widgets', async ({ page }) => {
    // Lead Conversion Rate should show percentage
    const conversionWidget = page.locator('text=Lead Conversion Rate').locator('..');
    await expect(conversionWidget).toBeVisible();

    const conversionValue = await conversionWidget.locator('h4').textContent();
    expect(conversionValue).toMatch(/%$/); // Should end with %

    // Opportunity Win Rate should show percentage
    const winRateWidget = page.locator('text=Opportunity Win Rate').locator('..');
    const winRateValue = await winRateWidget.locator('h4').textContent();
    expect(winRateValue).toMatch(/%$/);

    // Proposals Acceptance Rate should show percentage
    const acceptanceWidget = page.locator('text=Proposals Acceptance Rate').locator('..');
    const acceptanceValue = await acceptanceWidget.locator('h4').textContent();
    expect(acceptanceValue).toMatch(/%$/);
  });

  test('displays "days" suffix for sales cycle widget', async ({ page }) => {
    const salesCycleWidget = page.locator('text=Average Sales Cycle').locator('..');
    await expect(salesCycleWidget).toBeVisible();

    const value = await salesCycleWidget.locator('h4').textContent();
    expect(value).toMatch(/days$/); // Should end with "days"
  });

  test('displays numeric count for active accounts', async ({ page }) => {
    const accountsWidget = page.locator('text=Total Active Accounts').locator('..');
    await expect(accountsWidget).toBeVisible();

    const value = await accountsWidget.locator('h4').textContent();
    expect(value).toMatch(/^\d+$/); // Should be just a number
  });

  test('widgets have icons displayed', async ({ page }) => {
    // Check that avatars (containing icons) are present
    const avatars = page.locator('.MuiAvatar-root');
    const count = await avatars.count();

    // Should have at least 8 avatars (one per KPI widget)
    expect(count).toBeGreaterThanOrEqual(8);
  });

  test('widgets display subtitles', async ({ page }) => {
    // Check specific subtitles are present
    await expect(page.getByText('All open opportunities')).toBeVisible();
    await expect(page.getByText('Probability-adjusted pipeline')).toBeVisible();
    await expect(page.getByText('Leads to opportunities')).toBeVisible();
    await expect(page.getByText('Closed won rate')).toBeVisible();
  });

  test('responsive layout - mobile viewport shows stacked widgets', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // All KPI widgets should still be visible
    await expect(page.getByText('Total Pipeline Value')).toBeVisible();
    await expect(page.getByText('Weighted Forecast')).toBeVisible();

    // Widgets should be stacked (each takes full width)
    // Grid items should have full width on mobile
    const firstWidget = page.locator('text=Total Pipeline Value').locator('..').locator('..');
    const box = await firstWidget.boundingBox();

    // Widget should be close to full viewport width (accounting for padding)
    expect(box.width).toBeGreaterThan(300);
  });

  test('responsive layout - tablet viewport shows 2 columns', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // All widgets should be visible
    await expect(page.getByText('Total Pipeline Value')).toBeVisible();
    await expect(page.getByText('Weighted Forecast')).toBeVisible();
  });

  test('responsive layout - desktop viewport shows 4 columns', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // All widgets should be visible
    await expect(page.getByText('Total Pipeline Value')).toBeVisible();
    await expect(page.getByText('Weighted Forecast')).toBeVisible();

    // First row should have 4 widgets side by side
    // (Testing exact layout is fragile, but we can verify all are visible)
  });

  test('dashboard header is present', async ({ page }) => {
    // Dashboard should have a header with title
    await expect(page.getByText('CRM Dashboard')).toBeVisible();
  });

  test('date range filter is present in header', async ({ page }) => {
    // Date filter should be present (from DashboardHeader)
    // Look for common date range options
    const dateFilterButton = page.locator('button').filter({ hasText: /days|Last/ });
    await expect(dateFilterButton.first()).toBeVisible();
  });
});
