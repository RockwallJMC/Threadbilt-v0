'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { leads, getLeadsByStatus } from 'data/crm/leads';

// TODO: Replace with Supabase after Phase 1.2 complete
// import createClient from 'lib/supabase/client';

/**
 * Fetcher function for all leads
 * Optionally filters by status
 *
 * TODO: Replace mock data with Supabase fetcher after Phase 1.2 complete
 * @param {string|null} status - Optional status filter ('new', 'contacted', 'qualified', 'unqualified', 'converted')
 * @returns {Promise<Array>} Array of lead objects filtered by organization_id (via RLS)
 */
const leadsFetcher = async (status = null) => {
  // TODO: Replace with Supabase implementation after Phase 1.2 complete
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  //
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  //
  // let query = supabase
  //   .from('leads')
  //   .select('*')
  //   .order('created_at', { ascending: false });
  //
  // if (status) {
  //   query = query.eq('status', status);
  // }
  //
  // const { data, error } = await query;
  //
  // if (error) {
  //   throw new Error(error.message);
  // }
  //
  // return data || [];

  // MOCK DATA - Remove after Phase 1.2 complete
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredLeads = status ? getLeadsByStatus(status) : leads;
      resolve(filteredLeads);
    }, 100); // Simulate network delay
  });
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
 * TODO: Replace mock data with Supabase fetcher after Phase 1.2 complete
 * @param {string} id - Lead ID
 * @returns {Promise<Object>} Lead object
 */
const leadFetcher = async (id) => {
  // TODO: Replace with Supabase implementation after Phase 1.2 complete
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  //
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  //
  // const { data, error } = await supabase
  //   .from('leads')
  //   .select('*')
  //   .eq('id', id)
  //   .single();
  //
  // if (error) {
  //   throw new Error(error.message);
  // }
  //
  // return data;

  // MOCK DATA - Remove after Phase 1.2 complete
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const lead = leads.find((l) => l.id === id);
      if (lead) {
        resolve(lead);
      } else {
        reject(new Error(`Lead with id ${id} not found`));
      }
    }, 100); // Simulate network delay
  });
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
 * TODO: Replace console.log with Supabase mutation after Phase 1.2 complete
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {Object} options.arg - Lead data to create
 * @returns {Promise<Object>} Created lead object
 */
const createLeadMutation = async (url, { arg }) => {
  // TODO: Replace with Supabase implementation after Phase 1.2 complete
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  //
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  //
  // const { data, error } = await supabase
  //   .from('leads')
  //   .insert([{ ...arg }])
  //   .select()
  //   .single();
  //
  // if (error) {
  //   throw new Error(error.message);
  // }
  //
  // return data;

  // MOCK IMPLEMENTATION - Remove after Phase 1.2 complete
  console.log('useCreateLead mutation called with:', arg);
  return new Promise((resolve) => {
    setTimeout(() => {
      const newLead = {
        id: `lead_${Date.now()}`,
        ...arg,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      resolve(newLead);
    }, 100);
  });
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
 * TODO: Replace console.log with Supabase mutation after Phase 1.2 complete
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.id - Lead ID to update
 * @param {Object} options.arg.updates - Fields to update
 * @returns {Promise<Object>} Updated lead object
 */
const updateLeadMutation = async (url, { arg }) => {
  const { id, updates } = arg;

  // TODO: Replace with Supabase implementation after Phase 1.2 complete
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  //
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  //
  // const { data, error } = await supabase
  //   .from('leads')
  //   .update({ ...updates, updated_at: new Date().toISOString() })
  //   .eq('id', id)
  //   .select()
  //   .single();
  //
  // if (error) {
  //   throw new Error(error.message);
  // }
  //
  // return data;

  // MOCK IMPLEMENTATION - Remove after Phase 1.2 complete
  console.log('useUpdateLead mutation called with:', { id, updates });
  return new Promise((resolve) => {
    setTimeout(() => {
      const updatedLead = {
        id,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      resolve(updatedLead);
    }, 100);
  });
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
 * TODO: Replace console.log with Supabase mutation after Phase 1.2 complete
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.id - Lead ID to delete
 * @returns {Promise<Object>} Deleted lead ID
 */
const deleteLeadMutation = async (url, { arg }) => {
  const { id } = arg;

  // TODO: Replace with Supabase implementation after Phase 1.2 complete
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  //
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  //
  // // Soft delete: update deleted_at timestamp
  // const { data, error } = await supabase
  //   .from('leads')
  //   .update({ deleted_at: new Date().toISOString() })
  //   .eq('id', id)
  //   .select()
  //   .single();
  //
  // if (error) {
  //   throw new Error(error.message);
  // }
  //
  // return data;

  // MOCK IMPLEMENTATION - Remove after Phase 1.2 complete
  console.log('useDeleteLead mutation called with:', { id });
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, deleted_at: new Date().toISOString() });
    }, 100);
  });
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
 * 1. Create opportunity with pre-filled data (contact, company, source)
 * 2. Update lead status to 'converted'
 * 3. Link lead_id to opportunity
 *
 * TODO: Replace console.log with Supabase mutation after Phase 1.2 complete
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.leadId - Lead ID to convert
 * @param {Object} options.arg.opportunityData - Additional opportunity data (deal_value, stage, etc.)
 * @returns {Promise<Object>} Created opportunity object with lead reference
 */
const convertLeadToOpportunityMutation = async (url, { arg }) => {
  const { leadId, opportunityData } = arg;

  // TODO: Replace with Supabase implementation after Phase 1.2 complete
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  //
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  //
  // // Fetch lead data to pre-fill opportunity
  // const { data: lead, error: leadError } = await supabase
  //   .from('leads')
  //   .select('*')
  //   .eq('id', leadId)
  //   .single();
  //
  // if (leadError) {
  //   throw new Error(leadError.message);
  // }
  //
  // // Create opportunity with lead data
  // const { data: opportunity, error: opportunityError } = await supabase
  //   .from('opportunities')
  //   .insert([{
  //     name: lead.company || lead.name,
  //     contact_name: lead.name,
  //     contact_email: lead.email,
  //     contact_phone: lead.phone,
  //     source: lead.source,
  //     lead_id: leadId,
  //     ...opportunityData,
  //   }])
  //   .select()
  //   .single();
  //
  // if (opportunityError) {
  //   throw new Error(opportunityError.message);
  // }
  //
  // // Update lead status to 'converted'
  // const { error: updateError } = await supabase
  //   .from('leads')
  //   .update({ status: 'converted', updated_at: new Date().toISOString() })
  //   .eq('id', leadId);
  //
  // if (updateError) {
  //   throw new Error(updateError.message);
  // }
  //
  // return { opportunity, lead: { ...lead, status: 'converted' } };

  // MOCK IMPLEMENTATION - Remove after Phase 1.2 complete
  console.log('useConvertLeadToOpportunity mutation called with:', { leadId, opportunityData });
  return new Promise((resolve) => {
    setTimeout(() => {
      const opportunity = {
        id: `opportunity_${Date.now()}`,
        lead_id: leadId,
        ...opportunityData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updatedLead = {
        id: leadId,
        status: 'converted',
        updated_at: new Date().toISOString(),
      };
      resolve({ opportunity, lead: updatedLead });
    }, 100);
  });
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
