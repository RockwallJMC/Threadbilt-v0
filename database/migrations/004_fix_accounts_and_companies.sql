-- Migration 004: Fix accounts table and companies constraints
-- Purpose: Add missing fields to accounts, fix companies UNIQUE constraint, clean up duplicate org memberships

-- ============================================================================
-- 1. Add founding_year to accounts table
-- ============================================================================
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS founding_year INTEGER;

COMMENT ON COLUMN accounts.founding_year IS 'Year the company/account was founded';

-- ============================================================================
-- 2. Fix companies table UNIQUE constraint (organization-scoped, not global)
-- ============================================================================
-- Drop global UNIQUE constraint on companies.name
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_name_key;

-- Add composite UNIQUE constraint for multi-tenant isolation
ALTER TABLE companies
ADD CONSTRAINT companies_name_organization_unique
UNIQUE (name, organization_id);

-- ============================================================================
-- 3. Clean up duplicate organization memberships
-- ============================================================================
-- Keep only the most recent membership per user
-- This fixes the "PGRST116: Results contain 2 rows" error

-- Create temp table with users who have duplicates
CREATE TEMP TABLE duplicate_memberships AS
SELECT user_id, COUNT(*) as count
FROM organization_members
GROUP BY user_id
HAVING COUNT(*) > 1;

-- For each user with duplicates, keep only the most recent one
DELETE FROM organization_members
WHERE id IN (
  SELECT om.id
  FROM organization_members om
  INNER JOIN duplicate_memberships dm ON om.user_id = dm.user_id
  WHERE om.id NOT IN (
    -- Keep the most recent membership for each user
    SELECT DISTINCT ON (user_id) id
    FROM organization_members
    WHERE user_id IN (SELECT user_id FROM duplicate_memberships)
    ORDER BY user_id, created_at DESC
  )
);

-- ============================================================================
-- 4. Add index on accounts.founding_year for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_accounts_founding_year
ON accounts(founding_year)
WHERE founding_year IS NOT NULL;

-- ============================================================================
-- 5. Verify address jsonb structure
-- ============================================================================
-- No schema changes needed - address is already jsonb
-- Expected structure: { street, city, state, country, zipCode }
-- This is handled in the API layer when inserting/updating

COMMENT ON COLUMN accounts.address IS 'JSONB structure: { street, city, state, country, zipCode }';
