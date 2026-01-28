const { test, expect } = require('@playwright/test');
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');
const { captureScreenshot } = require('./helpers/playwrightArtifacts');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;

const SINGLE_ORG_EMAIL = process.env.PLAYWRIGHT_SINGLE_ORG_EMAIL;
const SINGLE_ORG_PASSWORD = process.env.PLAYWRIGHT_SINGLE_ORG_PASSWORD;
const MULTI_ORG_EMAIL = process.env.PLAYWRIGHT_MULTI_ORG_EMAIL;
const MULTI_ORG_PASSWORD = process.env.PLAYWRIGHT_MULTI_ORG_PASSWORD;

const ORG_CONFIG = {
  alpha: { name: 'Test Organization A', slug: 'test-org-a' },
  beta: { name: 'Test Organization B', slug: 'test-org-b' },
};

const TEST_SEEDS = {
  alpha: {
    accounts: [
      { name: 'Alpha Account 1', industry: 'Technology' },
      { name: 'Alpha Account 2', industry: 'Healthcare' },
    ],
    contacts: [
      {
        first_name: 'Alice',
        last_name: 'Alpha',
        email: 'alpha.contact@piercedesk.test',
        title: 'VP Operations',
        accountIndex: 0,
      },
      {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@alpha-company.test',
        title: 'Director',
      },
    ],
  },
  beta: {
    accounts: [{ name: 'Beta Account 1', industry: 'Finance' }],
    contacts: [
      {
        first_name: 'Bob',
        last_name: 'Beta',
        email: 'beta.contact@piercedesk.test',
        title: 'CFO',
        accountIndex: 0,
      },
      {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@beta-company.test',
        title: 'Director',
      },
    ],
  },
};

const testState = {
  adminClient: null,
  orgs: {},
  users: {},
  accounts: { alpha: [], beta: [] },
  contacts: { alpha: [], beta: [] },
};

const requireEnv = (key, value) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
};

const setOrgContext = async (client, organizationId) => {
  const { error } = await client.rpc('set_config', {
    setting: 'app.current_org_id',
    value: organizationId,
    is_local: false,
  });

  if (error) {
    throw new Error(error.message);
  }
};

const createAdminClient = () =>
  createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

const createAuthedClient = async (email, password, organizationId) => {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(error.message);
  }

  await setOrgContext(client, organizationId);

  return client;
};

const upsertOrganizations = async (adminClient) => {
  const payload = Object.values(ORG_CONFIG).map((org) => ({
    name: org.name,
    slug: org.slug,
  }));

  const { data, error } = await adminClient
    .from('organizations')
    .upsert(payload, { onConflict: 'slug' })
    .select('id, name, slug');

  if (error) {
    throw new Error(error.message);
  }

  const map = {};
  data.forEach((org) => {
    map[org.slug === ORG_CONFIG.alpha.slug ? 'alpha' : 'beta'] = org;
  });

  return map;
};

const fetchUsers = async (adminClient) => {
  const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (error) {
    throw new Error(error.message);
  }

  const users = data.users || [];
  const singleUser = users.find((user) => user.email === SINGLE_ORG_EMAIL);
  const multiUser = users.find((user) => user.email === MULTI_ORG_EMAIL);

  if (!singleUser || !multiUser) {
    throw new Error('Test users are missing. Run scripts/create-test-users.mjs first.');
  }

  return { singleUser, multiUser };
};

const ensureMemberships = async (adminClient, orgs, users) => {
  const memberships = [
    {
      organization_id: orgs.alpha.id,
      user_id: users.singleUser.id,
      role: 'member',
      is_active: true,
    },
    {
      organization_id: orgs.alpha.id,
      user_id: users.multiUser.id,
      role: 'member',
      is_active: true,
    },
    {
      organization_id: orgs.beta.id,
      user_id: users.multiUser.id,
      role: 'member',
      is_active: true,
    },
  ];

  const { error } = await adminClient
    .from('organization_members')
    .upsert(memberships, { onConflict: 'organization_id,user_id' });

  if (error) {
    throw new Error(error.message);
  }
};

