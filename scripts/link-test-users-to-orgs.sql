-- Link test users to test organizations for Playwright E2E tests
-- Run this AFTER creating the auth users via Supabase Dashboard

-- First, verify the organizations exist
SELECT id, name, slug FROM organizations WHERE slug IN ('test-org-a', 'test-org-b');

-- Check if test users exist in auth.users
SELECT id, email FROM auth.users
WHERE email IN (
  'test-existing@piercedesk.test',
  'test-single-org@piercedesk.test',
  'test-multi-org@piercedesk.test'
);

-- Link users to organizations
-- This uses a subquery to get user IDs dynamically

-- 1. Existing user → Test Org A
INSERT INTO organization_members (organization_id, user_id, role)
SELECT
  '00000000-0000-0000-0000-000000000001'::uuid,
  id,
  'member'
FROM auth.users
WHERE email = 'test-existing@piercedesk.test'
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 2. Single-org user → Test Org A only
INSERT INTO organization_members (organization_id, user_id, role)
SELECT
  '00000000-0000-0000-0000-000000000001'::uuid,
  id,
  'member'
FROM auth.users
WHERE email = 'test-single-org@piercedesk.test'
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 3. Multi-org user → Test Org A
INSERT INTO organization_members (organization_id, user_id, role)
SELECT
  '00000000-0000-0000-0000-000000000001'::uuid,
  id,
  'member'
FROM auth.users
WHERE email = 'test-multi-org@piercedesk.test'
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 4. Multi-org user → Test Org B
INSERT INTO organization_members (organization_id, user_id, role)
SELECT
  '00000000-0000-0000-0000-000000000002'::uuid,
  id,
  'member'
FROM auth.users
WHERE email = 'test-multi-org@piercedesk.test'
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- Verify the memberships were created
SELECT
  om.id,
  o.name as organization_name,
  u.email,
  om.role
FROM organization_members om
JOIN organizations o ON o.id = om.organization_id
JOIN auth.users u ON u.id = om.user_id
WHERE u.email IN (
  'test-existing@piercedesk.test',
  'test-single-org@piercedesk.test',
  'test-multi-org@piercedesk.test'
)
ORDER BY u.email, o.name;
