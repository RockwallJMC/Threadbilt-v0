-- ============================================================================== 
-- RLS Policy Audit (Accounts + Contacts)
-- ==============================================================================
-- Purpose: Inspect RLS enablement and policy definitions for org-scoped tables
-- Usage: Run in Supabase SQL Editor (service role) and review output.
-- ==============================================================================

\echo ''
\echo '=========================================='
\echo 'RLS POLICY AUDIT'
\echo '=========================================='
\echo ''

-- 1) RLS enabled + forced RLS flags
\echo ''
\echo 'RLS flags (public schema tables):'
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN ('accounts', 'contacts', 'organization_members', 'user_profiles')
ORDER BY table_name;

-- 2) Policy definitions for accounts + contacts
\echo ''
\echo 'Policies for accounts + contacts:'
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('accounts', 'contacts')
ORDER BY tablename, cmd, policyname;

-- 3) Look for current_setting/app.current_org_id usage in policy qual
\echo ''
\echo 'Policies using app.current_org_id:'
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('accounts', 'contacts')
  AND qual ILIKE '%app.current_org_id%'
ORDER BY tablename, cmd, policyname;

-- 4) Look for get_user_organization_ids usage in policy qual
\echo ''
\echo 'Policies using get_user_organization_ids:'
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('accounts', 'contacts')
  AND qual ILIKE '%get_user_organization_ids%'
ORDER BY tablename, cmd, policyname;

-- 5) Functions that may drive org context logic
\echo ''
\echo 'Functions referencing app.current_org_id:'
SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND pg_get_functiondef(p.oid) ILIKE '%app.current_org_id%'
ORDER BY function_name;

-- 6) Functions referencing organization membership helpers
\echo ''
\echo 'Functions referencing get_user_organization_ids:'
SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND pg_get_functiondef(p.oid) ILIKE '%get_user_organization_ids%'
ORDER BY function_name;

-- 7) Quick data sanity: counts per org for accounts/contacts
\echo ''
\echo 'Counts by organization_id (accounts + contacts):'
SELECT 'accounts' AS table_name, organization_id, COUNT(*) AS row_count
FROM public.accounts
GROUP BY organization_id
UNION ALL
SELECT 'contacts' AS table_name, organization_id, COUNT(*) AS row_count
FROM public.contacts
GROUP BY organization_id
ORDER BY table_name, organization_id;
