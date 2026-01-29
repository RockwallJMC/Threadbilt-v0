'use client';

import createClient from 'lib/supabase/client';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

/**
 * Fetcher function for all contacts
 *
 * @returns {Promise<Array>} Array of contact objects filtered by organization_id (via RLS)
 */
const contactsFetcher = async () => {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * Hook to fetch all contacts for the current organization
 * Contacts are automatically filtered by organization_id via Row Level Security
 *
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with contacts data
 *
 * @example
 * const { data: contacts, error, isLoading, mutate } = useContacts();
 */
export const useContacts = (config) => {
  const swr = useSWR(
    'contacts', // Key for cache
    contactsFetcher,
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
 * Fetcher function for a single contact by ID
 *
 * @param {string} id - Contact ID
 * @returns {Promise<Object>} Contact object
 */
const contactFetcher = async (id) => {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase.from('contacts').select('*').eq('id', id).single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Hook to fetch a single contact by ID
 *
 * @param {string} id - Contact ID
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with contact data
 *
 * @example
 * const { data: contact, error, isLoading } = useContact('contact_001');
 */
export const useContact = (id, config) => {
  const swr = useSWR(
    id ? ['contact', id] : null, // Key with ID for cache, null if no ID
    () => contactFetcher(id),
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
 * Fetcher function for contacts belonging to a specific account
 *
 * @param {string} accountId - Account ID to filter contacts by
 * @returns {Promise<Array>} Array of contact objects for the account
 */
const accountContactsFetcher = async (accountId) => {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * Hook to fetch all contacts for a specific account
 *
 * @param {string} accountId - Account ID
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with contacts data
 *
 * @example
 * const { data: contacts, error, isLoading } = useAccountContacts('acc_001');
 */
export const useAccountContacts = (accountId, config) => {
  const swr = useSWR(
    accountId ? ['account-contacts', accountId] : null, // Key with account ID, null if no ID
    () => accountContactsFetcher(accountId),
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
 * Mutation function to create a new contact
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {Object} options.arg - Contact data to create
 * @returns {Promise<Object>} Created contact object
 */
const createContactMutation = async (url, { arg }) => {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('contacts')
    .insert([{ ...arg }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Hook to create a new contact
 * Automatically revalidates the contacts list after creation
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useCreateContact();
 * const newContact = await trigger({
 *   first_name: 'John',
 *   last_name: 'Doe',
 *   email: 'john.doe@example.com',
 *   phone: '+1 (555) 123-4567',
 *   title: 'CEO',
 *   role: 'Decision Maker',
 *   account_id: 'acc_001', // Optional - can be null
 * });
 */
export const useCreateContact = () => {
  const mutation = useSWRMutation('create-contact', createContactMutation, {
    // Revalidate contacts list after creating
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};

/**
 * Mutation function to update an existing contact
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.id - Contact ID to update
 * @param {Object} options.arg.updates - Fields to update
 * @returns {Promise<Object>} Updated contact object
 */
const updateContactMutation = async (url, { arg }) => {
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
    .from('contacts')
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
 * Hook to update an existing contact
 * Automatically revalidates the contact and contacts list after update
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useUpdateContact();
 * const updatedContact = await trigger({
 *   id: 'contact_001',
 *   updates: { title: 'CTO', phone: '+1 (555) 999-8888' }
 * });
 */
export const useUpdateContact = () => {
  const mutation = useSWRMutation('update-contact', updateContactMutation, {
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
 * Mutation function to delete a contact
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.id - Contact ID to delete
 * @returns {Promise<Object>} Deleted contact ID
 */
const deleteContactMutation = async (url, { arg }) => {
  const { id } = arg;
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase.from('contacts').delete().eq('id', id).select().single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Hook to delete a contact
 * Automatically revalidates the contacts list after deletion
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useDeleteContact();
 * await trigger({ id: 'contact_001' });
 */
export const useDeleteContact = () => {
  const mutation = useSWRMutation('delete-contact', deleteContactMutation, {
    // Revalidate after delete
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};

/**
 * Mutation function to link a contact to an account
 * Updates the contact's account_id and role fields
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.contactId - Contact ID to link
 * @param {string} options.arg.accountId - Account ID to link to
 * @param {string} options.arg.role - Role of the contact at the account
 * @returns {Promise<Object>} Updated contact object
 */
const linkContactToAccountMutation = async (url, { arg }) => {
  const { contactId, accountId, role } = arg;
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data: accountData, error: accountError } = await supabase
    .from('accounts')
    .select('id')
    .eq('id', accountId)
    .single();

  if (accountError || !accountData) {
    throw new Error('Account not found or permission denied');
  }

  const { data, error } = await supabase
    .from('contacts')
    .update({
      account_id: accountId,
      role,
      updated_at: new Date().toISOString(),
    })
    .eq('id', contactId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Hook to link a contact to an account
 * Automatically revalidates the contact, contacts list, and account contacts after linking
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useLinkContactToAccount();
 * const linkedContact = await trigger({
 *   contactId: 'contact_001',
 *   accountId: 'acc_001',
 *   role: 'Decision Maker'
 * });
 */
export const useLinkContactToAccount = () => {
  const mutation = useSWRMutation('link-contact-to-account', linkContactToAccountMutation, {
    // Revalidate after linking
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};

/**
 * Mutation function to unlink a contact from an account
 * Sets the contact's account_id to null
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.contactId - Contact ID to unlink
 * @returns {Promise<Object>} Updated contact object
 */
const unlinkContactFromAccountMutation = async (url, { arg }) => {
  const { contactId } = arg;
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('contacts')
    .update({ account_id: null, role: null, updated_at: new Date().toISOString() })
    .eq('id', contactId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Hook to unlink a contact from its account
 * Automatically revalidates the contact, contacts list, and account contacts after unlinking
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useUnlinkContactFromAccount();
 * const unlinkedContact = await trigger({ contactId: 'contact_001' });
 */
export const useUnlinkContactFromAccount = () => {
  const mutation = useSWRMutation('unlink-contact-from-account', unlinkContactFromAccountMutation, {
    // Revalidate after unlinking
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};
