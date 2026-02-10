'use client';

import { supabase } from 'lib/supabase/client';
import useSWR from 'swr';

/**
 * Fetcher function for organization members with optional role filtering
 * @param {string} key - SWR cache key
 * @param {string[]|null} roles - Optional array of roles to filter by
 * @returns {Promise<Array>} Array of member objects
 */
const orgMembersFetcher = async (key, roles = null) => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Get user's active organization
  const { data: membership, error: membershipError } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  if (!membership?.organization_id) {
    throw new Error('No active organization found');
  }

  // Build query for organization members with user profiles
  let query = supabase
    .from('organization_members')
    .select(`
      id,
      user_id,
      role,
      is_active,
      user_profiles (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('organization_id', membership.organization_id)
    .eq('is_active', true);

  // Apply role filter if provided
  if (roles && roles.length > 0) {
    query = query.in('role', roles);
  }

  const { data, error } = await query.order('role');

  if (error) {
    throw new Error(error.message);
  }

  // Flatten and transform for component consumption
  return (data || []).map((member) => ({
    id: member.user_id,
    membershipId: member.id,
    name: member.user_profiles?.full_name || member.user_profiles?.email || 'Unknown',
    email: member.user_profiles?.email,
    avatar: member.user_profiles?.avatar_url,
    orgRole: member.role,
  }));
};

/**
 * Hook to fetch all organization members
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with members data
 */
export const useOrganizationMembers = (config) => {
  return useSWR(
    'org-members',
    (key) => orgMembersFetcher(key, null),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );
};

/**
 * Hook to fetch organization members eligible to be project managers
 * Only returns users with role IN ('owner', 'admin', 'manager')
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with managers data
 */
export const useOrganizationManagers = (config) => {
  return useSWR(
    'org-managers',
    (key) => orgMembersFetcher(key, ['owner', 'admin', 'manager']),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );
};
