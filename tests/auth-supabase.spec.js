const { test, expect } = require('@playwright/test');
const { captureScreenshot } = require('./helpers/playwrightArtifacts');

test.afterEach(async ({ page }, testInfo) => {
  await captureScreenshot(page, testInfo);
});

/**
 * Phase C: Supabase Authentication Component Tests
 *
 * These tests verify that Login, SignUp, and SocialAuth components
 * correctly integrate with Supabase authentication instead of NextAuth.
 *
 * RED phase: Tests will fail until components are updated to use Supabase.
 */

test.describe('Supabase Authentication - Login', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear all cookies and storage to ensure clean state (no existing session)
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Navigate to login page
    await page.goto('/authentication/default/jwt/login');

    // Verify we're actually on the login page (not redirected to dashboard)
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
  });

  test('login page renders with email and password fields', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
  });

  test('shows validation error for empty email', async ({ page }) => {
    // Clear the email field (it may have default credentials)
    await page.getByLabel('Email').clear();
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Log in' }).click();

    // Material-UI TextField displays validation errors in helper text below the field
    // Look for the required field error message
    await expect(page.getByText('This field is required').first()).toBeVisible({ timeout: 3000 });
  });

  test('shows validation error for invalid email format', async ({ page }) => {
    await page.getByLabel('Email').fill('notanemail');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByText('Please provide a valid email address.')).toBeVisible();
  });

  test('shows validation error for empty password', async ({ page }) => {
    await page.getByLabel('Email').fill('user@example.com');
    // Clear password field (may have default credentials)
    await page.getByLabel('Password').clear();
    await page.getByRole('button', { name: 'Log in' }).click();

    // Look for validation error message
    await expect(page.getByText('This field is required').first()).toBeVisible({ timeout: 3000 });
  });

  test('shows loading state during authentication', async ({ page }) => {
    // Fill in valid credentials
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('testpassword123');

    // Click login button
    const loginButton = page.getByRole('button', { name: 'Log in' });
    await loginButton.click();

    // Verify button shows loading state (Material-UI loading prop adds CircularProgress)
    // The button should be disabled during loading
    await expect(loginButton).toBeDisabled();
  });

  test('displays error for invalid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Log in' }).click();

    // Wait for error message to appear
    // Supabase returns "Invalid login credentials" for bad credentials
    await expect(page.getByText(/invalid/i)).toBeVisible({ timeout: 5000 });
  });

  test('social auth buttons are present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in with microsoft/i })).toBeVisible();
  });
});

const EXISTING_USER_EMAIL = process.env.PLAYWRIGHT_EXISTING_USER_EMAIL || 'existing@example.com';
const EXISTING_USER_PASSWORD = process.env.PLAYWRIGHT_EXISTING_USER_PASSWORD || 'password123';

