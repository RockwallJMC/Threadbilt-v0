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
export async function waitForNetworkIdle(page, timeout = 2000) {
  await page.waitForLoadState('networkidle', { timeout });
}

// Helper to login
export async function loginAsUser(page, user) {
  await page.goto('http://localhost:4000/authentication/default/jwt/login');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await waitForNetworkIdle(page);
}

// Helper to select organization
export async function selectOrganization(page, orgName) {
  await page.getByRole('button', { name: /organization/i }).click();
  await page.getByRole('menuitem', { name: orgName }).click();
  await waitForNetworkIdle(page);
}
