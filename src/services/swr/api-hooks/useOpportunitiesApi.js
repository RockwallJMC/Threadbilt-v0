'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { opportunitiesData, OPPORTUNITY_STAGES } from 'data/crm/opportunities';

// TODO: Replace with Supabase after Phase 1.2 complete
// import createClient from 'lib/supabase/client';

/**
 * Fetcher function for all opportunities
 * Optionally filters by stage, search, assigned_to, or account_id
 *
 * TODO: Replace mock data with Supabase fetcher after Phase 1.2 complete
 * @param {Object|null} filters - Optional filters { stage, search, assigned_to, account_id }
 * @returns {Promise<Array>} Array of opportunity objects filtered by organization_id (via RLS)
 */
const opportunitiesFetcher = async (filters = null) => {
  // TODO: Replace with Supabase implementation after Phase 1.2 complete
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  //
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  //
  // let query = supabase
  //   .from('opportunities')
  //   .select(`
  //     *,
  //     account:accounts(*),
  //     owner:user_profiles(*),
  //     collaborators:user_profiles(*)
  //   `)
  //   .order('created_at', { ascending: false });
  //
  // if (filters?.stage) {
  //   query = query.eq('stage', filters.stage);
  // }
  //
  // if (filters?.search) {
  //   query = query.or(`name.ilike.%${filters.search}%,account.name.ilike.%${filters.search}%`);
  // }
  //
  // if (filters?.assigned_to) {
  //   query = query.eq('owner_id', filters.assigned_to);
  // }
  //
  // if (filters?.account_id) {
  //   query = query.eq('account_id', filters.account_id);
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
      // Flatten the opportunities from all columns
      let allOpportunities = [];
      opportunitiesData.forEach(column => {
        allOpportunities = allOpportunities.concat(column.opportunities);
      });

      let filteredOpportunities = [...allOpportunities];

      if (filters?.stage) {
        filteredOpportunities = filteredOpportunities.filter(
          opp => opp.stage === filters.stage
        );
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredOpportunities = filteredOpportunities.filter(
          opp =>
            opp.name.toLowerCase().includes(searchLower) ||
            opp.company.name.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.assigned_to) {
        filteredOpportunities = filteredOpportunities.filter(
          opp => opp.owner.id === filters.assigned_to
        );
      }

      if (filters?.account_id) {
        filteredOpportunities = filteredOpportunities.filter(
          opp => opp.company.id === filters.account_id
        );
      }

      resolve(filteredOpportunities);
    }, 100); // Simulate network delay
  });
};

/**
 * Hook to fetch all opportunities for the current organization
 * Opportunities are automatically filtered by organization_id via Row Level Security
 *
 * @param {Object|null} filters - Optional filters { stage, search, assigned_to, account_id }
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with opportunities data
 *
 * @example
 * const { data: opportunities, error, isLoading, mutate } = useOpportunities();
 * const { data: qualificationOpps } = useOpportunities({ stage: 'qualification' });
 * const { data: searchResults } = useOpportunities({ search: 'Enterprise' });
 */
export const useOpportunities = (filters = null, config) => {
  const swr = useSWR(
    filters ? ['opportunities', filters] : 'opportunities',
    () => opportunitiesFetcher(filters),
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
 * Fetcher function for a single opportunity by ID
 *
 * TODO: Replace mock data with Supabase fetcher after Phase 1.2 complete
 * @param {string} id - Opportunity ID
 * @returns {Promise<Object>} Opportunity object
 */
const opportunityFetcher = async (id) => {
  // TODO: Replace with Supabase implementation after Phase 1.2 complete
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  //
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  //
  // const { data, error } = await supabase
  //   .from('opportunities')
  //   .select(`
  //     *,
  //     account:accounts(*),
  //     owner:user_profiles(*),
  //     collaborators:user_profiles(*)
  //   `)
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
      // Flatten all opportunities
      let allOpportunities = [];
      opportunitiesData.forEach(column => {
        allOpportunities = allOpportunities.concat(column.opportunities);
      });

      const opportunity = allOpportunities.find((opp) => opp.id === id);
      if (opportunity) {
        resolve(opportunity);
      } else {
        reject(new Error(`Opportunity with id ${id} not found`));
      }
    }, 100); // Simulate network delay
  });
};

