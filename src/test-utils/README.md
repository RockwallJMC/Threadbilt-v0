# Test Utilities - Real Supabase Integration

This directory contains utilities for testing with **real Supabase data** instead of mocks.

## Philosophy

**We use real seeded data from Supabase, not mocks.**

Benefits:
- Tests validate actual database schema and RLS policies
- Catches real-world integration issues
- Tests are more reliable and accurate
- Validates authentication flows with real Supabase auth

## Test Users

Test users are configured in `.env.test`:

| User Type | Email | Purpose |
|-----------|-------|---------|
| `existing` | test-existing@piercedesk.test | Testing duplicate signup scenarios |
| `singleOrg` | test-single-org@piercedesk.test | User in one organization |
| `multiOrg` | test-multi-org@piercedesk.test | User in multiple organizations |

All users have password: `TestPassword123!`

## Usage Examples

### Basic API Hook Test with Real Data

```javascript
import { getAuthenticatedSupabaseClient, getTestData } from 'test-utils/supabase-test-helpers';

describe('useLeadApi', () => {
  let supabase, user, session;

  beforeAll(async () => {
    // Sign in with real test user
    const authData = await getAuthenticatedSupabaseClient('singleOrg');
    supabase = authData.supabase;
    user = authData.user;
    session = authData.session;
  });

  test('fetches real leads from Supabase', async () => {
    // Get real seeded leads for this organization
    const leads = await getTestData('leads', { status: 'new' });

    expect(leads).toBeInstanceOf(Array);
    expect(leads.length).toBeGreaterThan(0);
    expect(leads[0]).toHaveProperty('company');
  });
});
```

### Component Test with Auth Context

```javascript
import { render, screen } from '@testing-library/react';
import { getAuthenticatedSupabaseClient } from 'test-utils/supabase-test-helpers';
import ProfileMenu from 'components/ProfileMenu';

describe('ProfileMenu with real auth', () => {
  test('displays real user info', async () => {
    // Authenticate with real user
    const { user, session } = await getAuthenticatedSupabaseClient('singleOrg');

    // Render component with real auth data
    render(<ProfileMenu />);

    // Assert against real user email
    expect(screen.getByText(user.email)).toBeInTheDocument();
  });
});
```

### Testing with Real Database Operations

```javascript
import {
  getAuthenticatedSupabaseClient,
  createTestData,
  cleanupTestData,
  getTestOrganizationId,
} from 'test-utils/supabase-test-helpers';

describe('Lead creation', () => {
  let organizationId;

  beforeAll(async () => {
    organizationId = await getTestOrganizationId('singleOrg');
  });

  afterEach(async () => {
    // Clean up test data after each test
    await cleanupTestData('leads', {
      company: 'Test Company',
      organization_id: organizationId
    });
  });

  test('creates lead in database', async () => {
    const { supabase } = await getAuthenticatedSupabaseClient('singleOrg');

    // Create real test data
    const leadData = {
      company: 'Test Company',
      email: 'test@example.com',
      status: 'new',
      organization_id: organizationId,
    };

    const leads = await createTestData('leads', leadData);

    expect(leads).toHaveLength(1);
    expect(leads[0].company).toBe('Test Company');
  });
});
```

### Testing RLS Policies

```javascript
import { getAuthenticatedSupabaseClient } from 'test-utils/supabase-test-helpers';

describe('RLS Policies', () => {
  test('user can only see their organization data', async () => {
    const { supabase, user } = await getAuthenticatedSupabaseClient('singleOrg');

    // Try to fetch all leads (should only return org-specific leads)
    const { data: leads } = await supabase.from('leads').select('*');

    // Verify all leads belong to user's organization
    const { data: userOrgs } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id);

    const userOrgIds = userOrgs.map(o => o.organization_id);

    leads.forEach(lead => {
      expect(userOrgIds).toContain(lead.organization_id);
    });
  });
});
```

## Available Helpers

### `getAuthenticatedSupabaseClient(userType)`
Returns authenticated Supabase client and session for a test user.

