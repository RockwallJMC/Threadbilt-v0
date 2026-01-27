const { test, expect } = require('@playwright/test');

test.describe('PierceDesk smoke checks', () => {
  test('home dashboard renders greeting', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Good morning/i)).toBeVisible();
  });

  test('documentation introduction renders', async ({ page }) => {
    await page.goto('/documentation/introduction');
    await expect(page.getByRole('heading', { name: 'Introduction' })).toBeVisible();
    await expect(page.getByText('On this page')).toBeVisible();
  });

  test('component docs buttons render', async ({ page }) => {
    await page.goto('/component-docs/button');
    await expect(page.getByRole('heading', { name: 'Buttons' })).toBeVisible();
    await expect(page.getByText('On this page')).toBeVisible();
  });

  test('unknown route shows 404', async ({ page }) => {
    await page.goto('/route-does-not-exist');
    await expect(page.getByText('Page not found')).toBeVisible();
  });
});
