# RBAC (Role-Based Access Control) Verification Guide

## Overview

This guide documents how to verify Role-Based Access Control (RBAC) policies that work in conjunction with Row Level Security (RLS) for multi-tenant data isolation.

**RBAC adds a second layer** on top of RLS:
- **RLS**: Ensures users only see data from their organization
- **RBAC**: Ensures users only modify data they own or are authorized to access within their organization

## Prerequisites

Before running RBAC verification:

- ✅ RLS verification complete (see [RLS-VERIFICATION-GUIDE.md](./RLS-VERIFICATION-GUIDE.md))
- ✅ All CRM tables have RLS policies enabled
- ✅ Test organizations and users seeded in database
- ✅ RBAC fields exist in schema (`assigned_to`, `owner_id`, `created_by`)

## RBAC Role Definitions

### User Roles in PierceDesk

| Role | Permissions | Typical Use Case |
|------|-------------|------------------|
| **owner** | Full access to all organization data | Organization owner/founder |
| **admin** | Full access to all organization data | System administrators |
| **manager** | Read all, edit all | Sales managers, team leads |
| **member** | Read all, edit only assigned/owned records | Sales reps, regular users |

### RBAC Fields in Database

Each CRM entity table contains one or more of these RBAC fields:

| Field | Type | Purpose |
|-------|------|---------|
| `created_by` | uuid | User who created the record |
| `assigned_to` | uuid | User assigned to work on the record (leads) |
| `owner_id` | uuid | User who owns/manages the record (opportunities, accounts) |

## RBAC Policy Patterns

### Pattern 1: Admin/Manager Full Access

Admins and managers can modify any record in their organization:

```sql
CREATE POLICY "leads_update_policy_rbac" ON leads
  FOR UPDATE USING (
    organization_id::text = current_setting('app.current_org_id', true)
    AND (
      -- User owns/created/assigned to the record
      assigned_to = auth.uid()
      OR created_by = auth.uid()
      -- OR user has admin/manager role
      OR EXISTS (
        SELECT 1 FROM organization_members
        WHERE user_id = auth.uid()
        AND organization_id = leads.organization_id
        AND role IN ('owner', 'admin', 'manager')
      )
    )
  );
```

### Pattern 2: Creator/Owner Modification

Regular members can only modify records they created or own:

```sql
CREATE POLICY "accounts_update_policy_rbac" ON accounts
  FOR UPDATE USING (
    organization_id::text = current_setting('app.current_org_id', true)
    AND (
      owner_id = auth.uid()
      OR created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM organization_members
        WHERE user_id = auth.uid()
        AND organization_id = accounts.organization_id
        AND role IN ('owner', 'admin', 'manager')
      )
    )
  );
```

### Pattern 3: Read All, Edit Assigned/Owned

All users can view organization data, but only modify what's assigned to them:

```sql
-- SELECT: All users in organization can read
CREATE POLICY "leads_select_policy" ON leads
  FOR SELECT USING (
    organization_id::text = current_setting('app.current_org_id', true)
  );

-- UPDATE: Only assigned users or admins/managers
CREATE POLICY "leads_update_policy_rbac" ON leads
  FOR UPDATE USING (
    organization_id::text = current_setting('app.current_org_id', true)
    AND (
      assigned_to = auth.uid()
      OR created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM organization_members
        WHERE user_id = auth.uid()
        AND organization_id = leads.organization_id
        AND role IN ('owner', 'admin', 'manager')
      )
    )
  );
```

## Manual Verification Procedures

### Test Case 1: Member Can Edit Assigned Lead