**Parameters:**
- `userType`: `'existing'`, `'singleOrg'`, or `'multiOrg'`

**Returns:**
```javascript
{
  supabase: SupabaseClient,
  session: Session,
  user: User
}
```

### `getTestData(table, filters)`
Fetch real seeded data from Supabase.

**Parameters:**
- `table`: Table name
- `filters`: Object of column filters (e.g., `{ status: 'new' }`)

**Returns:** Array of records

### `createTestData(table, data)`
Insert test data into Supabase.

**Parameters:**
- `table`: Table name
- `data`: Object or array of objects to insert

**Returns:** Array of inserted records

### `cleanupTestData(table, filters)`
Delete test data after test runs.

**Parameters:**
- `table`: Table name
- `filters`: Object of column filters to identify records to delete

### `getTestOrganizationId(userType)`
Get the organization ID for a test user.

**Parameters:**
- `userType`: `'singleOrg'` or `'multiOrg'`

**Returns:** Organization UUID

### `waitForSupabaseOperation(condition, timeout, interval)`
Wait for async Supabase operation to complete.

**Parameters:**
- `condition`: Function that returns true when ready
- `timeout`: Max wait time in ms (default: 5000)
- `interval`: Check interval in ms (default: 100)

## Global Test Helpers

These are available globally in all tests (set up in `jest.setup.js`):

### `global.supabaseClient`
Pre-configured Supabase client using `.env.test` credentials.

### `global.testUsers`
Object containing test user credentials:
```javascript
{
  existing: { email, password },
  singleOrg: { email, password, orgName },
  multiOrg: { email, password, orgName1, orgName2 }
}
```

### `global.signInTestUser(userType)`
Sign in a test user and return auth data.

### `global.signOutTestUser()`
Sign out the current test user.

## Important Notes

### Automatic Cleanup
- `afterEach` hook in `jest.setup.js` signs out after every test
- This ensures clean state between tests
- Always use `cleanupTestData()` for data you create

### Test Data Requirements
- Test users must exist in Supabase (created via seed scripts)
- Organizations must be set up with proper memberships
- See `scripts/seed-crm-data.js` for seeding test data

### Environment Variables
- Tests load `.env.test` automatically via `jest.config.js`
- Never use production credentials in `.env.test`
- Test database should have isolated seeded data

### Running Tests
```bash
# Run all tests with real Supabase data
npm test

# Run specific test file
npm test -- useLeadApi.test.js

# Run tests in CI mode
npm run test:ci
```

## Migration from Mocks

To convert an existing mock-based test to use real Supabase:

**Before (with mocks):**
```javascript
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabase
}));

test('fetches leads', async () => {
  mockSupabase.from.mockReturnValue({
    select: () => ({ data: mockLeads })
  });
  // ...
});
```

**After (with real Supabase):**
```javascript
import { getAuthenticatedSupabaseClient, getTestData } from 'test-utils/supabase-test-helpers';

test('fetches leads', async () => {
  const { supabase } = await getAuthenticatedSupabaseClient('singleOrg');
  const leads = await getTestData('leads');

  expect(leads).toBeInstanceOf(Array);
  // ... assertions against real data
});
```

## Troubleshooting

### "Auth session missing!" error
- Ensure test user is signed in with `getAuthenticatedSupabaseClient()`
- Check that `.env.test` has correct credentials
- Verify test users exist in Supabase database

### RLS policy errors
- Make sure test user has proper organization membership
- Check that RLS policies in Supabase are configured correctly
- Use service role key for tests that need to bypass RLS (use sparingly)

### Test timeouts
- Real database operations take longer than mocks
- Increase test timeout if needed: `test('name', async () => {...}, 10000)`
- Use `waitForSupabaseOperation()` for async operations

## Best Practices

1. **Always clean up**: Use `cleanupTestData()` to remove created test data
2. **Use specific filters**: Filter by organization_id to avoid interfering with other tests
3. **Test isolation**: Each test should be independent and not rely on other test data
4. **Meaningful assertions**: Test against schema structure, not just existence
5. **Test RLS**: Verify security policies work correctly with real auth