/**
 * Hook to fetch a single opportunity by ID
 *
 * @param {string} id - Opportunity ID
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with opportunity data
 *
 * @example
 * const { data: opportunity, error, isLoading } = useOpportunity('opportunity1');
 */
export const useOpportunity = (id, config) => {
  const swr = useSWR(
    id ? ['opportunity', id] : null,
    () => opportunityFetcher(id),
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
 * Mutation function to create a new opportunity
 *
 * TODO: Replace console.log with Supabase mutation after Phase 1.2 complete
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {Object} options.arg - Opportunity data to create
 * @returns {Promise<Object>} Created opportunity object
 */
const createOpportunityMutation = async (url, { arg }) => {
  // TODO: Replace with Supabase implementation after Phase 1.2 complete
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  //
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  //
  // const { data, error } = await supabase
  //   .from('opportunities')
  //   .insert([{ ...arg }])
  //   .select(`
  //     *,
  //     account:accounts(*),
  //     owner:user_profiles(*),
  //     collaborators:user_profiles(*)
  //   `)
  //   .single();
  //
  // if (error) {
  //   throw new Error(error.message);
  // }
  //
  // return data;

  // MOCK IMPLEMENTATION - Remove after Phase 1.2 complete
  console.log('useCreateOpportunity mutation called with:', arg);
  return new Promise((resolve) => {
    setTimeout(() => {
      const newOpportunity = {
        id: `opportunity_${Date.now()}`,
        ...arg,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        stage_changed_at: new Date().toISOString(),
      };
      resolve(newOpportunity);
    }, 100);
  });
};

/**
 * Hook to create a new opportunity
 * Automatically revalidates the opportunities list after creation
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useCreateOpportunity();
 * const newOpportunity = await trigger({
 *   name: 'Enterprise Software Deal',
 *   company_id: 'company_123',
 *   stage: 'qualification',
 *   amount: 150000,
 *   probability: 25,
 *   expected_close_date: '2025-06-30',
 * });
 */
export const useCreateOpportunity = () => {
  const mutation = useSWRMutation('create-opportunity', createOpportunityMutation, {
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};

/**
 * Mutation function to update an existing opportunity
 *
 * TODO: Replace console.log with Supabase mutation after Phase 1.2 complete
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.id - Opportunity ID to update
 * @param {Object} options.arg.updates - Fields to update
 * @returns {Promise<Object>} Updated opportunity object
 */
const updateOpportunityMutation = async (url, { arg }) => {
  const { id, updates } = arg;

  // TODO: Replace with Supabase implementation after Phase 1.2 complete
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  //
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  //
  // const updateData = { ...updates, updated_at: new Date().toISOString() };
  //
  // // Track stage changes
  // if (updates.stage) {
  //   updateData.stage_changed_at = new Date().toISOString();
  // }
  //
  // const { data, error } = await supabase
  //   .from('opportunities')
  //   .update(updateData)
  //   .eq('id', id)
  //   .select(`
  //     *,
  //     account:accounts(*),
  //     owner:user_profiles(*),
  //     collaborators:user_profiles(*)
  //   `)
  //   .single();
  //
  // if (error) {
  //   throw new Error(error.message);
  // }
  //
  // return data;

  // MOCK IMPLEMENTATION - Remove after Phase 1.2 complete
  console.log('useUpdateOpportunity mutation called with:', { id, updates });
  return new Promise((resolve) => {
    setTimeout(() => {
      const updatedOpportunity = {
        id,
        ...updates,
        updated_at: new Date().toISOString(),
        ...(updates.stage && { stage_changed_at: new Date().toISOString() }),
      };
      resolve(updatedOpportunity);
    }, 100);
  });
};

/**
 * Hook to update an existing opportunity
 * Automatically revalidates the opportunity and opportunities list after update
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useUpdateOpportunity();
 * const updatedOpportunity = await trigger({
 *   id: 'opportunity1',
 *   updates: { stage: 'proposal', probability: 50 }
 * });
 */
export const useUpdateOpportunity = () => {
  const mutation = useSWRMutation('update-opportunity', updateOpportunityMutation, {
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};

/**
 * Mutation function to delete an opportunity (soft delete)
 *
 * TODO: Replace console.log with Supabase mutation after Phase 1.2 complete
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.id - Opportunity ID to delete
 * @returns {Promise<Object>} Deleted opportunity ID
 */
const deleteOpportunityMutation = async (url, { arg }) => {
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
  //   .from('opportunities')
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
  console.log('useDeleteOpportunity mutation called with:', { id });
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, deleted_at: new Date().toISOString() });
    }, 100);
  });
};