**Setup:**
1. Login as `charlie.member@seedtest.com` (member role in Acme)
2. Ensure there's a lead assigned to Charlie (`assigned_to = charlie's UUID`)

**Steps:**
1. Navigate to `/apps/crm/leads`
2. Find the assigned lead in the list
3. Click edit button
4. Modify the lead (e.g., change company name)
5. Save changes
6. Verify changes persist

**Expected Result:** ✅ Member can successfully edit their assigned lead

---

### Test Case 2: Member Cannot Edit Unassigned Lead

**Setup:**
1. Login as `charlie.member@seedtest.com` (member role in Acme)
2. Ensure there's a lead NOT assigned to Charlie (assigned to someone else or null)

**Steps:**
1. Navigate to `/apps/crm/leads`
2. Find an unassigned lead in the list
3. Try to click edit button (should be disabled or hidden)
4. If edit is possible, attempt to modify and save
5. Verify changes are rejected

**Expected Result:** ❌ Member cannot edit unassigned leads (UI prevents or API rejects)

---

### Test Case 3: Manager Can Edit Any Lead

**Setup:**
1. Login as `bob.admin@seedtest.com` (manager role in Acme)
2. Verify lead is assigned to another user (Charlie)

**Steps:**
1. Navigate to `/apps/crm/leads`
2. Find Charlie's assigned lead
3. Click edit button
4. Modify the lead
5. Save changes
6. Verify changes persist

**Expected Result:** ✅ Manager can edit any lead in the organization

---

### Test Case 4: Admin Can Edit All Records

**Setup:**
1. Login as `alice.owner@seedtest.com` (admin role in Acme)

**Steps:**
1. Navigate to `/apps/crm/leads`, `/apps/crm/opportunities`, `/apps/crm/accounts`
2. For each entity, find records owned/assigned to different users
3. Edit and save changes to each record
4. Verify all changes persist

**Expected Result:** ✅ Admin can edit all records regardless of assignment

---

## Entity-Specific RBAC Rules

### Leads (`assigned_to` field)

- **SELECT**: All users in organization
- **INSERT**: All users can create leads (auto-assign `created_by`)
- **UPDATE**: Assigned user OR creator OR admin/manager
- **DELETE**: Creator OR admin/manager

### Opportunities (`owner_id` field)

- **SELECT**: All users in organization
- **INSERT**: All users can create opportunities (auto-assign `owner_id`)
- **UPDATE**: Owner OR admin/manager
- **DELETE**: Owner OR admin/manager

### Proposals (`created_by` field)

- **SELECT**: All users in organization
- **INSERT**: All users can create proposals (auto-assign `created_by`)
- **UPDATE**: Creator OR admin/manager
- **DELETE**: Creator OR admin/manager

### Contacts (`created_by` field)

- **SELECT**: All users in organization
- **INSERT**: All users can create contacts
- **UPDATE**: Creator OR admin/manager
- **DELETE**: Creator OR admin/manager

### Accounts (`owner_id` field)

- **SELECT**: All users in organization
- **INSERT**: All users can create accounts (auto-assign `owner_id`)
- **UPDATE**: Owner OR creator OR admin/manager
- **DELETE**: Owner OR creator OR admin/manager

## Implementation SQL

### Step 1: Drop Existing Policies

```sql
-- Drop existing policies (they will be recreated with RBAC checks)
DROP POLICY IF EXISTS "leads_update_policy" ON leads;
DROP POLICY IF EXISTS "opportunities_update_policy" ON opportunities;
DROP POLICY IF EXISTS "proposals_update_policy" ON proposals;
DROP POLICY IF EXISTS "contacts_update_policy" ON contacts;
DROP POLICY IF EXISTS "accounts_update_policy" ON accounts;

DROP POLICY IF EXISTS "leads_delete_policy" ON leads;
DROP POLICY IF EXISTS "opportunities_delete_policy" ON opportunities;
DROP POLICY IF EXISTS "proposals_delete_policy" ON proposals;
DROP POLICY IF EXISTS "contacts_delete_policy" ON contacts;
DROP POLICY IF EXISTS "accounts_delete" ON accounts;
```

### Step 2: Create RBAC-Enhanced Policies

#### Leads Policies

```sql
-- Leads: UPDATE policy with RBAC (assigned_to check)
CREATE POLICY "leads_update_policy_rbac" ON leads
  FOR UPDATE USING (
    organization_id::text = current_setting('app.current_org_id', true)
    AND (
      assigned_to = auth.uid()
      OR created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM organization_members
        WHERE user_id = auth.uid()
        AND organization_id = leads.organization_id
        AND role IN ('owner', 'admin', 'manager')
      )
    )
  );

