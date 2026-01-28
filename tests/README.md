# Playwright E2E Test Setup Guide

## Overview

This directory contains end-to-end tests for PierceDesk using Playwright. Tests require proper test data setup in your Supabase database.

## Prerequisites

1. **Node.js 20+** installed
2. **Supabase project** with database access
3. **Test users and organizations** created in database

## Environment Configuration

### Step 1: Configure Test Environment

The tests use environment variables defined in `.env.test` at the project root:

```bash
# Located at: /home/pierce/piercedesk6/.env.test
NODE_ENV=test
PLAYWRIGHT_EXISTING_USER_EMAIL=test-existing@piercedesk.test
PLAYWRIGHT_EXISTING_USER_PASSWORD=TestPassword123!
PLAYWRIGHT_SINGLE_ORG_EMAIL=test-single-org@piercedesk.test
PLAYWRIGHT_SINGLE_ORG_PASSWORD=TestPassword123!
PLAYWRIGHT_SINGLE_ORG_NAME=Test Organization A
PLAYWRIGHT_MULTI_ORG_EMAIL=test-multi-org@piercedesk.test
PLAYWRIGHT_MULTI_ORG_PASSWORD=TestPassword123!
PLAYWRIGHT_MULTI_ORG_NAME_1=Test Organization A
PLAYWRIGHT_MULTI_ORG_NAME_2=Test Organization B
```

### Step 2: Create Test Data in Supabase

You need to create test users and organizations in your Supabase database.

#### Option 1: Using Supabase Dashboard (Recommended)

1. **Create Organizations:**
   - Go to Supabase Dashboard → Table Editor → `organizations`
   - Add two organizations:
     - Name: "Test Organization A", Slug: "test-org-a"
     - Name: "Test Organization B", Slug: "test-org-b"

2. **Create Test Users:**
   - Go to Supabase Dashboard → Authentication → Users
   - Click "Add User" and create:
     - Email: `test-existing@piercedesk.test`, Password: `TestPassword123!`
     - Email: `test-single-org@piercedesk.test`, Password: `TestPassword123!`
     - Email: `test-multi-org@piercedesk.test`, Password: `TestPassword123!`

3. **Link Users to Organizations:**
   - Go to Table Editor → `organization_members`
   - Create memberships:
     ```
     | user_id (from auth.users) | organization_id (from organizations) | role   |
     |---------------------------|--------------------------------------|--------|
     | <existing-user-uuid>      | <test-org-a-uuid>                    | member |
     | <single-org-user-uuid>    | <test-org-a-uuid>                    | member |
     | <multi-org-user-uuid>     | <test-org-a-uuid>                    | member |
     | <multi-org-user-uuid>     | <test-org-b-uuid>                    | member |
     ```

#### Option 2: Using SQL Migration

Create a migration file: `supabase/migrations/YYYYMMDD_create_test_data.sql`

```sql
-- Create test organizations
INSERT INTO organizations (name, slug, created_at, updated_at)
VALUES
  ('Test Organization A', 'test-org-a', now(), now()),
  ('Test Organization B', 'test-org-b', now(), now())
ON CONFLICT (slug) DO NOTHING;

-- Note: Users must be created via Supabase Auth Dashboard or API
-- After creating users, run this to link them:

-- Get organization IDs
DO $$
DECLARE
  org_a_id UUID;
  org_b_id UUID;
  existing_user_id UUID;
  single_org_user_id UUID;
  multi_org_user_id UUID;
BEGIN
  -- Get organization IDs
  SELECT id INTO org_a_id FROM organizations WHERE slug = 'test-org-a';
  SELECT id INTO org_b_id FROM organizations WHERE slug = 'test-org-b';

  -- Get user IDs (must be created via Auth first)
  SELECT id INTO existing_user_id FROM auth.users WHERE email = 'test-existing@piercedesk.test';
  SELECT id INTO single_org_user_id FROM auth.users WHERE email = 'test-single-org@piercedesk.test';
  SELECT id INTO multi_org_user_id FROM auth.users WHERE email = 'test-multi-org@piercedesk.test';

  -- Create organization memberships
  INSERT INTO organization_members (user_id, organization_id, role, created_at, updated_at)
  VALUES
    (existing_user_id, org_a_id, 'member', now(), now()),
    (single_org_user_id, org_a_id, 'member', now(), now()),
    (multi_org_user_id, org_a_id, 'member', now(), now()),
    (multi_org_user_id, org_b_id, 'member', now(), now())
  ON CONFLICT (user_id, organization_id) DO NOTHING;
END $$;
```

Then run:
```bash
supabase db push
```

## Running Tests

### Run All Tests

```bash
npm test
# or
npx playwright test
```

### Run Specific Test File

```bash
npx playwright test tests/auth-supabase.spec.js
npx playwright test tests/organization-switching.spec.js
```