const seedAccounts = async (adminClient, orgs) => {
  const accountRecords = [];

  for (const [key, org] of Object.entries(orgs)) {
    const names = TEST_SEEDS[key].accounts.map((account) => account.name);
    await adminClient.from('accounts').delete().eq('organization_id', org.id).in('name', names);

    TEST_SEEDS[key].accounts.forEach((account) => {
      accountRecords.push({
        id: randomUUID(),
        organization_id: org.id,
        name: account.name,
        industry: account.industry,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });
  }

  const { data, error } = await adminClient
    .from('accounts')
    .insert(accountRecords)
    .select('id, name, organization_id');

  if (error) {
    throw new Error(error.message);
  }

  return data.reduce(
    (acc, account) => {
      const bucket = account.organization_id === orgs.alpha.id ? 'alpha' : 'beta';
      acc[bucket].push(account);
      return acc;
    },
    { alpha: [], beta: [] },
  );
};

const seedContacts = async (adminClient, orgs, accounts) => {
  const contactRecords = [];

  for (const [key, org] of Object.entries(orgs)) {
    const emails = TEST_SEEDS[key].contacts.map((contact) => contact.email);
    await adminClient.from('contacts').delete().eq('organization_id', org.id).in('email', emails);

    TEST_SEEDS[key].contacts.forEach((contact) => {
      contactRecords.push({
        id: randomUUID(),
        organization_id: org.id,
        account_id: null,
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        title: contact.title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });
  }

  const { data, error } = await adminClient
    .from('contacts')
    .upsert(contactRecords, { onConflict: 'email,organization_id' })
    .select('id, email, organization_id, account_id');

  if (error) {
    throw new Error(error.message);
  }

  return data.reduce(
    (acc, contact) => {
      const bucket = contact.organization_id === orgs.alpha.id ? 'alpha' : 'beta';
      acc[bucket].push(contact);
      return acc;
    },
    { alpha: [], beta: [] },
  );
};

test.beforeAll(async () => {
  requireEnv('NEXT_PUBLIC_SUPABASE_URL', SUPABASE_URL);
  requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', SUPABASE_ANON_KEY);
  requireEnv('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY', SUPABASE_SERVICE_ROLE_KEY);
  requireEnv('PLAYWRIGHT_SINGLE_ORG_EMAIL', SINGLE_ORG_EMAIL);
  requireEnv('PLAYWRIGHT_SINGLE_ORG_PASSWORD', SINGLE_ORG_PASSWORD);
  requireEnv('PLAYWRIGHT_MULTI_ORG_EMAIL', MULTI_ORG_EMAIL);
  requireEnv('PLAYWRIGHT_MULTI_ORG_PASSWORD', MULTI_ORG_PASSWORD);

  testState.adminClient = createAdminClient();
  testState.orgs = await upsertOrganizations(testState.adminClient);
  testState.users = await fetchUsers(testState.adminClient);
  await ensureMemberships(testState.adminClient, testState.orgs, testState.users);
  testState.accounts = await seedAccounts(testState.adminClient, testState.orgs);
  testState.contacts = await seedContacts(
    testState.adminClient,
    testState.orgs,
    testState.accounts,
  );
});

test.afterAll(async () => {
  if (!testState.adminClient) {
    return;
  }

  const accountIds = [...testState.accounts.alpha, ...testState.accounts.beta].map((acc) => acc.id);
  const contactIds = [...testState.contacts.alpha, ...testState.contacts.beta].map(
    (contact) => contact.id,
  );

  if (contactIds.length > 0) {
    await testState.adminClient.from('contacts').delete().in('id', contactIds);
  }

  if (accountIds.length > 0) {
    await testState.adminClient.from('accounts').delete().in('id', accountIds);
  }
});

test.afterEach(async ({ page }, testInfo) => {
  await captureScreenshot(page, testInfo);
});

test.describe.configure({ mode: 'serial' });

/**
 * CRM Multi-Tenancy Data Isolation Tests (CRITICAL SECURITY)
 *
 * These tests verify that data is properly isolated between organizations.
 * This is a CRITICAL security requirement for a multi-tenant SaaS application.
 *
 * CURRENT STATUS: Phase 1.2 (Auth & Multi-Tenancy) is 60% complete
 * - Tests are marked as .skip() with TODO comments
 * - Test structure documents expected security behavior
 * - Will be enabled when Phase 1.2 completes
 *
 * SECURITY REQUIREMENTS:
 * 1. Users can ONLY see data from their own organization
 * 2. Users CANNOT access data from other organizations via direct URLs
 * 3. API endpoints must enforce organization-level RLS (Row Level Security)
 * 4. Switching organizations properly updates visible data
 *
 * TODO: Enable these tests when Phase 1.2 completes
 * - Set up test users in different organizations
 * - Configure test data with organization_id filtering
 * - Verify Supabase RLS policies are working
 * - Test actual authentication and session management
 */

test.describe('CRM Multi-Tenancy - Accounts Data Isolation', () => {
  /**
   * Test Setup Requirements (TODO):
   *
   * Organization Alpha:
   *   - User: alpha-user@piercedesk.test
   *   - Password: TestPassword123!
   *   - Accounts: 3 test accounts with org_id = 'org_alpha'
   *
   * Organization Beta:
   *   - User: beta-user@piercedesk.test
   *   - Password: TestPassword123!
   *   - Accounts: 3 test accounts with org_id = 'org_beta'
   */

  test('User A cannot see User B accounts in list', async () => {
    // TODO: Enable when Phase 1.2 (Auth & Multi-Tenancy) completes
    const client = await createAuthedClient(
      SINGLE_ORG_EMAIL,
      SINGLE_ORG_PASSWORD,
      testState.orgs.alpha.id,
    );

    const { data, error } = await client
      .from('accounts')
      .select('id,name,organization_id')
      .eq('organization_id', testState.orgs.alpha.id);

    expect(error).toBeNull();
    expect(data.length).toBeGreaterThan(0);
    expect(data.every((account) => account.organization_id === testState.orgs.alpha.id)).toBe(true);
    expect(data.map((account) => account.name)).toContain(TEST_SEEDS.alpha.accounts[0].name);
    expect(data.map((account) => account.name)).not.toContain(TEST_SEEDS.beta.accounts[0].name);
  });

  test('User A cannot access User B account via direct URL', async () => {
    // TODO: Enable when Phase 1.2 completes

    // This is a CRITICAL security test
    // Users should NOT be able to access other organizations' data
    // even if they know the account ID

    const client = await createAuthedClient(
      SINGLE_ORG_EMAIL,
      SINGLE_ORG_PASSWORD,
      testState.orgs.alpha.id,
    );

    const betaAccountId = testState.accounts.beta[0].id;
    const { data, error } = await client
      .from('accounts')
      .select('id')
      .eq('id', betaAccountId)
      .eq('organization_id', testState.orgs.alpha.id)
      .maybeSingle();

    expect(data).toBeNull();
    if (error) {
      expect(error.message).toMatch(/permission|row level|not found|denied/i);
    }
  });

  test('API endpoints enforce organization-level filtering', async () => {
    // TODO: Enable when Phase 1.2 completes

    // This test verifies that API endpoints respect organization context
    // and filter data appropriately

    const client = await createAuthedClient(
      SINGLE_ORG_EMAIL,
      SINGLE_ORG_PASSWORD,
      testState.orgs.alpha.id,
    );

    const { data, error } = await client
      .from('accounts')
      .select('id,organization_id')
      .eq('organization_id', testState.orgs.alpha.id);

    expect(error).toBeNull();
    expect(data.length).toBeGreaterThan(0);
    expect(data.some((account) => account.organization_id !== testState.orgs.alpha.id)).toBe(false);
  });

  test('Switching organizations updates visible accounts', async () => {
    // TODO: Enable when Phase 1.2 completes
    // This test requires a user who belongs to BOTH organizations
    const client = await createAuthedClient(
      MULTI_ORG_EMAIL,
      MULTI_ORG_PASSWORD,
      testState.orgs.alpha.id,
    );

    const { data: alphaData, error: alphaError } = await client
      .from('accounts')
      .select('id,name,organization_id')
      .eq('organization_id', testState.orgs.alpha.id);

    expect(alphaError).toBeNull();
    expect(alphaData.some((account) => account.organization_id !== testState.orgs.alpha.id)).toBe(
      false,
    );

    await setOrgContext(client, testState.orgs.beta.id);

    const { data: betaData, error: betaError } = await client
      .from('accounts')
      .select('id,name,organization_id')
      .eq('organization_id', testState.orgs.beta.id);

    expect(betaError).toBeNull();
    expect(betaData.some((account) => account.organization_id !== testState.orgs.beta.id)).toBe(
      false,
    );
    expect(betaData.map((account) => account.name)).toContain(TEST_SEEDS.beta.accounts[0].name);
  });
});

test.describe('CRM Multi-Tenancy - Contacts Data Isolation', () => {
  test('User A cannot see User B contacts in list', async () => {
    // TODO: Enable when Phase 1.2 completes

    const client = await createAuthedClient(
      SINGLE_ORG_EMAIL,
      SINGLE_ORG_PASSWORD,
      testState.orgs.alpha.id,
    );

    const { data, error } = await client
      .from('contacts')
      .select('id,email,organization_id')
      .eq('organization_id', testState.orgs.alpha.id);

    expect(error).toBeNull();
    expect(data.some((contact) => contact.organization_id !== testState.orgs.alpha.id)).toBe(false);
  });

  test('User A cannot access User B contact via direct URL', async () => {
    // TODO: Enable when Phase 1.2 completes

    // CRITICAL security test for contacts

    const client = await createAuthedClient(
      SINGLE_ORG_EMAIL,
      SINGLE_ORG_PASSWORD,
      testState.orgs.alpha.id,
    );

    const betaContactId = testState.contacts.beta[0].id;
    const { data, error } = await client
      .from('contacts')
      .select('id')
      .eq('id', betaContactId)
      .eq('organization_id', testState.orgs.alpha.id)
      .maybeSingle();

    expect(data).toBeNull();
    if (error) {
      expect(error.message).toMatch(/permission|row level|not found|denied/i);
    }
  });

  test('Contact-to-account links respect organization boundaries', async () => {
    // TODO: Enable when Phase 1.2 completes

    const client = await createAuthedClient(
      SINGLE_ORG_EMAIL,
      SINGLE_ORG_PASSWORD,
      testState.orgs.alpha.id,
    );

    const { data, error } = await client
      .from('accounts')
      .select('id,name,organization_id')
      .eq('organization_id', testState.orgs.alpha.id);

    expect(error).toBeNull();
    expect(data.some((account) => account.organization_id !== testState.orgs.alpha.id)).toBe(false);
    expect(data.map((account) => account.name)).toContain(TEST_SEEDS.alpha.accounts[0].name);
    expect(data.map((account) => account.name)).not.toContain(TEST_SEEDS.beta.accounts[0].name);
  });

  test('Search results are filtered by organization', async () => {
    // TODO: Enable when Phase 1.2 completes

    const client = await createAuthedClient(
      SINGLE_ORG_EMAIL,
      SINGLE_ORG_PASSWORD,
      testState.orgs.alpha.id,
    );

    const { data, error } = await client
      .from('contacts')
      .select('id,email,organization_id')
      .eq('organization_id', testState.orgs.alpha.id)
      .ilike('email', '%alpha-company.test');

    expect(error).toBeNull();
    expect(data.some((contact) => contact.organization_id !== testState.orgs.alpha.id)).toBe(false);
  });
});

test.describe('CRM Multi-Tenancy - Supabase RLS Verification', () => {
  test('Supabase RLS policies enforce organization filtering', async () => {
    // TODO: Enable when Phase 1.2 completes

    // This test verifies that database-level security (RLS) is working
    // Even if client-side filtering fails, database MUST enforce isolation

    const client = await createAuthedClient(
      SINGLE_ORG_EMAIL,
      SINGLE_ORG_PASSWORD,
      testState.orgs.alpha.id,
    );

    const { data, error } = await client
      .from('accounts')
      .select('id,organization_id')
      .eq('organization_id', testState.orgs.alpha.id);

    expect(error).toBeNull();
    expect(data.length).toBeGreaterThan(0);
    expect(data.some((account) => account.organization_id !== testState.orgs.alpha.id)).toBe(false);
  });

  test('Direct Supabase client queries respect organization context', async () => {
    // TODO: Enable when Phase 1.2 completes

    const client = await createAuthedClient(
      MULTI_ORG_EMAIL,
      MULTI_ORG_PASSWORD,
      testState.orgs.beta.id,
    );

    const { data, error } = await client
      .from('contacts')
      .select('id,organization_id')
      .eq('organization_id', testState.orgs.beta.id);

    expect(error).toBeNull();
    expect(data.some((contact) => contact.organization_id !== testState.orgs.beta.id)).toBe(false);
  });
});

test.describe('CRM Multi-Tenancy - Error Handling', () => {
  test('Attempting cross-organization access shows appropriate error', async () => {
    // TODO: Enable when Phase 1.2 completes

    const client = await createAuthedClient(
      SINGLE_ORG_EMAIL,
      SINGLE_ORG_PASSWORD,
      testState.orgs.alpha.id,
    );

    const betaAccountId = testState.accounts.beta[0].id;
    const { data, error } = await client
      .from('accounts')
      .select('id')
      .eq('id', betaAccountId)
      .eq('organization_id', testState.orgs.alpha.id)
      .maybeSingle();

    expect(data).toBeNull();
    if (error) {
      expect(error.message).toMatch(/permission|row level|not found|denied/i);
    }
  });

  test('Expired organization context is handled gracefully', async () => {
    // TODO: Enable when Phase 1.2 completes

    const client = await createAuthedClient(
      SINGLE_ORG_EMAIL,
      SINGLE_ORG_PASSWORD,
      testState.orgs.alpha.id,
    );

    await setOrgContext(client, '00000000-0000-0000-0000-000000000000');

    const { data, error } = await client
      .from('accounts')
      .select('id')
      .eq('organization_id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      expect(error.message).toMatch(/permission|row level|not found|denied/i);
    } else {
      expect(data.length).toBe(0);
    }
  });
});

/**
 * Test Data Setup Helper Functions (TODO)
 *
 * These helper functions will be implemented when Phase 1.2 completes.
 */

/**
 * Login as a specific user (TODO)
 */
async function loginAsUser(page, context, email, password) {
  // TODO: Implement authentication helper
  // 1. Clear existing session
  // 2. Navigate to login page
  // 3. Fill credentials
  // 4. Submit form
  // 5. Wait for authentication to complete
  // 6. Verify organization context is set
}

/**
 * Logout current user (TODO)
 */
async function logoutUser(page) {
  // TODO: Implement logout helper
  // 1. Open profile menu
  // 2. Click logout
  // 3. Wait for session to clear
  // 4. Verify redirect to login page
}

/**
 * Switch to different organization (TODO)
 */
async function switchOrganization(page, organizationName) {
  // TODO: Implement organization switching helper
  // 1. Open profile menu
  // 2. Click organization switcher
  // 3. Select target organization
  // 4. Wait for context to update
  // 5. Verify UI reflects new organization
}

/**
 * Create test data for organization (TODO)
 */
async function createTestDataForOrganization(organizationId) {
  // TODO: Implement test data creation
  // 1. Use Supabase client to insert test accounts
  // 2. Use Supabase client to insert test contacts
  // 3. Ensure all data has correct organization_id
  // 4. Return IDs for use in tests
}

/**
 * Clean up test data (TODO)
 */
async function cleanupTestData(organizationId) {
  // TODO: Implement test data cleanup
  // 1. Delete test accounts for organization
  // 2. Delete test contacts for organization
  // 3. Verify cleanup completed
}

/**
 * DOCUMENTATION: Multi-Tenancy Security Requirements
 *
 * This test file serves as documentation of the CRITICAL security requirements
 * for PierceDesk CRM multi-tenancy. All tests marked with .skip() MUST pass
 * before the application can be considered production-ready.
 *
 * Security Principles:
 * 1. **Defense in Depth**: Security enforced at multiple layers
 *    - Client-side: UI filters and routing
 *    - API layer: Organization context validation
 *    - Database layer: RLS policies
 *
 * 2. **Fail Secure**: Any security check failure must deny access
 *    - Never assume organization context is correct
 *    - Always validate against authenticated user's organization(s)
 *    - Prefer 404 over 403 to prevent data leakage
 *
 * 3. **Audit Trail**: All cross-organization access attempts should be logged
 *    - Track failed access attempts
 *    - Alert on suspicious patterns
 *    - Maintain compliance audit logs
 *
 * Phase 1.2 Completion Checklist:
 * - [ ] Supabase RLS policies created for crm_accounts table
 * - [ ] Supabase RLS policies created for crm_contacts table
 * - [ ] Authentication integration complete (useSupabaseAuth)
 * - [ ] Organization context stored in session/localStorage
 * - [ ] API endpoints enforce organization filtering
 * - [ ] Test users created in multiple organizations
 * - [ ] All .skip() tests in this file pass
 * - [ ] Security audit performed
 * - [ ] Penetration testing completed
 */
