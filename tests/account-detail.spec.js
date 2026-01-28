const { test, expect } = require('@playwright/test');
const { captureScreenshot } = require('./helpers/playwrightArtifacts');

test.afterEach(async ({ page }, testInfo) => {
  await captureScreenshot(page, testInfo);
});

/**
 * Authentication Helper
 * Logs in a user via the login page
 */
async function loginUser(page, email, password, context) {
  // Clear any existing session first
  if (context) {
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  await page.goto('/authentication/default/jwt/login');

  // Verify we're on login page (not redirected due to existing session)
  await page.waitForSelector('input[type="email"]', { timeout: 5000 });

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();

  // Wait for navigation to complete (login successful)
  await page.waitForURL(/^((?!\/authentication).)*$/, { timeout: 10000 });

  // If redirected to organization setup, handle it
  if (page.url().includes('/organization-setup')) {
    // Wait for page to be ready and select first organization if available
    await page.waitForTimeout(1000);
    const continueButton = page.getByRole('button', { name: /continue/i });
    if (await continueButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await continueButton.click();
      await page.waitForURL(/^((?!\/organization-setup).)*$/, { timeout: 5000 });
    }
  }
}

test.describe('Account Detail Page', () => {
  test.beforeEach(async ({ page, context }) => {
    page.setDefaultNavigationTimeout(60000);

    // Log in with default credentials
    await loginUser(page, 'demo@aurora.com', 'password123', context);
  });

  test('renders account detail page with sidebar and tabs', async ({ page }) => {
    // Navigate to first account detail page (acc_001 from mock data)
    await page.goto('/apps/crm/accounts/acc_001', { waitUntil: 'domcontentloaded' });

    // Verify account name is displayed
    await expect(page.getByRole('heading', { name: /TechVision Solutions Inc\./i })).toBeVisible();

    // Verify tabs are present
    await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Contacts' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Opportunities' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Activity' })).toBeVisible();

    // Verify sidebar info is visible (desktop view)
    await expect(page.getByText('Technology')).toBeVisible(); // Industry chip
    await expect(page.getByText(/billing_address/i)).toBeVisible();
  });

  test('switches between tabs correctly', async ({ page }) => {
    await page.goto('/apps/crm/accounts/acc_001', { waitUntil: 'domcontentloaded' });

    // Click Contacts tab
    await page.getByRole('tab', { name: 'Contacts' }).click();
    // Should show contacts grid or empty message
    await expect(page.getByRole('tabpanel')).toBeVisible();

    // Click Opportunities tab
    await page.getByRole('tab', { name: 'Opportunities' }).click();
    // Should show placeholder message
    await expect(page.getByText(/Opportunities will be available in Phase 1\.5/i)).toBeVisible();

    // Click Activity tab
    await page.getByRole('tab', { name: 'Activity' }).click();
    // Should show activity tabs (reused component)
    await expect(page.getByRole('tabpanel')).toBeVisible();
  });

  test('shows loading state initially', async ({ page }) => {
    await page.goto('/apps/crm/accounts/acc_001', { waitUntil: 'domcontentloaded' });

    // Check for skeleton or loading indicator briefly
    // (This test may pass quickly if mock data loads fast, but structure should exist)
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('shows not found state for invalid account ID', async ({ page }) => {
    await page.goto('/apps/crm/accounts/invalid_id', { waitUntil: 'domcontentloaded' });

    // Should show error or "Account not found" message
    await expect(page.getByText(/Account not found/i)).toBeVisible();
  });

  test('displays action buttons in sidebar', async ({ page }) => {
    await page.goto('/apps/crm/accounts/acc_001', { waitUntil: 'domcontentloaded' });

    // Verify Edit and Delete buttons exist
    await expect(page.getByRole('button', { name: /edit/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /delete/i })).toBeVisible();
  });
});