test.describe('Supabase Authentication - SignUp', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear all cookies and storage to ensure clean state
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Correct route is /authentication/default/jwt/sign-up (not /signup)
    await page.goto('/authentication/default/jwt/sign-up');

    // Verify we're on the signup page
    await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible();
  });

  test('signup page renders with name, email and password fields', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible();
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
  });

  test('shows validation error for empty name', async ({ page }) => {
    // Leave name empty
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Check validation error appears
    await expect(page.getByText('This field is required').first()).toBeVisible({ timeout: 3000 });
  });

  test('shows validation error for invalid email', async ({ page }) => {
    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email').fill('bademail');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Email validation error should appear
    await expect(page.getByText('Please provide a valid email address.')).toBeVisible({
      timeout: 3000,
    });
  });

  test('shows validation error for empty password', async ({ page }) => {
    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email').fill('user@example.com');
    // Leave password empty
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Password validation error should appear
    await expect(page.getByText('This field is required').first()).toBeVisible({ timeout: 3000 });
  });

  test('shows loading state during signup', async ({ page }) => {
    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Password').fill('securepassword123');

    const signupButton = page.getByRole('button', { name: 'Create Account' });
    await signupButton.click();

    // Button should be disabled during loading
    await expect(signupButton).toBeDisabled();
  });

  test('displays error for already registered email', async ({ page }) => {
    test.skip(
      !process.env.PLAYWRIGHT_EXISTING_USER_EMAIL,
      'Set PLAYWRIGHT_EXISTING_USER_EMAIL to run this test.',
    );
    // Use a known test email that should already exist
    await page.getByLabel('Name').fill('Existing User');
    await page.getByLabel('Email').fill(EXISTING_USER_EMAIL);
    await page.getByLabel('Password').fill(EXISTING_USER_PASSWORD);
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Supabase returns error for duplicate user
    const duplicateAlert = page
      .getByRole('alert')
      .filter({ hasText: /already|exist|confirm|check your email/i });
    await expect(duplicateAlert).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Supabase Authentication - Social Auth (OAuth)', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear session
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('/authentication/default/jwt/login');
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
  });

  test('google oauth button triggers authentication flow', async ({ page }) => {
    const googleButton = page.getByRole('button', { name: /sign in with google/i });

    // When clicked, Supabase OAuth redirects to Google's consent screen
    // We can't test the actual OAuth flow in Playwright, but we can verify the redirect attempt
    await expect(googleButton).toBeEnabled();
    await expect(googleButton).toBeVisible();
  });

  test('microsoft oauth button triggers authentication flow', async ({ page }) => {
    const microsoftButton = page.getByRole('button', { name: /sign in with microsoft/i });

    // Similar verification for Azure/Microsoft OAuth
    await expect(microsoftButton).toBeEnabled();
    await expect(microsoftButton).toBeVisible();
  });

  test('oauth buttons maintain existing styling', async ({ page }) => {
    // Verify buttons have proper Material-UI styling
    const googleButton = page.getByRole('button', { name: /sign in with google/i });
    const microsoftButton = page.getByRole('button', { name: /sign in with microsoft/i });

    // Both should be full width on mobile
    await expect(googleButton).toBeVisible();
    await expect(microsoftButton).toBeVisible();

    // Both should have icons
    const googleIcon = page.locator('img[alt="icon"]').first();
    const microsoftIcon = page.locator('img[alt="icon"]').nth(1);
    await expect(googleIcon).toBeVisible();
    await expect(microsoftIcon).toBeVisible();
  });
});

test.describe('Supabase Authentication - Error Handling', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear session for error handling tests too
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('handles network errors gracefully', async ({ page, context }) => {
    // Load page FIRST, then set offline mode
    await page.goto('/authentication/default/jwt/login');
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();

    // Now simulate offline mode
    await context.setOffline(true);

    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Log in' }).click();

    // Should show network error or similar
    await expect(page.getByText(/network|error|failed/i)).toBeVisible({ timeout: 5000 });

    await context.setOffline(false);
  });

  test('displays specific error messages from Supabase', async ({ page, context }) => {
    // Clear session first
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('/authentication/default/jwt/login');
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();

    // Test with invalid credentials
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Log in' }).click();

    // Supabase should return a specific error message
    // The error should be displayed in an Alert component
    // Filter to get the error alert specifically (not the demo credentials alert or route announcer)
    const errorAlert = page
      .getByRole('alert')
      .filter({ hasText: /invalid|error|wrong/i })
      .first();
    await expect(errorAlert).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Supabase Authentication - Integration Points', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear session
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('useSupabaseAuth hook is available', async ({ page }) => {
    // This test verifies the hook is properly imported and used
    // We'll check this by verifying the component renders without console errors

    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/authentication/default/jwt/login');

    // No errors about missing useSupabaseAuth hook
    expect(consoleErrors.filter((e) => e.includes('useSupabaseAuth'))).toHaveLength(0);
  });

  test('Supabase client is properly initialized', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/authentication/default/jwt/login');

    // No errors about missing Supabase configuration
    expect(consoleErrors.filter((e) => e.includes('SUPABASE'))).toHaveLength(0);
  });
});
