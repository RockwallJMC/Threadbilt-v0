-- Seed user profiles and organization memberships for multi-tenant testing
-- Creates test users in each organization with different roles

-- NOTE: This seed uses EXISTING auth.users from the database
-- We map existing users to test organizations for multi-tenant testing
-- User profiles are synced from auth.users via trigger, so we only update them here

-- ============================================================================
-- ORGANIZATION 1: ACME CORPORATION USERS (using existing auth.users)
-- ============================================================================

-- User 1: alice.owner@seedtest.com -> Acme Corporation Admin
-- Update existing user_profile
UPDATE user_profiles SET
  full_name = 'Alice Admin (Acme)',
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=AliceAdmin',
  updated_at = now()
WHERE id = 'a1111111-1111-1111-1111-111111111111';

-- Link to Acme Corporation as admin (update existing membership)
INSERT INTO organization_members (organization_id, user_id, role, is_active, joined_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001', -- Acme Corporation
  'a1111111-1111-1111-1111-111111111111', -- alice.owner@seedtest.com
  'admin',
  true,
  now(),
  now(),
  now()
) ON CONFLICT (organization_id, user_id) DO UPDATE SET
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- User 2: bob.admin@seedtest.com -> Acme Corporation Manager
UPDATE user_profiles SET
  full_name = 'Bob Manager (Acme)',
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=BobManager',
  updated_at = now()
WHERE id = 'a2222222-2222-2222-2222-222222222222';

-- Link to Acme Corporation as manager
INSERT INTO organization_members (organization_id, user_id, role, is_active, joined_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001', -- Acme Corporation
  'a2222222-2222-2222-2222-222222222222', -- bob.admin@seedtest.com
  'manager',
  true,
  now(),
  now(),
  now()
) ON CONFLICT (organization_id, user_id) DO UPDATE SET
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- User 3: charlie.member@seedtest.com -> Acme Corporation Member
UPDATE user_profiles SET
  full_name = 'Charlie Member (Acme)',
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=CharlieMember',
  updated_at = now()
WHERE id = 'a3333333-3333-3333-3333-333333333333';

-- Link to Acme Corporation as member
INSERT INTO organization_members (organization_id, user_id, role, is_active, joined_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001', -- Acme Corporation
  'a3333333-3333-3333-3333-333333333333', -- charlie.member@seedtest.com
  'member',
  true,
  now(),
  now(),
  now()
) ON CONFLICT (organization_id, user_id) DO UPDATE SET
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- ============================================================================
-- ORGANIZATION 2: TECHSTART INDUSTRIES USERS (using existing auth.users)
-- ============================================================================

-- User 4: frank.owner@seedtest.com -> TechStart Admin
UPDATE user_profiles SET
  full_name = 'Frank CEO (TechStart)',
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=FrankCEO',
  updated_at = now()
WHERE id = 'b1111111-1111-1111-1111-111111111111';

-- Link to TechStart as admin
INSERT INTO organization_members (organization_id, user_id, role, is_active, joined_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002', -- TechStart Industries
  'b1111111-1111-1111-1111-111111111111', -- frank.owner@seedtest.com
  'admin',
  true,
  now(),
  now(),
  now()
) ON CONFLICT (organization_id, user_id) DO UPDATE SET
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- User 5: grace.admin@seedtest.com -> TechStart Member
UPDATE user_profiles SET
  full_name = 'Grace Rep (TechStart)',
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=GraceRep',
  updated_at = now()
WHERE id = 'b2222222-2222-2222-2222-222222222222';

-- Link to TechStart as member
INSERT INTO organization_members (organization_id, user_id, role, is_active, joined_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002', -- TechStart Industries
  'b2222222-2222-2222-2222-222222222222', -- grace.admin@seedtest.com
  'member',
  true,
  now(),
  now(),
  now()
) ON CONFLICT (organization_id, user_id) DO UPDATE SET
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = now();
