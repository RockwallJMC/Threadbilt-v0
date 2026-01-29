'use client';

import createClient from 'lib/supabase/client';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

/**
 * Fetcher function for all accounts
 *
 * @returns {Promise<Array>} Array of account objects filtered by organization_id (via RLS)
 */
const accountsFetcher = async () => {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * Hook to fetch all accounts for the current organization
 * Accounts are automatically filtered by organization_id via Row Level Security
 *
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with accounts data
 *
 * @example
 * const { data: accounts, error, isLoading, mutate } = useAccounts();
 */
export const useAccounts = (config) => {
  const swr = useSWR(
    'accounts', // Key for cache
    accountsFetcher,
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    },
  );

  return swr;
};

/**
 * Fetcher function for a single account by ID
 *
 * @param {string} id - Account ID
 * @returns {Promise<Object>} Account object
 */
const accountFetcher = async (id) => {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase.from('accounts').select('*').eq('id', id).single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Hook to fetch a single account by ID
 *
 * @param {string} id - Account ID
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with account data
 *
 * @example
 * const { data: account, error, isLoading } = useAccount('acc_001');
 */
export const useAccount = (id, config) => {
  const swr = useSWR(
    id ? ['account', id] : null, // Key with ID for cache, null if no ID
    () => accountFetcher(id),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    },
  );

  return swr;
};

/**
 * Mutation function to create a new account
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {Object} options.arg - Account data to create
 * @returns {Promise<Object>} Created account object
 */
const createAccountMutation = async (url, { arg }) => {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('accounts')
    .insert([{ ...arg }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Hook to create a new account
 * Automatically revalidates the accounts list after creation
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useCreateAccount();
 * const newAccount = await trigger({
 *   name: 'Acme Corp',
 *   industry: 'Technology',
 *   website: 'https://acme.com',
 *   phone: '+1 (555) 123-4567',
 * });
 */
export const useCreateAccount = () => {
  const mutation = useSWRMutation('create-account', createAccountMutation, {
    // Revalidate accounts list after creating
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};

/**
 * Mutation function to update an existing account
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.id - Account ID to update
 * @param {Object} options.arg.updates - Fields to update
 * @returns {Promise<Object>} Updated account object
 */
const updateAccountMutation = async (url, { arg }) => {
  const { id, updates } = arg;
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('accounts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Hook to update an existing account
 * Automatically revalidates the account and accounts list after update
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useUpdateAccount();
 * const updatedAccount = await trigger({
 *   id: 'acc_001',
 *   updates: { name: 'New Name', industry: 'Healthcare' }
 * });
 */
export const useUpdateAccount = () => {
  const mutation = useSWRMutation('update-account', updateAccountMutation, {
    // Revalidate after update
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};

/**
 * Mutation function to delete an account
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.id - Account ID to delete
 * @returns {Promise<Object>} Deleted account ID
 */
const deleteAccountMutation = async (url, { arg }) => {
  const { id } = arg;
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase.from('accounts').delete().eq('id', id).select().single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Hook to delete an account
 * Automatically revalidates the accounts list after deletion
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useDeleteAccount();
 * await trigger({ id: 'acc_001' });
 */
export const useDeleteAccount = () => {
  const mutation = useSWRMutation('delete-account', deleteAccountMutation, {
    // Revalidate after delete
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};