/**
 * Hook to delete an opportunity (soft delete)
 * Automatically revalidates the opportunities list after deletion
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useDeleteOpportunity();
 * await trigger({ id: 'opportunity1' });
 */
export const useDeleteOpportunity = () => {
  const mutation = useSWRMutation('delete-opportunity', deleteOpportunityMutation, {
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};

/**
 * Fetcher function to calculate opportunity forecast metrics
 *
 * TODO: Replace mock calculation with Supabase RPC after Phase 1.2 complete
 * @returns {Promise<Object>} Forecast metrics
 */
const opportunityForecastFetcher = async () => {
  // TODO: Replace with Supabase implementation after Phase 1.2 complete
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  //
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  //
  // const { data, error } = await supabase.rpc('calculate_opportunity_forecast', {
  //   org_id: user.user_metadata.organization_id
  // });
  //
  // if (error) {
  //   throw new Error(error.message);
  // }
  //
  // return data;

  // MOCK DATA - Remove after Phase 1.2 complete
  return new Promise((resolve) => {
    setTimeout(() => {
      // Flatten all opportunities
      let allOpportunities = [];
      opportunitiesData.forEach(column => {
        allOpportunities = allOpportunities.concat(column.opportunities);
      });

      // Filter to open opportunities (not closed won/lost)
      const openOpportunities = allOpportunities.filter(
        opp => !['closed_won', 'closed_lost'].includes(opp.stage)
      );

      // Calculate total pipeline value
      const totalPipeline = openOpportunities.reduce((sum, opp) => sum + opp.amount, 0);

      // Calculate weighted forecast (value × probability)
      const weightedForecast = openOpportunities.reduce(
        (sum, opp) => sum + (opp.amount * (opp.probability / 100)),
        0
      );

      // Calculate stage breakdown
      const stageBreakdown = {};
      allOpportunities.forEach(opp => {
        if (!stageBreakdown[opp.stage]) {
          stageBreakdown[opp.stage] = { count: 0, value: 0 };
        }
        stageBreakdown[opp.stage].count++;
        stageBreakdown[opp.stage].value += opp.amount;
      });

      // Calculate expected wins in next 30 days
      const today = new Date();
      const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      const expectedWins = openOpportunities.filter(opp => {
        if (!opp.expected_close_date) return false;
        const closeDate = new Date(opp.expected_close_date);
        return closeDate >= today && closeDate <= in30Days;
      }).length;

      // Calculate average opportunity size
      const avgOpportunitySize = openOpportunities.length > 0
        ? totalPipeline / openOpportunities.length
        : 0;

      resolve({
        totalPipeline,
        weightedForecast,
        stageBreakdown,
        avgOpportunitySize,
        expectedWins,
      });
    }, 100); // Simulate network delay
  });
};

/**
 * Hook to fetch opportunity forecast metrics
 * Calculates pipeline value, weighted forecast, and stage breakdown
 *
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with forecast data
 *
 * @example
 * const { data: forecast, error, isLoading } = useOpportunityForecast();
 * // forecast = {
 * //   totalPipeline: 1500000,
 * //   weightedForecast: 750000,
 * //   stageBreakdown: { qualification: { count: 4, value: 500000 }, ... },
 * //   avgOpportunitySize: 150000,
 * //   expectedWins: 3
 * // }
 */
export const useOpportunityForecast = (config) => {
  const swr = useSWR(
    'opportunities/forecast',
    opportunityForecastFetcher,
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );

  return swr;
};
