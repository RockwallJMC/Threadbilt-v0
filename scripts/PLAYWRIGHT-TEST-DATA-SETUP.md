# Playwright Test Data Setup Guide

This guide explains how to set up test data in Supabase for Playwright E2E tests.

## Current Status

### ✅ Already Complete

1. **Test Organizations** - Already exist in database:
   - Test Organization A (id: `00000000-0000-0000-0000-000000000001`, slug: `test-org-a`)
   - Test Organization B (id: `00000000-0000-0000-0000-000000000002`, slug: `test-org-b`)

### ⚠️ Requires Manual Action

2. **Test Users** - Need to be created via Supabase Dashboard

## Step-by-Step Instructions

### Step 1: Create Auth Users (Manual - Required)

Auth users **cannot** be created via SQL. You must create them through the Supabase Dashboard:

1. Go to https://supabase.com/dashboard
2. Select project **PierceDesk** (`iixfjulmrexivuehoxti`)
3. Navigate to **Authentication → Users** in the left sidebar
4. Click **Add User** button (top right)
5. Create each user with these details:

#### User 1: Existing User
- **Email**: `test-existing@piercedesk.test`
- **Password**: `TestPassword123!`
- **Auto Confirm Email**: ✅ Yes
- **Purpose**: Used to test duplicate signup flows

#### User 2: Single Organization User
- **Email**: `test-single-org@piercedesk.test`
- **Password**: `TestPassword123!`
- **Auto Confirm Email**: ✅ Yes
- **Purpose**: User with membership in only one organization

#### User 3: Multi-Organization User
- **Email**: `test-multi-org@piercedesk.test`
- **Password**: `TestPassword123!`
- **Auto Confirm Email**: ✅ Yes
- **Purpose**: User with memberships in multiple organizations

### Step 2: Link Users to Organizations (Automated)

After creating the auth users, run the SQL script to link them to organizations:

```bash
# Option A: Using Supabase SQL Editor in Dashboard
# 1. Go to SQL Editor in Supabase Dashboard
# 2. Copy and paste contents of: scripts/link-test-users-to-orgs.sql
# 3. Click "Run" button

# Option B: Using psql (if you have database password)
psql "postgresql://postgres:[YOUR-PASSWORD]@db.iixfjulmrexivuehoxti.supabase.co:5432/postgres" \
  -f scripts/link-test-users-to-orgs.sql
```

Or use the MCP tools via Claude Code (preferred):

```
Ask Claude to run: scripts/link-test-users-to-orgs.sql using Supabase MCP tools
```

## Expected Result

After completing both steps, you should have:

### Auth Users (3 total)
- ✅ test-existing@piercedesk.test
- ✅ test-single-org@piercedesk.test
- ✅ test-multi-org@piercedesk.test

### Organization Memberships (4 total)
- ✅ test-existing@piercedesk.test → Test Organization A (member)
- ✅ test-single-org@piercedesk.test → Test Organization A (member)
- ✅ test-multi-org@piercedesk.test → Test Organization A (member)
- ✅ test-multi-org@piercedesk.test → Test Organization B (member)

## Verification

To verify the setup is complete, run this query in Supabase SQL Editor:

```sql
SELECT
  u.email,
  o.name as organization_name,
  om.role
FROM auth.users u
LEFT JOIN organization_members om ON om.user_id = u.id
LEFT JOIN organizations o ON o.id = om.organization_id
WHERE u.email LIKE '%@piercedesk.test'
ORDER BY u.email, o.name;
```

Expected output:
```
test-existing@piercedesk.test      | Test Organization A | member
test-multi-org@piercedesk.test     | Test Organization A | member
test-multi-org@piercedesk.test     | Test Organization B | member
test-single-org@piercedesk.test    | Test Organization A | member
```

## Test Configuration Files

The test credentials are configured in:
- **`.env.test`** - Contains all test user emails and passwords
- **`playwright.config.ts`** - Playwright configuration using .env.test

## Troubleshooting

### Users don't appear after creation
- Check that "Auto Confirm Email" was checked
- Verify users exist: `SELECT * FROM auth.users WHERE email LIKE '%@piercedesk.test';`

### Organization memberships not created
- Ensure auth users were created first
- Check user_profiles table exists: `SELECT * FROM user_profiles WHERE email LIKE '%@piercedesk.test';`
- The trigger should auto-create user_profiles entries

### Tests fail with "User not found"
- Verify users are confirmed (email_confirmed_at is not null)
- Check that organization memberships exist
- Ensure .env.test is being loaded by Playwright

## Security Notes

- These are **test-only** credentials with `.test` domain
- Test organizations use predictable UUIDs (all zeros with incremental IDs)
- **DO NOT** use these credentials in production
- Test database is isolated from production data
