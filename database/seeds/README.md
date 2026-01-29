# Database Seed Scripts

This directory contains SQL seed scripts for populating the PierceDesk database with realistic multi-tenant test data.

## Overview

The seed scripts create a complete set of CRM test data across two isolated organizations to verify multi-tenant data isolation and test various user roles and permissions.

## Seed Files

Execute seeds in this order:

1. **01-organizations.sql** - Creates 2 test organizations
2. **02-user-profiles.sql** - Creates test users and organization memberships
3. **03-crm-entities.sql** - Creates CRM data (accounts, contacts, leads, opportunities, proposals)

## Test Organizations

### Organization 1: Acme Corporation
- **Slug:** `acme-corp`
- **Subscription:** Professional (Active)
- **Users:** 3 users with different roles
  - Alice Admin (`admin@acme-corp.com`) - Admin role
  - Bob Sales (`sales@acme-corp.com`) - Manager role
  - Carol Manager (`manager@acme-corp.com`) - Member role

### Organization 2: TechStart Industries
- **Slug:** `techstart`
- **Subscription:** Basic (Active)
- **Users:** 2 users
  - David CEO (`ceo@techstart.com`) - Admin role
  - Eve Rep (`rep@techstart.com`) - Member role

## Test Data Summary

### Acme Corporation (Org 1)
- **Accounts:** 3 (Global Bank Corp, MegaRetail Inc, TechVentures LLC)
- **Contacts:** 4 contacts across accounts
- **Leads:** 3 leads in various stages
- **Opportunities:** 3 opportunities ($750K total value)
- **Proposals:** 2 proposals with detailed line items

### TechStart Industries (Org 2)
- **Accounts:** 2 (SecureBuildings Co, HealthCare Systems)
- **Contacts:** 2 contacts
- **Leads:** 2 leads
- **Opportunities:** 2 opportunities ($1.05M total value)
- **Proposals:** 1 proposal with line items

## Running Seeds

### Using Supabase MCP Tools (Recommended)

Since the database is hosted in Supabase cloud, use the Supabase MCP tools to execute seeds:

```javascript
// Example using execute_sql MCP tool
const projectId = 'iixfjulmrexivuehoxti';

// Read and execute each seed file
const seeds = [
  '01-organizations.sql',
  '02-user-profiles.sql',
  '03-crm-entities.sql'
];

for (const seedFile of seeds) {
  const sql = await readFile(`database/seeds/${seedFile}`);
  await mcp__plugin_supabase_supabase__execute_sql({
    project_id: projectId,
    query: sql
  });
}
```

### Manual Execution via Supabase Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Copy/paste each seed file in order
3. Click "Run" to execute

## Verification Queries

After running seeds, verify data isolation:

```sql
-- Count entities per organization
SELECT
  o.name AS organization,
  COUNT(DISTINCT a.id) AS accounts,
  COUNT(DISTINCT c.id) AS contacts,
  COUNT(DISTINCT l.id) AS leads,
  COUNT(DISTINCT op.id) AS opportunities,
  COUNT(DISTINCT p.id) AS proposals
FROM organizations o
LEFT JOIN accounts a ON a.organization_id = o.id
LEFT JOIN contacts c ON c.organization_id = o.id
LEFT JOIN leads l ON l.organization_id = o.id
LEFT JOIN opportunities op ON op.organization_id = o.id
LEFT JOIN proposals p ON p.organization_id = o.id
WHERE o.id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
)
GROUP BY o.id, o.name;

-- Verify RLS: Check that org 1 data is isolated from org 2
SELECT COUNT(*) FROM accounts
WHERE organization_id = '00000000-0000-0000-0000-000000000001'; -- Should be 3

SELECT COUNT(*) FROM accounts
WHERE organization_id = '00000000-0000-0000-0000-000000000002'; -- Should be 2
```

## Resetting Test Data

To reset test data while preserving the schema:

