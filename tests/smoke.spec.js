const { test, expect } = require('@playwright/test');
const { captureScreenshot } = require('./helpers/playwrightArtifacts');

test.afterEach(async ({ page }, testInfo) => {
  await captureScreenshot(page, testInfo);
});

test.describe('PierceDesk smoke checks', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultNavigationTimeout(60000);
  });

  test('home dashboard renders greeting', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Good morning/i)).toBeVisible();
  });

  test('documentation introduction renders', async ({ page }) => {
    await page.goto('/documentation/introduction', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Introduction' })).toBeVisible();
    await expect(page.getByText('On this page')).toBeVisible();
  });

  test('component docs buttons render', async ({ page }) => {
    await page.goto('/component-docs/button', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Buttons' })).toBeVisible();
    await expect(page.getByText('On this page')).toBeVisible();
  });

  test('unknown route shows 404', async ({ page }) => {
    await page.goto('/route-does-not-exist');
    await expect(page.getByText('Page not found')).toBeVisible();
  });
});
