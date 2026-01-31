import useSWR from 'swr';
import axios from 'axios';

/**
 * SWR hook for fetching deal details with nested data
 * @param {string} dealId - UUID of the deal
 * @returns {Object} { deal, analytics, isLoading, error, mutate, updateDeal }
 */
export function useCRMDealApi(dealId) {
  // Fetch main deal data
  const { data: deal, error: dealError, mutate: mutateDeal } = useSWR(
    dealId ? `/api/crm/deals/${dealId}` : null,
    async (url) => {
      const response = await axios.get(url);
      return response.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Fetch analytics separately (async, doesn't block main data)
  const { data: analytics, error: analyticsError } = useSWR(
    dealId ? `/api/crm/deals/${dealId}/analytics` : null,
    async (url) => {
      const response = await axios.get(url);
      return response.data;
    },
    {
      revalidateOnFocus: false,
    }
  );

  /**
   * Update deal fields
   * @param {Object} updates - Fields to update
   */
  const updateDeal = async (updates) => {
    try {
      const response = await axios.patch(`/api/crm/deals/${dealId}`, updates);

      // Optimistically update cache
      await mutateDeal(
        (currentDeal) => ({ ...currentDeal, ...response.data }),
        { revalidate: false }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to update deal:', error);
      throw error;
    }
  };

  return {
    deal,
    analytics,
    isLoading: !deal && !dealError,
    error: dealError || analyticsError,
    mutate: mutateDeal,
    updateDeal,
  };
}
