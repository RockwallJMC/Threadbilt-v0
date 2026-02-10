/**
 * Multi-Tenant Testing Helpers
 *
 * Provides test data and utilities for multi-tenant RLS testing.
 * Uses real Supabase data from seed files (Task 1).
 */

/**
 * Test Organizations with Real User Credentials
 * These match the seed data created in Task 1
 */
export const TEST_ORGS = {
  ACME: {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Acme Corporation',
    users: {
      admin: 'admin@acme-corp.com',
      sales: 'sales@acme-corp.com',
      manager: 'manager@acme-corp.com',
    },
    password: 'TestPass123!',
  },
  TECHSTART: {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'TechStart Industries',
    users: {
      ceo: 'ceo@techstart.com',
      rep: 'rep@techstart.com',
    },
    password: 'TestPass123!',
  },
};

/**
 * Test Data IDs (match seed files from Task 1)
 * These IDs correspond to actual records in the Supabase database
 */
export const TEST_DATA = {
  // Acme Corporation Data
  ACME_LEAD: {
    id: 'l1000000-0000-0000-0000-000000000001',
    name: 'Michael Johnson',
    company: 'NewCorp Inc',
    email: 'michael.johnson@newcorp.com',
  },
  ACME_OPPORTUNITY: {
    id: 'o1000000-0000-0000-0000-000000000001',
    name: 'NewCorp Digital Transformation',
    value: 125000,
  },
  ACME_PROPOSAL: {
    id: 'p1000000-0000-0000-0000-000000000001',
    proposalNumber: 'PROP-2026-0001',
    total: 125000,
  },
  ACME_CONTACT: {
    id: 'c1000000-0000-0000-0000-000000000001',
    firstName: 'Jennifer',
    lastName: 'Smith',
    email: 'jennifer.smith@acme-customers.com',
  },
  ACME_ACCOUNT: {
    id: 'a1000000-0000-0000-0000-000000000001',
    name: 'Acme Customer Corp',
    industry: 'Technology',
  },

  // TechStart Industries Data
  TECHSTART_LEAD: {
    id: 'l2000000-0000-0000-0000-000000000001',
    name: 'Emily Davis',
    company: 'Growth Inc',
    email: 'emily.davis@growthinc.com',
  },
  TECHSTART_OPPORTUNITY: {
    id: 'o2000000-0000-0000-0000-000000000001',
    name: 'Growth Inc Expansion Project',
    value: 200000,
  },
  TECHSTART_PROPOSAL: {
    id: 'p2000000-0000-0000-0000-000000000001',
    proposalNumber: 'PROP-2026-1001',
    total: 200000,
  },
  TECHSTART_CONTACT: {
    id: 'c2000000-0000-0000-0000-000000000001',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@techstart-customers.com',
  },
  TECHSTART_ACCOUNT: {
    id: 'a2000000-0000-0000-0000-000000000001',
    name: 'TechStart Customer LLC',
    industry: 'Manufacturing',
  },

  // Acme Corporation Projects
  ACME_PROJECT: {
    id: 'pr100000-0000-0000-0000-000000000001',
    name: 'Website Redesign Project',
  },

  // TechStart Industries Projects
  TECHSTART_PROJECT: {
    id: 'pr200000-0000-0000-0000-000000000001',
    name: 'Mobile App Development',
  },
};

/**
 * Login as an organization user
 * Uses the existing authHelper login flow
 *
 * @param {Page} page - Playwright page object
 * @param {string} org - Organization key ('ACME' or 'TECHSTART')
 * @param {string} userRole - User role key ('admin', 'sales', etc.)
 */
export async function loginAsOrgUser(page, org, userRole) {
  const email = TEST_ORGS[org].users[userRole];
  const password = TEST_ORGS[org].password;

  // Navigate to login page first
  await page.goto('http://localhost:4000/authentication/default/jwt/login');

  // Clear any existing session after navigation
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // Wait for login page to be ready
  await page.waitForSelector('input[type="email"]', { timeout: 5000 });

  // Fill in credentials
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();

  // Wait for successful login (redirected away from /authentication)
  await page.waitForURL(/^((?!\/authentication).)*$/, { timeout: 10000 });

  // Handle organization setup if redirected
  if (page.url().includes('/organization-setup')) {
    await page.waitForTimeout(1000);
    const continueButton = page.getByRole('button', { name: /continue/i });
    if (await continueButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await continueButton.click();
      await page.waitForURL(/^((?!\/organization-setup).)*$/, { timeout: 5000 });
    }
  }

  // Wait for CRM to be ready
  await page.waitForTimeout(500);
}

/**
 * Logout current user
 * Clears session and navigates to login page
 *
 * @param {Page} page - Playwright page object
 */
export async function logout(page) {
  // Clear cookies and storage to log out
  await page.context().clearCookies();

  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // Navigate to login page
  await page.goto('http://localhost:4000/authentication/default/jwt/login');

  // Wait for login page to be ready
  await page.waitForSelector('input[type="email"]', { timeout: 5000 });
}

/**
 * Verify RLS isolation - check that a record is not accessible
 *
 * RLS returns EMPTY results (not errors) when accessing other org's data
 *
 * @param {Page} page - Playwright page object
 * @param {string} url - URL of the record to access
 * @returns {Promise<boolean>} - true if access is properly denied
 */
export async function verifyAccessDenied(page, url) {
  await page.goto(url);

  // Wait for page to load
  await page.waitForLoadState('networkidle', { timeout: 5000 });

  // Check for "not found", "access denied", or empty state indicators
  const deniedIndicators = [
    page.locator('text=/not found/i'),
    page.locator('text=/access denied/i'),
    page.locator('text=/no data/i'),
    page.locator('text=/not authorized/i'),
  ];

  // Return true if any denial indicator is visible
  for (const indicator of deniedIndicators) {
    if (await indicator.isVisible({ timeout: 1000 }).catch(() => false)) {
      return true;
    }
  }

  // Also check if we were redirected away (e.g., to 404 or list page)
  const currentUrl = page.url();
  if (!currentUrl.includes(url) || currentUrl.includes('404')) {
    return true;
  }

  return false;
}

/**
 * Get row count in a data grid or table
 * Useful for verifying different organizations see different datasets
 *
 * @param {Page} page - Playwright page object
 * @returns {Promise<number>} - Number of data rows (excluding header)
 */
export async function getRowCount(page) {
  // Try data-grid format first (MUI DataGrid)
  const gridRows = await page.locator('[role="row"][data-id]').count();
  if (gridRows > 0) {
    return gridRows;
  }

  // Try table format (tbody rows)
  const tableRows = await page.locator('tbody tr').count();
  if (tableRows > 0) {
    return tableRows;
  }

  // Try generic row role
  const genericRows = await page.locator('[role="row"]').count();
  // Subtract 1 for header row if present
  return Math.max(0, genericRows - 1);
}

/**
 * Wait for database operation to complete
 * Supabase operations are async, wait for them to propagate
 *
 * @param {number} ms - Milliseconds to wait (default: 1000)
 */
export async function waitForDatabase(ms = 1000) {
  await new Promise(resolve => setTimeout(resolve, ms));
}
