import { test, expect } from '@playwright/test';
import { TEST_ORGS } from './helpers/multi-tenant-setup.js';

test.describe('Supabase Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/authentication/default/jwt/login');

    await page.getByLabel('Email').fill(TEST_ORGS.ACME.users.admin);
    await page.getByLabel('Password').fill(TEST_ORGS.ACME.password);
    await page.getByRole('button', { name: 'Log in' }).click();

    // Should redirect to CRM dashboard
    await expect(page).toHaveURL(/\/apps\/crm/);
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/authentication/default/jwt/login');

    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('WrongPassword123!');
    await page.getByRole('button', { name: 'Log in' }).click();

    // Should show error message
    await expect(
      page
        .getByRole('alert')
        .filter({ hasText: /invalid credentials|email or password/i })
        .first(),
    ).toBeVisible();
  });

  test.skip('should create new organization on first login', async ({ page }) => {
    // TODO: Re-enable when we have a user without organization memberships
    // Currently all seeded users have organization memberships
    await page.goto('/authentication/default/jwt/login');
  });

  test.skip('should switch between organizations', async ({ page }) => {
    // TODO: Re-enable when we have a user with multiple organization memberships
    // Currently seeded users belong to single organizations
    await page.goto('/authentication/default/jwt/login');
  });

  test('should logout and clear session', async ({ page }) => {
    await page.goto('/authentication/default/jwt/login');
    await page.getByLabel('Email').fill(TEST_ORGS.ACME.users.admin);
    await page.getByLabel('Password').fill(TEST_ORGS.ACME.password);
    await page.getByRole('button', { name: 'Log in' }).click();

    // Wait for redirect after login
    await page.waitForURL(/^((?!\/authentication).)*$/, { timeout: 10000 });

    // Click profile menu and logout
    await page.getByRole('button', { name: /profile|account/i }).click();
    await page.getByRole('menuitem', { name: /logout|sign out/i }).click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/);

    // Should not be able to access protected route
    await page.goto('/dashboard/crm');
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
