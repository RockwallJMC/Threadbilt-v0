/**
 * Authentication Helper for Playwright Tests
 * Provides login functionality for test users
 */

/**
 * Logs in a user via the login page
 * @param {Page} page - Playwright page object
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {BrowserContext} context - Playwright browser context
 */
export async function loginUser(page, email, password, context) {
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
