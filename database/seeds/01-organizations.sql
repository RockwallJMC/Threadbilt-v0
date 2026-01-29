-- Seed organizations for multi-tenant testing
-- Creates 2 test organizations for data isolation verification

-- Organization 1: Acme Corporation
INSERT INTO organizations (id, name, slug, subscription_tier, subscription_status, is_active, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Acme Corporation',
  'acme-corp',
  'professional',
  'active',
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_status = EXCLUDED.subscription_status,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Organization 2: TechStart Industries
INSERT INTO organizations (id, name, slug, subscription_tier, subscription_status, is_active, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'TechStart Industries',
  'techstart',
  'basic',
  'active',
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_status = EXCLUDED.subscription_status,
  is_active = EXCLUDED.is_active,
  updated_at = now();
