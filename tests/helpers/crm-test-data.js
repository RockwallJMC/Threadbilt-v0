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
  leads: {
    list: '/apps/crm/leads',
    detail: (id) => `/apps/crm/leads/${id}`,
    create: '/apps/crm/leads/create', // TODO: Update when route exists
  },
  opportunities: {
    list: '/apps/crm/opportunities',
    detail: (id) => `/apps/crm/opportunities/${id}`,
    create: '/apps/crm/opportunities/create', // TODO: Update when route exists
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
 * Wait for leads table to load
 */
const waitForLeadsTable = async (page) => {
  await page.waitForSelector('[role="grid"]', { timeout: 10000 });
  // Wait for at least one row to appear
  await page.waitForSelector('[role="row"][data-id]', { timeout: 10000 });
};

/**
 * Wait for lead detail page to load
 */
const waitForLeadDetail = async (page) => {
  // Wait for lead name heading
  await page.waitForSelector('h4, h5, h6', { timeout: 5000 });
  // Wait for lead information to appear
  await page.waitForTimeout(500);
};

/**
 * Test Leads
 * Selected from mock data for predictable testing
 */
const TEST_LEADS = {
  // NEW status
  newLead1: {
    id: 'lead_001',
    name: 'Sarah Mitchell',
    company: 'TechVision Analytics',
    email: 'sarah.mitchell@techvision.com',
    phone: '+1 (415) 234-5678',
    source: 'website',
    status: 'new',
  },
  newLead2: {
    id: 'lead_002',
    name: 'Marcus Chen',
    company: 'GlobalTrade Solutions',
    email: 'marcus.chen@globaltrade.io',
    phone: '+1 (650) 789-0123',
    source: 'referral',
    status: 'new',
  },
  // CONTACTED status
  contactedLead: {
    id: 'lead_004',
    name: 'David Park',
    company: 'HealthCare Innovations Inc',
    email: 'david.park@healthcareinnovations.com',
    phone: '+1 (408) 555-0199',
    source: 'cold_call',
    status: 'contacted',
  },
  // QUALIFIED status
  qualifiedLead: {
    id: 'lead_007',
    name: 'Lisa Anderson',
    company: 'Financial Services Group',
    email: 'lisa.anderson@fsg.com',
    phone: '+1 (212) 555-0144',
    source: 'referral',
    status: 'qualified',
  },
  // UNQUALIFIED status
  unqualifiedLead: {
    id: 'lead_010',
    name: 'Jason Miller',
    company: 'Small Business Consulting',
    email: 'jason@smallbizconsult.com',
    phone: '+1 (303) 123-4567',
    source: 'cold_call',
    status: 'unqualified',
  },
  // CONVERTED status
  convertedLead: {
    id: 'lead_012',
    name: 'William Harris',
    company: 'SwiftPay Systems',
    email: 'william.harris@swiftpay.com',
    phone: '+1 (415) 999-0001',
    source: 'referral',
    status: 'converted',
  },
};

/**
 * Test Opportunities
 * Selected from mock data for predictable testing
 */
const TEST_OPPORTUNITIES = {
  // QUALIFICATION stage
  qualification: {
    id: 'opp_001',
    name: 'Enterprise Software License',
    accountId: 'acc_001',
    accountName: 'TechVision Solutions Inc.',
    value: 250000,
    probability: 25,
    stage: 'Qualification',
    expectedCloseDate: '2026-03-31',
  },
  // PROPOSAL stage
  proposal: {
    id: 'opp_002',
    name: 'Cloud Migration Project',
    accountId: 'acc_002',
    accountName: 'HealthFirst Medical Group',
    value: 500000,
    probability: 50,
    stage: 'Proposal',
    expectedCloseDate: '2026-04-15',
  },
  // NEGOTIATION stage
  negotiation: {
    id: 'opp_003',
    name: 'Annual Support Contract',
    accountId: 'acc_003',
    accountName: 'Global Financial Partners LLC',
    value: 120000,
    probability: 75,
    stage: 'Negotiation',
    expectedCloseDate: '2026-02-28',
  },
  // CLOSED WON
  closedWon: {
    id: 'opp_004',
    name: 'Security Audit Services',
    accountId: 'acc_001',
    accountName: 'TechVision Solutions Inc.',
    value: 75000,
    probability: 100,
    stage: 'Closed Won',
    expectedCloseDate: '2026-01-15',
  },
  // CLOSED LOST
  closedLost: {
    id: 'opp_005',
    name: 'Custom Integration',
    accountId: 'acc_003',
    accountName: 'Small Business Consulting',
    value: 30000,
    probability: 0,
    stage: 'Closed Lost',
    expectedCloseDate: '2025-12-31',
  },
  // Converted from lead
  convertedFromLead: {
    id: 'opp_006',
    name: 'Financial Services Platform',
    accountId: 'acc_003',
    accountName: 'Financial Services Group',
    value: 180000,
    probability: 50,
    stage: 'Proposal',
    expectedCloseDate: '2026-05-01',
    convertedFromLeadId: 'lead_007',
  },
};

/**
 * Helper: Get opportunity by ID
 */
const getOpportunityById = (opportunityId) => {
  return Object.values(TEST_OPPORTUNITIES).find((opp) => opp.id === opportunityId);
};

/**
 * Helper: Get opportunities by stage
 */
const getOpportunitiesByStage = (stage) => {
  return Object.values(TEST_OPPORTUNITIES).filter((opp) => opp.stage === stage);
};

/**
 * Helper: Get opportunities for an account
 */
const getOpportunitiesForAccount = (accountId) => {
  return Object.values(TEST_OPPORTUNITIES).filter((opp) => opp.accountId === accountId);
};

/**
 * Helper: Calculate weighted value for an opportunity
 */
const calculateWeightedValue = (opportunity) => {
  return Math.floor((opportunity.value * opportunity.probability) / 100);
};

/**
 * Wait for opportunities kanban to load
 */
const waitForOpportunitiesKanban = async (page) => {
  // Wait for kanban board stages to appear
  await page.waitForSelector('text=Qualification', { timeout: 5000 });
  await page.waitForSelector('text=Proposal', { timeout: 5000 });
};

/**
 * Wait for opportunities table to load
 */
const waitForOpportunitiesTable = async (page) => {
  await page.waitForSelector('[role="grid"]', { timeout: 5000 });
  // Wait for at least one row to appear
  await page.waitForSelector('[role="row"][data-id]', { timeout: 5000 });
};

/**
 * Wait for opportunity detail page to load
 */
const waitForOpportunityDetail = async (page) => {
  // Wait for opportunity name heading
  await page.waitForSelector('h4, h5, h6', { timeout: 5000 });
  // Wait for forecasting widget or tabs
  await page.waitForTimeout(500);
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
    leads: [
      // Leads belonging to Org A
    ],
    opportunities: [
      // Opportunities belonging to Org A
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
    leads: [
      // Leads belonging to Org B
    ],
    opportunities: [
      // Opportunities belonging to Org B
    ],
  },
};

module.exports = {
  TEST_ACCOUNTS,
  TEST_CONTACTS,
  TEST_LEADS,
  TEST_OPPORTUNITIES,
  ROUTES,
  getAccountById,
  getContactById,
  getContactsForAccount,
  getIndependentContacts,
  getContactsWithAccounts,
  getOpportunityById,
  getOpportunitiesByStage,
  getOpportunitiesForAccount,
  calculateWeightedValue,
  waitForAccountsTable,
  waitForContactsTable,
  waitForAccountDetail,
  waitForContactDetail,
  waitForLeadsTable,
  waitForLeadDetail,
  waitForOpportunitiesKanban,
  waitForOpportunitiesTable,
  waitForOpportunityDetail,
  MULTI_TENANT_TEST_DATA,
};
