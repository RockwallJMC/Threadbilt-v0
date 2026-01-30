/**
 * Test data helpers and mock entities for CRM E2E tests
 */

export const TEST_USERS = {
  salesManager: {
    email: 'sales.manager@piercedesk.test',
    password: 'TestPassword123!',
    role: 'sales_manager'
  },
  salesRep: {
    email: 'sales.rep@piercedesk.test',
    password: 'TestPassword123!',
    role: 'sales_rep'
  }
};

export const TEST_ORGS = {
  acme: {
    id: 'org-acme-001',
    name: 'Acme Corporation',
    slug: 'acme-corp'
  },
  globex: {
    id: 'org-globex-001',
    name: 'Globex Industries',
    slug: 'globex-ind'
  }
};

export const MOCK_LEAD = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1-555-0123',
  company: 'Example Corp',
  title: 'CTO',
  status: 'new',
  source: 'Website'
};

export const MOCK_OPPORTUNITY = {
  name: 'Enterprise Software Deal',
  stage: 'qualification',
  value: 50000,
  probability: 25,
  expectedCloseDate: '2026-03-31'
};

export const MOCK_PROPOSAL = {
  title: 'Software Implementation Proposal',
  description: 'Custom CRM implementation for Enterprise',
  validUntil: '2026-02-28',
  lineItems: [
    { description: 'Software License', quantity: 10, unitPrice: 1000 },
    { description: 'Implementation Services', quantity: 40, unitPrice: 150 }
  ]
};

// Helper to wait for network idle
export async function waitForNetworkIdle(page, timeout = 10000) {
  await page.waitForLoadState('networkidle', { timeout });
}

// Helper to login
export async function loginAsUser(page, user) {
  await page.goto('http://localhost:4000/authentication/default/jwt/login');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await waitForNetworkIdle(page);
}

// Helper to select organization
export async function selectOrganization(page, orgName) {
  // Check if we're on an organization selection page first
  const orgSelectionPage = page.locator('text=/select.*organization|choose.*organization/i');
  const isOnSelectionPage = await orgSelectionPage.isVisible().catch(() => false);

  if (isOnSelectionPage) {
    // Click the organization from the selection page
    await page.getByText(orgName).click();
    await waitForNetworkIdle(page);
  } else {
    // User is already in an organization context - try to find org switcher
    const orgButton = page.getByRole('button', { name: /organization/i });
    const hasOrgSwitcher = await orgButton.isVisible().catch(() => false);

    if (hasOrgSwitcher) {
      await orgButton.click();
      await page.getByRole('menuitem', { name: orgName }).click();
      await waitForNetworkIdle(page);
    }
    // If no org switcher and not on selection page, assume we're already in correct org
  }
}
