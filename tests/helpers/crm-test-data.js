/**
 * CRM Test Data Helpers
 *
 * Provides test data and helper functions for CRM E2E tests.
 * Uses mock data from src/data/crm/* for testing UI functionality.
 *
 * TODO: Update when Phase 1.2 (Auth & Multi-Tenancy) completes
 * - Replace mock data with actual Supabase queries
 * - Add organization-specific data filtering
 * - Add multi-tenant test scenarios
 */

/**
 * Test Accounts
 * Selected from mock data for predictable testing
 */
const TEST_ACCOUNTS = {
  // First account - Technology industry
  techVision: {
    id: 'acc_001',
    name: 'TechVision Solutions Inc.',
    industry: 'Technology',
    phone: '+1 (415) 555-0123',
    website: 'https://techvisionsolutions.com',
  },
  // Healthcare account
  healthFirst: {
    id: 'acc_002',
    name: 'HealthFirst Medical Group',
    industry: 'Healthcare',
    phone: '+1 (617) 555-0198',
  },
  // Financial services account
  globalFinancial: {
    id: 'acc_003',
    name: 'Global Financial Partners LLC',
    industry: 'Finance',
    phone: '+1 (212) 555-0287',
  },
};

/**
 * Test Contacts
 * Mix of independent contacts and contacts linked to accounts
 */
const TEST_CONTACTS = {
  // Independent contacts (no account_id)
  independent: {
    michaelChen: {
      id: 'contact_001',
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@techstartup.io',
      title: 'Founder & CEO',
      hasAccount: false,
    },
    jenniferMartinez: {
      id: 'contact_002',
      firstName: 'Jennifer',
      lastName: 'Martinez',
      email: 'j.martinez@consultech.com',
      title: 'Independent Consultant',
      hasAccount: false,
    },
  },
  // Contacts linked to TechVision Solutions (acc_001)
  withAccount: {
    sarahJohnson: {
      id: 'contact_007',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@techvisionsolutions.com',
      title: 'Chief Technology Officer',
      accountId: 'acc_001',
      accountName: 'TechVision Solutions Inc.',
      hasAccount: true,
    },
    jamesMiller: {
      id: 'contact_008',
      firstName: 'James',
      lastName: 'Miller',
      email: 'james.miller@techvisionsolutions.com',
      title: 'VP of Engineering',
      accountId: 'acc_001',
      accountName: 'TechVision Solutions Inc.',
      hasAccount: true,
    },
  },
};

/**
 * Helper: Get account by ID
 */
const getAccountById = (accountId) => {
  const accounts = Object.values(TEST_ACCOUNTS);
  return accounts.find((acc) => acc.id === accountId);
};

/**
 * Helper: Get contact by ID
 */
const getContactById = (contactId) => {
  const allContacts = {
    ...TEST_CONTACTS.independent,
    ...TEST_CONTACTS.withAccount,
  };
  return Object.values(allContacts).find((contact) => contact.id === contactId);
};

/**
 * Helper: Get contacts for an account
 */
const getContactsForAccount = (accountId) => {
  return Object.values(TEST_CONTACTS.withAccount).filter(
    (contact) => contact.accountId === accountId,
  );
};

/**
 * Helper: Get independent contacts (no account)
 */
const getIndependentContacts = () => {
  return Object.values(TEST_CONTACTS.independent);
};

/**
 * Helper: Get contacts with accounts
 */
const getContactsWithAccounts = () => {
  return Object.values(TEST_CONTACTS.withAccount);
};

/**
 * Navigation Helpers
 */
const ROUTES = {
  accounts: {
    list: '/apps/crm/accounts',
    detail: (id) => `/apps/crm/accounts/${id}`,
    create: '/apps/crm/accounts/create', // TODO: Update when route exists
  },
  contacts: {
    list: '/apps/crm/contacts',
    detail: (id) => `/apps/crm/contacts/${id}`,
    create: '/apps/crm/add-contact',
  },
};

/**
 * Assertions Helpers
 */

/**
 * Wait for accounts table to load
 */
const waitForAccountsTable = async (page) => {
  await page.waitForSelector('table', { timeout: 5000 });
  // Wait for at least one row to appear (beyond header)
  await page.waitForSelector('tbody tr', { timeout: 5000 });
};

/**
 * Wait for contacts table to load
 */
const waitForContactsTable = async (page) => {
  await page.waitForSelector('table', { timeout: 5000 });
  await page.waitForSelector('tbody tr', { timeout: 5000 });
};

/**
 * Wait for account detail page to load
 */
const waitForAccountDetail = async (page) => {
  // Wait for account name heading
  await page.waitForSelector('h4, h5, h6', { timeout: 5000 });
  // Wait for tabs to appear
  await page.waitForSelector('[role="tablist"]', { timeout: 5000 });
};

/**
 * Wait for contact detail page to load
 */
const waitForContactDetail = async (page) => {
  // Wait for contact name heading
  await page.waitForSelector('h4, h5, h6', { timeout: 5000 });
  // Wait for tabs to appear
  await page.waitForSelector('[role="tablist"]', { timeout: 5000 });
};

/**
 * Multi-Tenancy Test Data (for future Phase 1.2 integration)
 *
 * TODO: Enable when Phase 1.2 completes
 * This structure shows how multi-tenant tests should work
 */
const MULTI_TENANT_TEST_DATA = {
  organizationA: {
    id: 'org_alpha',
    name: 'Organization Alpha',
    accounts: [
      // Accounts belonging to Org A
    ],
    contacts: [
      // Contacts belonging to Org A
    ],
  },
  organizationB: {
    id: 'org_beta',
    name: 'Organization Beta',
    accounts: [
      // Accounts belonging to Org B
    ],
    contacts: [
      // Contacts belonging to Org B
    ],
  },
};

module.exports = {
  TEST_ACCOUNTS,
  TEST_CONTACTS,
  ROUTES,
  getAccountById,
  getContactById,
  getContactsForAccount,
  getIndependentContacts,
  getContactsWithAccounts,
  waitForAccountsTable,
  waitForContactsTable,
  waitForAccountDetail,
  waitForContactDetail,
  MULTI_TENANT_TEST_DATA,
};
