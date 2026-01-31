import useSWR from 'swr';
import axios from 'axios';

/**
 * SWR hook for fetching CRM dashboard metrics
 * @param {Object} options - Query options { dateFrom, dateTo, period }
 * @returns {Object} All dashboard metrics with loading/error states
 */
export function useCRMDashboardApi(options = {}) {
  const { dateFrom, dateTo, period } = options;

  // Build query string
  const params = new URLSearchParams();
  if (dateFrom) params.append('dateFrom', dateFrom);
  if (dateTo) params.append('dateTo', dateTo);
  const queryString = params.toString() ? `?${params.toString()}` : '';

  // Fetcher function
  const fetcher = async (url) => {
    const response = await axios.get(url);
    return response.data;
  };

  // Fetch all 8 dashboard endpoints
  const { data: dealsMetrics, error: dealsMetricsError } = useSWR(
    `/api/crm/dashboard/deals-metrics${queryString}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: kpis, error: kpisError } = useSWR(
    `/api/crm/dashboard/kpis${queryString}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: revenue, error: revenueError } = useSWR(
    `/api/crm/dashboard/revenue${queryString}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: leadSources, error: leadSourcesError } = useSWR(
    `/api/crm/dashboard/lead-sources${queryString}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: acquisitionCost, error: acquisitionCostError } = useSWR(
    `/api/crm/dashboard/acquisition-cost${queryString}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: salesFunnel, error: salesFunnelError } = useSWR(
    `/api/crm/dashboard/sales-funnel${queryString}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: lifetimeValue, error: lifetimeValueError } = useSWR(
    `/api/crm/dashboard/lifetime-value${queryString}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const periodParam = period ? `?period=${period}` : '';
  const { data: activeUsers, error: activeUsersError } = useSWR(
    `/api/crm/dashboard/active-users${periodParam}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Aggregate loading and error states
  const isLoading = !dealsMetrics && !kpis && !revenue && !leadSources &&
                    !acquisitionCost && !salesFunnel && !lifetimeValue && !activeUsers;

  const hasError = dealsMetricsError || kpisError || revenueError || leadSourcesError ||
                   acquisitionCostError || salesFunnelError || lifetimeValueError || activeUsersError;

  return {
    dealsMetrics,
    kpis,
    revenue,
    leadSources,
    acquisitionCost,
    salesFunnel,
    lifetimeValue,
    activeUsers,
    isLoading,
    hasError
  };
}
