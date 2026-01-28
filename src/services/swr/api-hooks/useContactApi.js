'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
// TODO: Replace with Supabase import after Phase 1.2 complete
// import createClient from 'lib/supabase/client';
import contactsData from 'data/crm/contacts';

/**
 * Fetcher function for all contacts
 * TODO: Replace with Supabase query after Phase 1.2 complete
 *
 * @returns {Promise<Array>} Array of contact objects filtered by organization_id (via RLS)
 */
const contactsFetcher = async () => {
  // TODO: Replace with Supabase query
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  // const { data, error } = await supabase
  //   .from('contacts')
  //   .select('*')
  //   .order('created_at', { ascending: false });
  // if (error) {
  //   throw new Error(error.message);
  // }
  // return data || [];

  // MOCK DATA IMPLEMENTATION (Days 1-2)
  // Simulate async fetch
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Return all contacts (RLS would filter by organization_id in real implementation)
  return contactsData;
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
    }
  );

  return swr;
};

/**
 * Fetcher function for a single contact by ID
 * TODO: Replace with Supabase query after Phase 1.2 complete
 *
 * @param {string} id - Contact ID
 * @returns {Promise<Object>} Contact object
 */
const contactFetcher = async (id) => {
  // TODO: Replace with Supabase query
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  // const { data, error } = await supabase
  //   .from('contacts')
  //   .select('*')
  //   .eq('id', id)
  //   .single();
  // if (error) {
  //   throw new Error(error.message);
  // }
  // return data;

  // MOCK DATA IMPLEMENTATION (Days 1-2)
  await new Promise((resolve) => setTimeout(resolve, 100));

  const contact = contactsData.find((c) => c.id === id);

  if (!contact) {
    throw new Error(`Contact not found: ${id}`);
  }

  return contact;
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
    }
  );

  return swr;
};

/**
 * Fetcher function for contacts belonging to a specific account
 * TODO: Replace with Supabase query after Phase 1.2 complete
 *
 * @param {string} accountId - Account ID to filter contacts by
 * @returns {Promise<Array>} Array of contact objects for the account
 */
const accountContactsFetcher = async (accountId) => {
  // TODO: Replace with Supabase query
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  // const { data, error } = await supabase
  //   .from('contacts')
  //   .select('*')
  //   .eq('account_id', accountId)
  //   .order('created_at', { ascending: false });
  // if (error) {
  //   throw new Error(error.message);
  // }
  // return data || [];

  // MOCK DATA IMPLEMENTATION (Days 1-2)
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Filter contacts by account_id
  const accountContacts = contactsData.filter((c) => c.account_id === accountId);

  return accountContacts;
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
    }
  );

  return swr;
};

/**
 * Mutation function to create a new contact
 * TODO: Replace with Supabase mutation after Phase 1.2 complete
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {Object} options.arg - Contact data to create
 * @returns {Promise<Object>} Created contact object
 */
