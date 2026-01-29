# RLS Policy Verification Guide

## Overview

This guide documents how to verify Row Level Security (RLS) policies when Phase 1.2 (Auth & Multi-Tenancy) is complete.

RLS policies ensure that users can only access data belonging to their organization, preventing cross-organization data leaks.

## Prerequisites

Before running verification:

- ✅ Phase 1.2 complete (Auth & Multi-Tenancy)
- ✅ Multiple test organizations created in database
- ✅ Test users created in each organization
- ✅ Supabase RLS policies enabled on all CRM tables
- ✅ Database properly seeded with test data

## Verification Steps

### 1. Database Policy Inspection

Use Supabase MCP tools or SQL client to verify RLS configuration:

```sql
-- Verify RLS enabled on all tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('leads', 'opportunities', 'proposals', 'contacts', 'accounts')
ORDER BY tablename;

-- Expected: rowsecurity = true for all tables

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected: At least 1 policy per table with organization_id check
```

**What to verify:**
- ✅ All 5 CRM tables have `rowsecurity = true`
- ✅ Each table has SELECT, INSERT, UPDATE, DELETE policies
- ✅ Policies include `organization_id` filtering
- ✅ Policies use `auth.uid()` or `current_setting('app.current_org_id')`

### 2. Manual Testing Procedures

#### Test Case 1: Create Data in Organization A

1. Login as `user-a@org-a.com`
2. Navigate to `/apps/crm/leads`
3. Create a new lead:
   - Name: "Test Lead A"
   - Company: "Org A Company"
   - Email: "test-a@org-a.com"
4. Note the lead ID (e.g., `lead_abc123`)
5. Verify lead appears in list
6. Logout

**Expected Result**: Lead created successfully and visible to Org A user.

#### Test Case 2: Verify Organization B Cannot Access

1. Login as `user-b@org-b.com`
2. Navigate to `/apps/crm/leads`
3. Verify "Test Lead A" is **NOT** in the list
4. Try to access lead directly: `/apps/crm/leads/lead_abc123`
5. Expected: Access Denied or 404 error

**Expected Result**: Org B user cannot see or access Org A's lead.

#### Test Case 3: Verify Organization A Can Still Access

1. Login as `user-a@org-a.com`
2. Navigate to `/apps/crm/leads/lead_abc123`
3. Verify lead details load successfully
4. Edit lead and save changes
5. Verify changes persist

**Expected Result**: Org A user maintains full access to their data.

#### Test Case 4: Cross-Organization Data Modification Attempt

1. Login as `user-b@org-b.com`
2. Use browser DevTools to attempt API call:
   ```javascript
   fetch('/api/crm/leads/lead_abc123', {
     method: 'PUT',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ company: 'Hacked!' })
   })
   ```
3. Expected: 403 Forbidden or 404 Not Found

**Expected Result**: API rejects cross-organization modification attempts.

### 3. Repeat for All Entities

Run Test Cases 1-4 for each CRM entity:

- [x] **Leads** (`/apps/crm/leads`)
- [ ] **Opportunities** (`/apps/crm/opportunities`)
- [ ] **Proposals** (`/apps/crm/proposals`)
- [ ] **Contacts** (`/apps/crm/contacts`)
- [ ] **Accounts** (`/apps/crm/accounts`)

**Total Manual Tests**: 4 test cases × 5 entities = 20 verification procedures

### 4. Automated Testing

After manual verification succeeds, enable skipped Playwright tests:

```bash
# Location of skipped tests
tests/crm-multi-user-isolation.spec.js          # 5 tests
tests/crm-leads-multi-tenancy.spec.js          # Tests from Phase 1.3 (if exist)
tests/crm-opportunities-multi-tenancy.spec.js  # Tests from Phase 1.4 (if exist)
tests/crm-proposals-multi-tenancy.spec.js      # Tests from Phase 1.6 (if exist)
tests/crm-accounts-multi-tenancy.spec.js       # Tests from Phase 1.5 (if exist)
tests/crm-contacts-multi-tenancy.spec.js       # Tests from Phase 1.5 (if exist)
```