```sql
-- Delete in reverse dependency order
DELETE FROM proposal_line_items
WHERE organization_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
);

DELETE FROM proposals
WHERE organization_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
);

DELETE FROM opportunities
WHERE organization_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
);

DELETE FROM leads
WHERE organization_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
);

DELETE FROM contacts
WHERE organization_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
);

DELETE FROM accounts
WHERE organization_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
);

DELETE FROM organization_members
WHERE organization_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
);

DELETE FROM user_profiles
WHERE id LIKE '10000000-0000-0000-0000-%'
   OR id LIKE '20000000-0000-0000-0000-%';

DELETE FROM organizations
WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
);

-- Then re-run seeds
```

## ID Ranges

Seeds use predictable ID patterns for easy identification:

- **Organizations:** `00000000-0000-0000-0000-00000000000X`
- **Org 1 Users:** `10000000-0000-0000-0000-00000000000X`
- **Org 2 Users:** `20000000-0000-0000-0000-00000000000X`
- **Org 1 Accounts:** `30000000-0000-0000-0000-00000000000X`
- **Org 1 Contacts:** `31000000-0000-0000-0000-00000000000X`
- **Org 1 Leads:** `32000000-0000-0000-0000-00000000000X`
- **Org 1 Opportunities:** `33000000-0000-0000-0000-00000000000X`
- **Org 1 Proposals:** `34000000-0000-0000-0000-00000000000X`
- **Org 1 Line Items:** `35000000-0000-0000-0000-00000000000X`
- **Org 2 Accounts:** `40000000-0000-0000-0000-00000000000X`
- **Org 2 Contacts:** `41000000-0000-0000-0000-00000000000X`
- **Org 2 Leads:** `42000000-0000-0000-0000-00000000000X`
- **Org 2 Opportunities:** `43000000-0000-0000-0000-00000000000X`
- **Org 2 Proposals:** `44000000-0000-0000-0000-00000000000X`
- **Org 2 Line Items:** `45000000-0000-0000-0000-00000000000X`

## Important Notes

### User Profile Auth Dependency

The `02-user-profiles.sql` script creates user_profiles records, but these reference auth.users IDs. In a production scenario, you would:

1. Create users via Supabase Auth first (sign up flow)
2. Then seed user_profiles using the actual auth.users IDs

For testing purposes, the seed script uses predictable UUIDs, but these will only work if you:
- Manually create corresponding auth.users records via Supabase Dashboard, OR
- Modify the script to use actual auth.users IDs from your test environment

### RLS Policies

All seeded data respects Row Level Security (RLS) policies. When testing:
- Users can only see data from their own organization
- Admin/Manager roles have broader access within their organization
- Cross-organization data access should be blocked by RLS

### Customization

To customize test data:
- Modify organization names, slugs, or subscription tiers in `01-organizations.sql`
- Adjust user roles and emails in `02-user-profiles.sql`
- Add more CRM entities or change values in `03-crm-entities.sql`
- Maintain ID ranges to avoid conflicts

## Testing Multi-Tenancy

Use these seeds to test:

1. **Data Isolation:** Verify org 1 users cannot access org 2 data
2. **Role-Based Access:** Test admin vs. member permissions within same org
3. **RLS Enforcement:** Confirm database policies block unauthorized access
4. **CRUD Operations:** Test create, read, update, delete for each entity type
5. **Cross-References:** Verify foreign key relationships work correctly

## Troubleshooting

**Foreign Key Violations:**
- Ensure seeds are run in order (organizations → users → CRM entities)
- Check that parent records exist before inserting child records

**Duplicate Key Errors:**
- Seeds use `ON CONFLICT DO UPDATE` to allow re-running
- Safe to re-run individual seed files

**RLS Policy Errors:**
- Ensure you're running seeds as a superuser or with RLS disabled for seeding
- In Supabase SQL Editor, RLS is bypassed for admin queries