-- Leads: DELETE policy with RBAC
CREATE POLICY "leads_delete_policy_rbac" ON leads
  FOR DELETE USING (
    organization_id::text = current_setting('app.current_org_id', true)
    AND (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM organization_members
        WHERE user_id = auth.uid()
        AND organization_id = leads.organization_id
        AND role IN ('owner', 'admin', 'manager')
      )
    )
  );
```

#### Opportunities Policies

```sql
-- Opportunities: UPDATE policy with RBAC (owner_id check)
CREATE POLICY "opportunities_update_policy_rbac" ON opportunities
  FOR UPDATE USING (
    organization_id::text = current_setting('app.current_org_id', true)
    AND (
      owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM organization_members
        WHERE user_id = auth.uid()
        AND organization_id = opportunities.organization_id
        AND role IN ('owner', 'admin', 'manager')
      )
    )
  );

-- Opportunities: DELETE policy with RBAC
CREATE POLICY "opportunities_delete_policy_rbac" ON opportunities
  FOR DELETE USING (
    organization_id::text = current_setting('app.current_org_id', true)
    AND (
      owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM organization_members
        WHERE user_id = auth.uid()
        AND organization_id = opportunities.organization_id
        AND role IN ('owner', 'admin', 'manager')
      )
    )
  );
```

#### Proposals Policies

```sql
-- Proposals: UPDATE policy with RBAC (created_by check)
CREATE POLICY "proposals_update_policy_rbac" ON proposals
  FOR UPDATE USING (
    organization_id::text = current_setting('app.current_org_id', true)
    AND (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM organization_members
        WHERE user_id = auth.uid()
        AND organization_id = proposals.organization_id
        AND role IN ('owner', 'admin', 'manager')
      )
    )
  );

-- Proposals: DELETE policy with RBAC
CREATE POLICY "proposals_delete_policy_rbac" ON proposals
  FOR DELETE USING (
    organization_id::text = current_setting('app.current_org_id', true)
    AND (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM organization_members
        WHERE user_id = auth.uid()
        AND organization_id = proposals.organization_id
        AND role IN ('owner', 'admin', 'manager')
      )
    )
  );
```

#### Contacts Policies

```sql
-- Contacts: UPDATE policy with RBAC (created_by check)
CREATE POLICY "contacts_update_policy_rbac" ON contacts
  FOR UPDATE USING (
    organization_id::text = current_setting('app.current_org_id', true)
    AND (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM organization_members
        WHERE user_id = auth.uid()
        AND organization_id = contacts.organization_id
        AND role IN ('owner', 'admin', 'manager')
      )
    )
  );

-- Contacts: DELETE policy with RBAC
CREATE POLICY "contacts_delete_policy_rbac" ON contacts
  FOR DELETE USING (
    organization_id::text = current_setting('app.current_org_id', true)
    AND (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM organization_members
        WHERE user_id = auth.uid()
        AND organization_id = contacts.organization_id
        AND role IN ('owner', 'admin', 'manager')
      )
    )
  );
```

#### Accounts Policies

```sql
-- Accounts: UPDATE policy with RBAC (owner_id check)
CREATE POLICY "accounts_update_policy_rbac" ON accounts
  FOR UPDATE USING (
    organization_id::text = current_setting('app.current_org_id', true)
    AND (
      owner_id = auth.uid()
      OR created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM organization_members
        WHERE user_id = auth.uid()
        AND organization_id = accounts.organization_id
        AND role IN ('owner', 'admin', 'manager')
      )
    )
  );