**Remove `.skip()` from test files and run:**

```bash
# Run all multi-tenancy tests
npx playwright test tests/*-multi-tenancy.spec.js tests/*multi-user*.spec.js

# Expected: All tests pass (18+ tests)
```

### 5. Edge Cases to Test

#### Shared Data Scenarios

If any tables contain shared/public data:

```sql
-- Example: Public lookup tables (if applicable)
SELECT * FROM public_lookup_table WHERE organization_id IS NULL;
```

- [ ] Verify shared data accessible to all organizations
- [ ] Verify shared data is read-only (if applicable)
- [ ] Verify shared data doesn't leak organization-specific info

#### Admin Access Levels

Test different user roles:

1. **Super Admin** (if implemented)
   - Should see all organizations' data
   - Verify explicit permission grant in RLS policy

2. **Organization Admin**
   - Should see only their organization's data
   - Same isolation as regular users

3. **Read-Only User** (if implemented)
   - Should see organization data but cannot modify
   - Verify UPDATE/DELETE policies reject attempts

#### Cross-Organization Operations

Attempt to link entities across organizations:

```javascript
// Try to link Org B contact to Org A opportunity
PUT /api/opportunities/opp_org_a_123
{
  "contact_id": "contact_org_b_456"  // Different organization
}
```

**Expected**: Operation rejected by RLS policies or application logic.

### 6. Performance Impact Testing

Measure RLS policy performance:

```sql
-- Test query performance with RLS
EXPLAIN ANALYZE
SELECT * FROM leads
WHERE organization_id = current_setting('app.current_org_id')::uuid;

-- Expected: Index scan on organization_id, < 10ms for 1000 rows
```

**Verify:**
- [ ] Index exists on `organization_id` column for each table
- [ ] Query planner uses index (shown in EXPLAIN ANALYZE)
- [ ] Query time acceptable (< 10ms for reasonable data volumes)
- [ ] No sequential scans on large tables

**If performance issues found:**

```sql
-- Create missing index
CREATE INDEX IF NOT EXISTS idx_leads_org_id
ON leads(organization_id);

-- Consider partial indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_org_status
ON leads(organization_id, status)
WHERE status != 'archived';
```

### 7. Security Audit Checklist

After completing all tests:

- [ ] All 5 CRM tables have RLS enabled
- [ ] Each table has isolation policy with `organization_id` check
- [ ] Manual testing shows proper isolation (20 test procedures)
- [ ] Automated multi-tenancy tests passing (18+ tests)
- [ ] Performance acceptable (< 10ms query time with RLS)
- [ ] Edge cases handled correctly (shared data, admin access, cross-org ops)
- [ ] Documentation updated with findings

## Expected Results

### Success Criteria

✅ **Database Configuration**
- RLS enabled on all tables
- Policies exist and reference `organization_id`
- Indexes optimize RLS query performance

✅ **Manual Testing**
- All 20 test procedures pass
- No cross-organization data access
- No cross-organization data modification

✅ **Automated Testing**
- 18+ multi-tenancy E2E tests passing
- Tests cover all CRUD operations
- Tests cover all 5 CRM entities

✅ **Performance**
- Query time < 10ms with RLS enabled
- No performance degradation vs. non-RLS queries
- Indexes properly utilized

✅ **Edge Cases**
- Shared data handled correctly
- Admin permissions work as expected
- Cross-organization operations properly rejected

## Troubleshooting

### Issue: RLS Policy Not Enforced

**Symptoms**: Users can see data from other organizations

**Diagnosis**:
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'leads';
```

**Solution**:
```sql
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
```

### Issue: Policy Exists But Not Working

**Symptoms**: RLS enabled but isolation not working

**Diagnosis**:
```sql
-- Check policy definition
SELECT * FROM pg_policies WHERE tablename = 'leads';
```

**Common Problems**:
- Policy doesn't reference `organization_id`
- Wrong comparison operator used
- Session variable not set correctly

**Solution**:
```sql
-- Drop and recreate policy
DROP POLICY IF EXISTS leads_isolation ON leads;