const createContactMutation = async (url, { arg }) => {
  // TODO: Replace with Supabase mutation
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  //
  // // Get active organization from user metadata or state
  // // (Assuming organization_id comes from auth context or is passed in arg)
  // const { data, error } = await supabase
  //   .from('contacts')
  //   .insert([{ ...arg }])
  //   .select()
  //   .single();
  //
  // if (error) {
  //   throw new Error(error.message);
  // }
  // return data;

  // MOCK DATA IMPLEMENTATION (Days 1-2)
  console.log('CREATE CONTACT (MOCK):', arg);

  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Generate optimistic response
  const newContact = {
    id: `contact_${Date.now()}`,
    organization_id: 'org_001', // TODO: Get from active organization context
    account_id: arg.account_id || null, // Can be null for independent contacts
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...arg,
  };

  return newContact;
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
 * TODO: Replace with Supabase mutation after Phase 1.2 complete
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.id - Contact ID to update
 * @param {Object} options.arg.updates - Fields to update
 * @returns {Promise<Object>} Updated contact object
 */
const updateContactMutation = async (url, { arg }) => {
  const { id, updates } = arg;

  // TODO: Replace with Supabase mutation
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  //
  // const { data, error } = await supabase
  //   .from('contacts')
  //   .update({ ...updates, updated_at: new Date().toISOString() })
  //   .eq('id', id)
  //   .select()
  //   .single();
  //
  // if (error) {
  //   throw new Error(error.message);
  // }
  // return data;

  // MOCK DATA IMPLEMENTATION (Days 1-2)
  console.log('UPDATE CONTACT (MOCK):', { id, updates });

  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Find existing contact
  const existingContact = contactsData.find((c) => c.id === id);

  if (!existingContact) {
    throw new Error(`Contact not found: ${id}`);
  }

  // Generate optimistic response
  const updatedContact = {
    ...existingContact,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  return updatedContact;
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
 * TODO: Replace with Supabase mutation after Phase 1.2 complete
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.id - Contact ID to delete
 * @returns {Promise<Object>} Deleted contact ID
 */
const deleteContactMutation = async (url, { arg }) => {
  const { id } = arg;

  // TODO: Replace with Supabase mutation
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  //
  // const { data, error } = await supabase
  //   .from('contacts')
  //   .delete()
  //   .eq('id', id)
  //   .select()
  //   .single();
  //
  // if (error) {
  //   throw new Error(error.message);
  // }
  // return data;

  // MOCK DATA IMPLEMENTATION (Days 1-2)
  console.log('DELETE CONTACT (MOCK):', id);

  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Check if contact exists
  const contact = contactsData.find((c) => c.id === id);

  if (!contact) {
    throw new Error(`Contact not found: ${id}`);
  }

  return { id };
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
 * TODO: Replace with Supabase mutation after Phase 1.2 complete
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

  // TODO: Replace with Supabase mutation
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  //
  // // Verify account exists and belongs to user's organization (via RLS)
  // const { data: accountData, error: accountError } = await supabase
  //   .from('accounts')
  //   .select('id')
  //   .eq('id', accountId)
  //   .single();
  //
  // if (accountError || !accountData) {
  //   throw new Error('Account not found or permission denied');
  // }
  //
  // // Update contact's account_id
  // const { data, error } = await supabase
  //   .from('contacts')
  //   .update({ account_id: accountId, updated_at: new Date().toISOString() })
  //   .eq('id', contactId)
  //   .select()
  //   .single();
  //
  // if (error) {
  //   throw new Error(error.message);
  // }
  // return data;

  // MOCK DATA IMPLEMENTATION (Days 1-2)
  console.log('LINK CONTACT TO ACCOUNT (MOCK):', { contactId, accountId, role });

  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Find contact
  const contact = contactsData.find((c) => c.id === contactId);

  if (!contact) {
    throw new Error(`Contact not found: ${contactId}`);
  }

  // Generate optimistic response
  const linkedContact = {
    ...contact,
    account_id: accountId,
    role: role,
    updated_at: new Date().toISOString(),
  };

  return linkedContact;
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
 * TODO: Replace with Supabase mutation after Phase 1.2 complete
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.contactId - Contact ID to unlink
 * @returns {Promise<Object>} Updated contact object
 */
const unlinkContactFromAccountMutation = async (url, { arg }) => {
  const { contactId } = arg;

  // TODO: Replace with Supabase mutation
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  //
  // // Update contact's account_id to null
  // const { data, error } = await supabase
  //   .from('contacts')
  //   .update({ account_id: null, updated_at: new Date().toISOString() })
  //   .eq('id', contactId)
  //   .select()
  //   .single();
  //
  // if (error) {
  //   throw new Error(error.message);
  // }
  // return data;

  // MOCK DATA IMPLEMENTATION (Days 1-2)
  console.log('UNLINK CONTACT FROM ACCOUNT (MOCK):', contactId);

  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Find contact
  const contact = contactsData.find((c) => c.id === contactId);

  if (!contact) {
    throw new Error(`Contact not found: ${contactId}`);
  }

  // Generate optimistic response
  const unlinkedContact = {
    ...contact,
    account_id: null,
    updated_at: new Date().toISOString(),
  };

  return unlinkedContact;
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
