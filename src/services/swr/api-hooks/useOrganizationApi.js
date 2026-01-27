'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import createClient from 'lib/supabase/client';

/**
 * Fetcher function for user organizations
 * Queries organization_members joined with organizations table
 */
const userOrganizationsFetcher = async () => {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Fetch user's organizations with membership info
  const { data, error } = await supabase
    .from('organization_members')
    .select(
      `
      id,
      role,
      is_active,
      joined_at,
      organizations (
        id,
        name,
        slug,
        created_at
      )
    `
    )
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // Flatten the structure for easier consumption
  return (data || []).map((membership) => ({
    membershipId: membership.id,
    id: membership.organizations.id,
    name: membership.organizations.name,
    slug: membership.organizations.slug,
    role: membership.role,
    isActive: membership.is_active,
    joinedAt: membership.joined_at,
    createdAt: membership.organizations.created_at,
  }));
};

/**
 * Hook to fetch user's organizations
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with organizations data
 */
export const useUserOrganizations = (config) => {
  const swr = useSWR(
    'user-organizations', // Static key since it's user-specific
    userOrganizationsFetcher,
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );

  return swr;
};

/**
 * Mutation function to create organization
 */
const createOrganizationMutation = async (url, { arg }) => {
  const supabase = createClient();
  const { name } = arg;

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Call database function to create organization
  const { data, error } = await supabase.rpc('create_organization_for_user', {
    org_name: name,
    user_id: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data; // Returns organization ID
};

/**
 * Hook to create a new organization
 * @returns {Object} SWR mutation response
 */
export const useCreateOrganization = () => {
  const mutation = useSWRMutation('create-organization', createOrganizationMutation, {
    // Revalidate user organizations after creating new one
    onSuccess: (data, key, config) => {
      // This will trigger revalidation of useUserOrganizations
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};

/**
 * Mutation function to join organization via invite
 */
const joinOrganizationMutation = async (url, { arg }) => {
  const supabase = createClient();
  const { inviteCode } = arg;

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Call database function to join organization
  const { data, error } = await supabase.rpc('join_organization_by_invite', {
    invite_token: inviteCode,
    user_id: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data; // Returns organization ID
};

/**
 * Hook to join an organization via invite code
 * @returns {Object} SWR mutation response
 */
export const useJoinOrganization = () => {
  const mutation = useSWRMutation('join-organization', joinOrganizationMutation, {
    // Revalidate user organizations after joining
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};

/**
 * Mutation function to switch active organization
 */
const switchOrganizationMutation = async (url, { arg }) => {
  const supabase = createClient();
  const { organizationId } = arg;

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // First, set all user's organizations to inactive
  const { error: deactivateError } = await supabase
    .from('organization_members')
    .update({ is_active: false })
    .eq('user_id', user.id);

  if (deactivateError) {
    throw new Error(deactivateError.message);
  }

  // Then, set the target organization to active
  const { data, error } = await supabase
    .from('organization_members')
    .update({ is_active: true })
    .eq('user_id', user.id)
    .eq('organization_id', organizationId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error('Organization not found or permission denied');
  }

  return data[0];
};

/**
 * Hook to switch the active organization
 * @returns {Object} SWR mutation response
 */
export const useSwitchOrganization = () => {
  const mutation = useSWRMutation('switch-organization', switchOrganizationMutation, {
    // Revalidate user organizations after switching
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};
