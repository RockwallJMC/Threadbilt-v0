'use client';

import axiosInstance from 'services/axios/axiosInstance';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

/**
 * Fetcher function for all deals grouped by stage
 *
 * @returns {Promise<Object>} Object with deals grouped by stage: { Contact: [], MQL: [], SQL: [], Opportunity: [], Won: [], Lost: [] }
 */
const dealsFetcher = async () => {
  const response = await axiosInstance.get('/api/crm/deals');
  return response;
};

/**
 * Hook to fetch all deals for the current user, grouped by stage
 * Deals are automatically filtered by user_id server-side
 *
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with grouped deals data
 *
 * @example
 * const { data: groupedDeals, error, isLoading, mutate } = useDeals();
 * // groupedDeals = { Contact: [...], MQL: [...], SQL: [...], Opportunity: [...], Won: [...], Lost: [...] }
 */
export const useDeals = (config) => {
  const swr = useSWR(
    'crm-deals',
    dealsFetcher,
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
 * Mutation function to create a new deal
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {Object} options.arg - Deal data to create
 * @returns {Promise<Object>} Created deal object with company and contact joined
 */
const createDealMutation = async (url, { arg }) => {
  const response = await axiosInstance.post('/api/crm/deals', arg);
  return response;
};

/**
 * Hook to create a new deal
 * Automatically revalidates the deals list after creation
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger: createDeal, isMutating } = useCreateDeal();
 * const newDeal = await createDeal({
 *   name: 'Enterprise Software Deal',
 *   stage: 'Contact',
 *   company_id: 'company_001',
 *   contact_id: 'contact_001',
 *   amount: 50000,
 *   priority: 'high',
 *   progress: 10,
 *   close_date: '2025-06-30',
 * });
 */
export const useCreateDeal = () => {
  const mutation = useSWRMutation('create-deal', createDealMutation, {
    // Revalidate deals list after creating
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};

/**
 * Mutation function to update an existing deal
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.id - Deal ID to update
 * @param {Object} options.arg.updates - Fields to update
 * @returns {Promise<Object>} Updated deal object with company and contact joined
 */
const updateDealMutation = async (url, { arg }) => {
  const { id, updates } = arg;
  const response = await axiosInstance.patch(`/api/crm/deals/${id}`, updates);
  return response;
};

/**
 * Hook to update an existing deal
 * Automatically revalidates the deals list after update
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger: updateDeal, isMutating } = useUpdateDeal();
 * const updatedDeal = await updateDeal({
 *   id: 'deal_001',
 *   updates: {
 *     stage: 'Opportunity',
 *     stage_order: 2,
 *     progress: 50
 *   }
 * });
 */
export const useUpdateDeal = () => {
  const mutation = useSWRMutation('update-deal', updateDealMutation);

  return mutation;
};
