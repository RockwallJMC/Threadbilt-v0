# useOrganizationApi Verification Plan

This document outlines the verification steps for the organization API hooks.

## Prerequisites

- Supabase database functions must exist:
  - `create_organization_for_user(org_name TEXT, user_id UUID)`
  - `join_organization_by_invite(invite_token TEXT, user_id UUID)`
- User must be authenticated
- Test environment with Supabase connection

## Verification Tests

### 1. useUserOrganizations()

**Purpose:** Fetch user's organizations with membership info

**Test Steps:**

1. Create a test component that uses the hook:
```jsx
import { useUserOrganizations } from 'services/swr/api-hooks/useOrganizationApi';

function TestComponent() {
  const { data, error, isLoading } = useUserOrganizations();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Organizations ({data?.length || 0})</h2>
      {data?.map(org => (
        <div key={org.id}>
          <h3>{org.name}</h3>
          <p>Role: {org.role}</p>
          <p>Active: {org.isActive ? 'Yes' : 'No'}</p>
          <p>Joined: {new Date(org.joinedAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
```

2. Render component with authenticated user
3. Verify organizations load without errors
4. Verify data structure matches expected format
5. Verify empty array returned if no organizations

**Expected Results:**
- Loading state shows initially
- Data contains array of organizations
- Each organization has: id, name, slug, role, isActive, joinedAt
- No authentication errors

### 2. useCreateOrganization()

**Purpose:** Create new organization and add user as owner

**Test Steps:**

1. Create test component:
```jsx
import { useCreateOrganization, useUserOrganizations } from 'services/swr/api-hooks/useOrganizationApi';

function TestComponent() {
  const { trigger, isMutating, error } = useCreateOrganization();
  const { data: orgs, mutate } = useUserOrganizations();

  const handleCreate = async () => {
    try {
      const orgId = await trigger({ name: 'Test Organization' });
      console.log('Created organization:', orgId);
      await mutate(); // Refresh organizations list
    } catch (err) {
      console.error('Failed to create:', err);
    }
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={isMutating}>
        Create Organization
      </button>
      {error && <p>Error: {error.message}</p>}
      <p>Organizations: {orgs?.length || 0}</p>
    </div>
  );
}
```

2. Click create button
3. Verify organization created in database
4. Verify organization appears in user's organizations list
5. Verify user added as owner in organization_members

**Expected Results:**
- Returns organization ID on success
- New organization appears in useUserOrganizations data
- User has 'owner' role
- New organization is marked as active

**Error Cases to Test:**
- Creating organization with duplicate name (should fail or auto-increment slug)
- Creating without authentication (should fail)

### 3. useJoinOrganization()

**Purpose:** Join organization via valid invite code

**Test Steps:**

1. **Setup:** Create test invite code in database
```sql
INSERT INTO organization_invitations (organization_id, token, role, status, expires_at)
VALUES ('existing-org-id', 'test-invite-123', 'member', 'pending', NOW() + INTERVAL '7 days');
```

2. Create test component:
```jsx
import { useJoinOrganization, useUserOrganizations } from 'services/swr/api-hooks/useOrganizationApi';

function TestComponent() {
  const { trigger, isMutating, error } = useJoinOrganization();
  const { data: orgs, mutate } = useUserOrganizations();
  const [inviteCode, setInviteCode] = useState('');

  const handleJoin = async () => {
    try {
      const orgId = await trigger({ inviteCode });
      console.log('Joined organization:', orgId);
      await mutate(); // Refresh organizations list
    } catch (err) {
      console.error('Failed to join:', err);
    }
  };

  return (
    <div>
      <input
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
        placeholder="Invite code"
      />
      <button onClick={handleJoin} disabled={isMutating}>
        Join Organization
      </button>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

3. Enter valid invite code
4. Click join button
5. Verify user added to organization_members
6. Verify invite status updated to 'accepted'
7. Verify organization appears in user's list

**Expected Results:**
- Returns organization ID on success
- User added to organization with role from invite
- Invite marked as accepted
- Organization appears in useUserOrganizations data

**Error Cases to Test:**
- Invalid invite code (should fail with "Invalid or expired invite code")
- Expired invite code (should fail)
- Already accepted invite (should fail)
- User already member of organization (should handle gracefully)

### 4. useSwitchOrganization()

**Purpose:** Change active organization for user

**Test Steps:**

1. **Setup:** User must be member of multiple organizations

2. Create test component:
```jsx
import { useSwitchOrganization, useUserOrganizations } from 'services/swr/api-hooks/useOrganizationApi';

function TestComponent() {
  const { trigger, isMutating, error } = useSwitchOrganization();
  const { data: orgs, mutate } = useUserOrganizations();

  const handleSwitch = async (orgId) => {
    try {
      await trigger({ organizationId: orgId });
      await mutate(); // Refresh to see updated active status
      console.log('Switched to organization:', orgId);
    } catch (err) {
      console.error('Failed to switch:', err);
    }
  };

  return (
    <div>
      <h2>Switch Organization</h2>
      {orgs?.map(org => (
        <div key={org.id}>
          <button
            onClick={() => handleSwitch(org.id)}
            disabled={isMutating || org.isActive}
          >
            {org.name} {org.isActive && '(Active)'}
          </button>
        </div>
      ))}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

3. Click on different organization
4. Verify only one organization is active per user
5. Verify active status updates in database
6. Verify UI reflects new active organization

**Expected Results:**
- Only one organization marked as active
- Previous active organization set to inactive
- Data refreshes showing new active state
- No errors during switch

**Error Cases to Test:**
- Switching to non-existent organization (should fail)
- Switching to organization user doesn't belong to (should fail with "Organization not found or permission denied")

## Integration Verification

**End-to-End Flow:**

1. New user signs up
2. User has no organizations (useUserOrganizations returns empty array)
3. User creates first organization (useCreateOrganization)
4. Organization appears in list as active
5. User receives invite to another organization
6. User joins via invite code (useJoinOrganization)
7. User now has 2 organizations
8. User switches between organizations (useSwitchOrganization)
9. Only one organization active at a time

**Database Verification Queries:**

```sql
-- Verify user's organizations
SELECT om.*, o.name, o.slug
FROM organization_members om
JOIN organizations o ON o.id = om.organization_id
WHERE om.user_id = 'test-user-id';

-- Verify only one active organization per user
SELECT user_id, COUNT(*) as active_count
FROM organization_members
WHERE is_active = true
GROUP BY user_id
HAVING COUNT(*) > 1;
-- Should return no rows

-- Verify invite was accepted
SELECT * FROM organization_invitations
WHERE token = 'test-invite-123';
-- Status should be 'accepted', accepted_at should be set
```

## Build Verification

```bash
# Ensure no build errors
npm run build

# Check for lint errors
npm run lint

# Verify imports resolve
grep -r "useOrganizationApi" src/
```

## Success Criteria

- [ ] All hooks return proper loading/error/data states
- [ ] Database operations execute without errors
- [ ] RLS policies enforced (verified via Supabase logs)
- [ ] No build or TypeScript errors
- [ ] Proper error messages for invalid inputs
- [ ] SWR cache invalidation works (mutate refreshes data)
- [ ] No memory leaks or hanging requests