CREATE POLICY leads_isolation ON leads
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);
```

### Issue: Performance Degradation

**Symptoms**: Queries slow with RLS enabled

**Diagnosis**:
```sql
EXPLAIN ANALYZE SELECT * FROM leads
WHERE organization_id = current_setting('app.current_org_id')::uuid;
```

**Look for**: "Seq Scan" instead of "Index Scan"

**Solution**:
```sql
-- Create index on organization_id
CREATE INDEX idx_leads_org_id ON leads(organization_id);

-- Verify index is used
EXPLAIN ANALYZE SELECT * FROM leads
WHERE organization_id = current_setting('app.current_org_id')::uuid;
```

### Issue: Tests Failing After Enabling

**Symptoms**: Automated tests fail after removing `.skip()`

**Common Causes**:
1. Test users don't belong to correct organizations
2. Session context not set correctly in tests
3. Supabase client not initialized with auth token

**Solution**:
```javascript
// In test setup
test.beforeEach(async ({ page }) => {
  // Login and set auth context
  await page.goto('/authentication/default/jwt/login');
  await page.getByLabel('Email').fill('user-a@org-a.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for auth state to persist
  await page.waitForURL('/apps/crm/dashboard');
});
```

### Issue: Cannot Access Own Data

**Symptoms**: Users locked out of their own organization's data

**Diagnosis**:
```sql
-- Check if organization_id is being set
SELECT current_setting('app.current_org_id', true);
```

**Solution**: Verify middleware sets organization context:
```javascript
// In Supabase client initialization
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  await supabase.rpc('set_current_org', {
    org_id: user.user_metadata.organization_id
  });
}
```

## Post-Verification Actions

After successful RLS verification:

1. **Update Security Audit**
   - Mark RLS checklist items as complete
   - Document any findings or issues resolved
   - Update `docs/SECURITY-AUDIT.md`

2. **Enable Production Deployment**
   - RLS verified and working correctly
   - No known security issues
   - Performance acceptable

3. **Schedule Regular Audits**
   - Re-run verification after schema changes
   - Include in regression testing suite
   - Audit quarterly for compliance

4. **Document Organization Onboarding**
   - How to create new organizations
   - How to assign users to organizations
   - How to verify isolation for new organizations

## References

- [Security Audit](./SECURITY-AUDIT.md)
- [Testing Status](../tests/TESTING-STATUS.md)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

## Appendix: SQL Verification Queries

### Check All Table RLS Status

```sql
SELECT
  schemaname,
  tablename,
  rowsecurity,
  CASE
    WHEN rowsecurity THEN '✅ Enabled'
    ELSE '❌ Disabled'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('leads', 'opportunities', 'proposals', 'contacts', 'accounts')
ORDER BY tablename;
```

### List All Policies with Details

```sql
SELECT
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Test Organization Isolation Query

```sql
-- Set test organization context
SET app.current_org_id = '550e8400-e29b-41d4-a716-446655440000';

-- Query should only return data for this org
SELECT COUNT(*) as my_leads FROM leads;
SELECT COUNT(*) as my_opportunities FROM opportunities;
SELECT COUNT(*) as my_proposals FROM proposals;
SELECT COUNT(*) as my_contacts FROM contacts;
SELECT COUNT(*) as my_accounts FROM accounts;

-- Change to different org
SET app.current_org_id = '660e8400-e29b-41d4-a716-446655440000';

-- Should return different counts
SELECT COUNT(*) as their_leads FROM leads;
```

### Check Index Usage

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('leads', 'opportunities', 'proposals', 'contacts', 'accounts')
  AND indexdef LIKE '%organization_id%'
ORDER BY tablename;
```
