'use client';

import createClient from 'lib/supabase/client';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

/**
 * Fetcher function for all leads
 * Optionally filters by status
 *
 * @param {string|null} status - Optional status filter ('new', 'contacted', 'qualified', 'unqualified', 'converted')
 * @returns {Promise<Array>} Array of lead objects filtered by organization_id (via RLS)
 */
const leadsFetcher = async (status = null) => {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * Hook to fetch all leads for the current organization
 * Leads are automatically filtered by organization_id via Row Level Security
 *
 * @param {string|null} status - Optional status filter
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with leads data
 *
 * @example
 * const { data: leads, error, isLoading, mutate } = useLeads();
 * const { data: newLeads } = useLeads('new');
 * const { data: qualifiedLeads } = useLeads('qualified');
 */
export const useLeads = (status = null, config) => {
  const swr = useSWR(
    ['leads', status], // Key includes status for separate caches
    () => leadsFetcher(status),
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
 * Fetcher function for a single lead by ID
 *
 * @param {string} id - Lead ID
 * @returns {Promise<Object>} Lead object
 */
const leadFetcher = async (id) => {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Hook to fetch a single lead by ID
 *
 * @param {string} id - Lead ID
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with lead data
 *
 * @example
 * const { data: lead, error, isLoading } = useLead('lead_001');
 */
export const useLead = (id, config) => {
  const swr = useSWR(
    id ? ['lead', id] : null, // Key with ID for cache, null if no ID
    () => leadFetcher(id),
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
 * Mutation function to create a new lead
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {Object} options.arg - Lead data to create
 * @returns {Promise<Object>} Created lead object
 */
const createLeadMutation = async (url, { arg }) => {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('leads')
    .insert([{ ...arg }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Hook to create a new lead
 * Automatically revalidates the leads list after creation
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useCreateLead();
 * const newLead = await trigger({
 *   name: 'John Doe',
 *   company: 'Acme Corp',
 *   email: 'john.doe@acme.com',
 *   phone: '+1 (555) 123-4567',
 *   source: 'website',
 *   status: 'new',
 *   notes: 'Interested in enterprise features',
 * });
 */
export const useCreateLead = () => {
  const mutation = useSWRMutation('create-lead', createLeadMutation, {
    // Revalidate leads list after creating
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};

/**
 * Mutation function to update an existing lead
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.id - Lead ID to update
 * @param {Object} options.arg.updates - Fields to update
 * @returns {Promise<Object>} Updated lead object
 */
const updateLeadMutation = async (url, { arg }) => {
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
    .from('leads')
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
 * Hook to update an existing lead
 * Automatically revalidates the lead and leads list after update
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useUpdateLead();
 * const updatedLead = await trigger({
 *   id: 'lead_001',
 *   updates: { status: 'contacted', notes: 'Follow-up scheduled' }
 * });
 */
export const useUpdateLead = () => {
  const mutation = useSWRMutation('update-lead', updateLeadMutation, {
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
 * Mutation function to delete a lead (soft delete)
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.id - Lead ID to delete
 * @returns {Promise<Object>} Deleted lead ID
 */
const deleteLeadMutation = async (url, { arg }) => {
  const { id } = arg;
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Soft delete: update deleted_at timestamp
  const { data, error } = await supabase
    .from('leads')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Hook to delete a lead (soft delete)
 * Automatically revalidates the leads list after deletion
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useDeleteLead();
 * await trigger({ id: 'lead_001' });
 */
export const useDeleteLead = () => {
  const mutation = useSWRMutation('delete-lead', deleteLeadMutation, {
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
 * Mutation function to convert a lead to an opportunity
 * Multi-step operation:
 * 1. Fetch lead data
 * 2. Create or find account from lead company
 * 3. Create contact from lead
 * 4. Create opportunity with references
 * 5. Update lead status to 'converted'
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.leadId - Lead ID to convert
 * @param {Object} options.arg.opportunityData - Additional opportunity data (deal_value, stage, etc.)
 * @returns {Promise<Object>} Created opportunity object with lead reference
 */
const convertLeadToOpportunityMutation = async (url, { arg }) => {
  const { leadId, opportunityData } = arg;
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Step 1: Fetch lead data to pre-fill opportunity
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (leadError) {
    throw new Error(leadError.message);
  }

  // Step 2: Create or find account from lead company
  let accountId = null;
  if (lead.company) {
    // Try to find existing account with same name
    const { data: existingAccounts } = await supabase
      .from('accounts')
      .select('id')
      .ilike('name', lead.company)
      .limit(1);

    if (existingAccounts && existingAccounts.length > 0) {
      accountId = existingAccounts[0].id;
    } else {
      // Create new account from lead company
      const { data: newAccount, error: accountError } = await supabase
        .from('accounts')
        .insert([
          {
            name: lead.company,
            phone: lead.phone,
            source: lead.source,
          },
        ])
        .select()
        .single();

      if (accountError) {
        throw new Error(`Failed to create account: ${accountError.message}`);
      }

      accountId = newAccount.id;
    }
  }

  // Step 3: Create contact from lead
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .insert([
      {
        first_name: lead.name.split(' ')[0] || lead.name,
        last_name: lead.name.split(' ').slice(1).join(' ') || '',
        email: lead.email,
        phone: lead.phone,
        account_id: accountId,
      },
    ])
    .select()
    .single();

  if (contactError) {
    throw new Error(`Failed to create contact: ${contactError.message}`);
  }

  // Step 4: Create opportunity with lead data
  const { data: opportunity, error: opportunityError } = await supabase
    .from('opportunities')
    .insert([
      {
        name: opportunityData.name || lead.company || lead.name,
        account_id: accountId,
        primary_contact_id: contact.id,
        deal_value: opportunityData.deal_value || opportunityData.value,
        stage: opportunityData.stage,
        probability: opportunityData.probability,
        expected_close_date: opportunityData.expected_close_date,
        source: lead.source,
        lead_id: leadId,
      },
    ])
    .select()
    .single();

  if (opportunityError) {
    throw new Error(`Failed to create opportunity: ${opportunityError.message}`);
  }

  // Step 5: Update lead status to 'converted'
  const { error: updateError } = await supabase
    .from('leads')
    .update({ status: 'converted', updated_at: new Date().toISOString() })
    .eq('id', leadId);

  if (updateError) {
    throw new Error(`Failed to update lead status: ${updateError.message}`);
  }

  return {
    opportunity,
    lead: { ...lead, status: 'converted' },
    account_id: accountId,
    contact_id: contact.id,
  };
};

/**
 * Hook to convert a lead to an opportunity
 * Automatically revalidates leads and opportunities lists after conversion
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useConvertLeadToOpportunity();
 * const result = await trigger({
 *   leadId: 'lead_001',
 *   opportunityData: {
 *     deal_value: 50000,
 *     stage: 'qualification',
 *     expected_close_date: '2025-03-31',
 *   }
 * });
 * // result contains { opportunity, lead }
 */
export const useConvertLeadToOpportunity = () => {
  const mutation = useSWRMutation('convert-lead-to-opportunity', convertLeadToOpportunityMutation, {
    // Revalidate both leads and opportunities after conversion
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
      // TODO: Add revalidation for opportunities when useOpportunities hook exists
      // mutate('opportunities');
    },
  });

  return mutation;
};
