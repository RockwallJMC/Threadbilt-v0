import { test, expect } from '@playwright/test';
import { TEST_USERS, TEST_ORGS } from './helpers/crm-test-data.js';

test.describe('Supabase Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByLabel('Email').fill(TEST_USERS.salesManager.email);
    await page.getByLabel('Password').fill(TEST_USERS.salesManager.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should redirect to organization selection or dashboard
    await expect(page).toHaveURL(/\/(organizations|dashboard)/);
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('WrongPassword123!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should show error message
    await expect(page.getByRole('alert')).toContainText(/invalid credentials|email or password/i);
  });

  test('should create new organization on first login', async ({ page }) => {
    // Login as new user without organization
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill(TEST_USERS.salesRep.email);
    await page.getByLabel('Password').fill(TEST_USERS.salesRep.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should show create organization form
    await expect(page.getByRole('heading', { name: /create organization/i })).toBeVisible();

    // Fill organization details
    await page.getByLabel('Organization Name').fill('Test Company Inc');
    await page.getByLabel('Slug').fill('test-company');
    await page.getByRole('button', { name: 'Create Organization' }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should switch between organizations', async ({ page }) => {
    // Login and select first org
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill(TEST_USERS.salesManager.email);
    await page.getByLabel('Password').fill(TEST_USERS.salesManager.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.getByRole('menuitem', { name: TEST_ORGS.acme.name }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Switch to second org
    await page.getByRole('button', { name: /organization/i }).click();
    await page.getByRole('menuitem', { name: TEST_ORGS.globex.name }).click();

    // Should reload with new org context
    await expect(page.getByText(TEST_ORGS.globex.name)).toBeVisible();
  });

  test('should logout and clear session', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill(TEST_USERS.salesManager.email);
    await page.getByLabel('Password').fill(TEST_USERS.salesManager.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

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