-- Accounts: DELETE policy with RBAC
CREATE POLICY "accounts_delete_policy_rbac" ON accounts
  FOR DELETE USING (
    organization_id::text = current_setting('app.current_org_id', true)
    AND (
      owner_id = auth.uid()
      OR created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM organization_members
        WHERE user_id = auth.uid()
        AND organization_id = accounts.organization_id
        AND role IN ('owner', 'admin', 'manager')
      )
    )
  );
```

### Step 3: Verify Policies Created

```sql
-- List all RBAC policies
SELECT
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('leads', 'opportunities', 'proposals', 'contacts', 'accounts')
  AND policyname LIKE '%rbac%'
ORDER BY tablename, policyname;
```

**Expected:** 10 policies (UPDATE + DELETE for 5 entities)

## Automated Testing

Automated RBAC tests should cover all 4 manual test cases across all entities.

**Test File:** `tests/security/rbac-verification.spec.js`

**Test Coverage:**
- Member can edit assigned/owned records
- Member cannot edit unassigned/unowned records
- Manager can edit any record in organization
- Admin can edit all records

**Total Tests:** 4 test cases × 5 entities = 20 automated RBAC tests

## Success Criteria

✅ **Database Configuration**
- RBAC policies created for all CRM tables
- Policies check both `organization_id` AND ownership fields
- Policies reference `organization_members` for role checks

✅ **Manual Verification**
- All 4 test cases pass for leads
- Test cases documented with screenshots/evidence

✅ **Automated Testing**
- 4 automated tests implemented and passing
- Tests cover member, manager, and admin roles
- Tests verify both positive (can edit) and negative (cannot edit) cases

✅ **Documentation**
- RBAC rules clearly documented
- Policy implementation SQL provided
- Verification procedures defined

## Troubleshooting

### Issue: Member Can Edit Unassigned Records

**Diagnosis:**
```sql
-- Check if RBAC policy exists and is correct
SELECT policyname, qual FROM pg_policies
WHERE tablename = 'leads' AND policyname LIKE '%update%rbac%';
```

**Solution:** Verify policy includes ownership checks (assigned_to, owner_id, created_by)

### Issue: Manager Cannot Edit Records

**Diagnosis:**
```sql
-- Check user's role in organization_members
SELECT role FROM organization_members
WHERE user_id = 'manager-uuid'
AND organization_id = 'org-uuid';
```

**Solution:** Ensure role is 'manager', 'admin', or 'owner' (case-sensitive)

### Issue: RBAC Policies Not Enforcing

**Diagnosis:**
```sql
-- Verify current_setting is being set
SELECT current_setting('app.current_org_id', true);
```

**Solution:** Ensure Supabase client sets organization context on login

### Issue: Performance Degradation with RBAC Policies

**Diagnosis:**
```sql
-- Check if index exists on organization_members
EXPLAIN ANALYZE
SELECT 1 FROM organization_members
WHERE user_id = 'test-uuid'
AND organization_id = 'org-uuid'
AND role IN ('owner', 'admin', 'manager');
```

**Solution:** Create composite index on `organization_members(organization_id, user_id, role)`

```sql
CREATE INDEX IF NOT EXISTS idx_org_members_rbac
ON organization_members(organization_id, user_id, role)
WHERE is_active = true;
```

## References

- [RLS Verification Guide](./RLS-VERIFICATION-GUIDE.md)
- [Security Audit](./SECURITY-AUDIT.md)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

## Appendix: Complete Policy Reference

For a complete reference of all RLS + RBAC policies, see the Implementation SQL section above. Each policy:

1. **Checks organization isolation** (`organization_id`)
2. **Checks ownership** (`assigned_to`, `owner_id`, `created_by`)
3. **Allows admin/manager override** (via `organization_members` role check)

This layered approach ensures:
- Users only see their organization's data (RLS)
- Users only modify data they own or are authorized to access (RBAC)
- Admins and managers have full control over their organization (Role hierarchy)
