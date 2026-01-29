/**
 * Supabase Test Helpers
 *
 * Utilities for testing with real Supabase data instead of mocks.
 * Uses test users and real seeded data from the database.
 */

/**
 * Get authenticated Supabase client for testing
 * @param {string} userType - 'existing', 'singleOrg', or 'multiOrg'
 * @returns {Promise<{supabase: object, session: object, user: object}>}
 */
export async function getAuthenticatedSupabaseClient(userType = 'singleOrg') {
  const authData = await global.signInTestUser(userType);

  return {
    supabase: global.supabaseClient,
    session: authData.session,
    user: authData.user,
  };
}

/**
 * Create a test wrapper that provides authenticated context
 * @param {string} userType - User type to authenticate as
 * @returns {Function} Wrapper function for rendering components
 */
export async function createAuthenticatedWrapper(userType = 'singleOrg') {
  const { session, user } = await getAuthenticatedSupabaseClient(userType);

  // Return a wrapper component that provides auth context
  return function AuthWrapper({ children }) {
    // This assumes you have a Supabase provider component
    // Adjust based on your actual auth provider structure
    return children;
  };
}

/**
 * Mock useSupabaseAuth hook to return real authenticated session
 * @param {string} userType - User type to authenticate as
 */
export async function mockSupabaseAuthWithRealUser(userType = 'singleOrg') {
  const { session, user } = await getAuthenticatedSupabaseClient(userType);

  // Mock the useSupabaseAuth hook
  jest.mock('hooks/useSupabaseAuth', () => ({
    useSupabaseAuth: () => ({
      user,
      session,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn(),
      loading: false,
      error: null,
    }),
  }));

  return { user, session };
}

/**
 * Get real test data from Supabase
 * @param {string} table - Table name
 * @param {object} filters - Query filters
 * @returns {Promise<Array>} Array of records
 */
export async function getTestData(table, filters = {}) {
  // Validate table name to prevent SQL injection
  const allowedTables = ['leads', 'opportunities', 'proposals', 'organizations', 'organization_members', 'users'];
  if (!allowedTables.includes(table)) {
    throw new Error(`Invalid table name: ${table}. Allowed tables: ${allowedTables.join(', ')}`);
  }

  const { supabase } = await getAuthenticatedSupabaseClient();

  let query = supabase.from(table).select('*');

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch test data from ${table}: ${error.message}`);
  }

  return data;
}

/**
 * Clean up test data created during a test
 * @param {string} table - Table name
 * @param {object} filters - Filters to identify records to delete
 */
export async function cleanupTestData(table, filters) {
  const { supabase } = await getAuthenticatedSupabaseClient('singleOrg');

  let query = supabase.from(table).delete();

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  const { error } = await query;

  if (error) {
    console.warn(`Failed to cleanup test data from ${table}: ${error.message}`);
  }
}

/**
 * Create test data in Supabase
 * @param {string} table - Table name
 * @param {object|Array} data - Data to insert
 * @returns {Promise<Array>} Inserted records
 */
export async function createTestData(table, data) {
  const { supabase } = await getAuthenticatedSupabaseClient('singleOrg');

  const { data: inserted, error } = await supabase
    .from(table)
    .insert(data)
    .select();

  if (error) {
    throw new Error(`Failed to create test data in ${table}: ${error.message}`);
  }

  return inserted;
}

/**
 * Wait for Supabase operation to complete
 * Useful for waiting for database triggers, RLS policies, etc.
 * @param {Function} condition - Function that returns true when ready
 * @param {number} timeout - Max wait time in ms
 * @param {number} interval - Check interval in ms
 */
export async function waitForSupabaseOperation(
  condition,
  timeout = 5000,
  interval = 100
) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error('Timeout waiting for Supabase operation');
}

/**
 * Get organization ID for test user
 * @param {string} userType - User type ('singleOrg' or 'multiOrg')
 * @returns {Promise<string>} Organization ID
 */
export async function getTestOrganizationId(userType = 'singleOrg') {
  const { supabase, user } = await getAuthenticatedSupabaseClient(userType);

  const { data, error } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (error) {
    throw new Error(`Failed to get organization ID: ${error.message}`);
  }

  return data.organization_id;
}