### Run Tests in UI Mode (Interactive)

```bash
npx playwright test --ui
```

### Run Tests in Headed Mode (See Browser)

```bash
npx playwright test --headed
```

### Debug a Specific Test

```bash
npx playwright test --debug tests/auth-supabase.spec.js
```

## Test Structure

```
tests/
├── README.md                          # This file
├── helpers/
│   └── playwrightArtifacts.js        # Screenshot capture helper
├── auth-supabase.spec.js             # Authentication tests
├── organization-switching.spec.js    # Organization context tests
├── smoke.spec.js                     # Basic smoke tests
└── account-detail.spec.js            # Account management tests
```

## Test Data Requirements

### Test Users

| User Type | Email | Purpose | Organization Memberships |
|-----------|-------|---------|-------------------------|
| Existing User | `test-existing@piercedesk.test` | Tests duplicate signup detection | Test Organization A |
| Single Org User | `test-single-org@piercedesk.test` | Tests single-organization flow | Test Organization A |
| Multi Org User | `test-multi-org@piercedesk.test` | Tests organization switching | Test Organization A, Test Organization B |

### Organizations

| Name | Slug | Purpose |
|------|------|---------|
| Test Organization A | `test-org-a` | Primary test organization |
| Test Organization B | `test-org-b` | Secondary org for multi-org tests |

## Troubleshooting

### Tests Fail with "Invalid credentials"

**Cause:** Test users don't exist in database or passwords are incorrect.

**Solution:**
1. Verify users exist in Supabase Dashboard → Authentication
2. Check `.env.test` has correct credentials
3. Recreate users if needed

### Tests Skip with "Set PLAYWRIGHT_EXISTING_USER_EMAIL"

**Cause:** Required environment variables not set.

**Solution:**
1. Ensure `.env.test` exists at project root
2. Verify `playwright.config.js` loads `.env.test`
3. Restart test runner after updating env vars

### Organization Tests Fail

**Cause:** Users not linked to organizations, or organizations don't exist.

**Solution:**
1. Check `organizations` table has test organizations
2. Verify `organization_members` table has correct user-org links
3. Ensure user UUIDs and org UUIDs match between tables

### Dev Server Won't Start

**Cause:** Port 4000 already in use or dev server error.

**Solution:**
```bash
# Kill existing dev server
pkill -f "next dev"

# Start fresh
npm run dev
```

## Writing New Tests

When adding new test files:

1. **Import required modules:**
   ```javascript
   const { test, expect } = require('@playwright/test');
   const { captureScreenshot } = require('./helpers/playwrightArtifacts');
   ```

2. **Add screenshot capture:**
   ```javascript
   test.afterEach(async ({ page }, testInfo) => {
     await captureScreenshot(page, testInfo);
   });
   ```

3. **Use environment variables for credentials:**
   ```javascript
   const TEST_USER_EMAIL = process.env.PLAYWRIGHT_TEST_USER_EMAIL || 'fallback@example.com';
   const TEST_USER_PASSWORD = process.env.PLAYWRIGHT_TEST_USER_PASSWORD || 'fallback123';
   ```

4. **Skip tests if credentials missing:**
   ```javascript
   test('my test', async ({ page }) => {
     test.skip(
       !process.env.PLAYWRIGHT_TEST_USER_EMAIL,
       'Set PLAYWRIGHT_TEST_USER_EMAIL to run this test'
     );
     // Test code...
   });
   ```

5. **Follow TDD principles:**
   - Write test first (RED)
   - Implement feature (GREEN)
   - Refactor code (REFACTOR)

## Configuration

**Playwright Config:** `playwright.config.js`
- Loads `.env.test` automatically
- Starts dev server on port 4000
- Runs tests in Chromium by default
- Captures screenshots on failure

**Test Environment:** `.env.test`
- Contains all test-specific environment variables
- Never commit real credentials
- Use test-specific email domain (e.g., `@piercedesk.test`)

## CI/CD Integration

For CI environments, set environment variables in your CI platform:

**GitHub Actions Example:**
```yaml
- name: Run Playwright Tests
  env:
    PLAYWRIGHT_EXISTING_USER_EMAIL: ${{ secrets.TEST_EXISTING_USER_EMAIL }}
    PLAYWRIGHT_EXISTING_USER_PASSWORD: ${{ secrets.TEST_EXISTING_USER_PASSWORD }}
    PLAYWRIGHT_SINGLE_ORG_EMAIL: ${{ secrets.TEST_SINGLE_ORG_EMAIL }}
    # ... other env vars
  run: npx playwright test
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Project Documentation](../docs/guides/DOCUMENTATION-GUIDE.md)
- [Testing Anti-Patterns](./.claude/skills/TDD/testing-anti-patterns.md)

---

**Last Updated:** 2026-01-28
**Maintained By:** Pierce Team
