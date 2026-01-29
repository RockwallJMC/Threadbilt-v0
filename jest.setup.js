// Jest setup for tests with real Supabase integration
import '@testing-library/jest-dom';
import { createClient } from '@supabase/supabase-js';

// Verify test environment variables are loaded
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set in .env.test');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in .env.test');
}

// Create a global Supabase client for tests using real credentials from .env.test
global.supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Test user credentials from .env.test
global.testUsers = {
  existing: {
    email: process.env.PLAYWRIGHT_EXISTING_USER_EMAIL || 'test-existing@piercedesk.test',
    password: process.env.PLAYWRIGHT_EXISTING_USER_PASSWORD || 'TestPassword123!',
  },
  singleOrg: {
    email: process.env.PLAYWRIGHT_SINGLE_ORG_EMAIL || 'test-single-org@piercedesk.test',
    password: process.env.PLAYWRIGHT_SINGLE_ORG_PASSWORD || 'TestPassword123!',
    orgName: process.env.PLAYWRIGHT_SINGLE_ORG_NAME || 'Test Organization A',
  },
  multiOrg: {
    email: process.env.PLAYWRIGHT_MULTI_ORG_EMAIL || 'test-multi-org@piercedesk.test',
    password: process.env.PLAYWRIGHT_MULTI_ORG_PASSWORD || 'TestPassword123!',
    orgName1: process.env.PLAYWRIGHT_MULTI_ORG_NAME_1 || 'Test Organization A',
    orgName2: process.env.PLAYWRIGHT_MULTI_ORG_NAME_2 || 'Test Organization B',
  },
};

// Helper function to sign in a test user
global.signInTestUser = async (userType = 'singleOrg') => {
  const user = global.testUsers[userType];

  const { data, error } = await global.supabaseClient.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  });

  if (error) {
    throw new Error(`Failed to sign in test user: ${error.message}`);
  }

  return data;
};

// Helper function to sign out
global.signOutTestUser = async () => {
  await global.supabaseClient.auth.signOut();
};

// Clean up function to run after each test
afterEach(async () => {
  // Sign out to ensure clean state between tests
  await global.signOutTestUser();
});

// Suppress console errors from React warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Warning: useLayoutEffect') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
