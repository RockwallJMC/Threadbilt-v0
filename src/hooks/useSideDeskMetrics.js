import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { deskConfig, getSideDeskMetrics } from 'data/side-desk-metrics';
import { getDeskFromPathname } from 'helpers/side-desk-utils';

/**
 * Custom hook to get Side Desk metrics based on current route
 * @returns {Object} Object containing deskType, deskName, metrics, and isLoading
 */
export const useSideDeskMetrics = () => {
  const pathname = usePathname();

  const deskType = useMemo(() => getDeskFromPathname(pathname), [pathname]);

  const deskName = useMemo(() => {
    return deskConfig[deskType]?.name || 'Business';
  }, [deskType]);

  const metrics = useMemo(() => {
    return getSideDeskMetrics(deskType);
  }, [deskType]);

  // For mock data, isLoading is always false
  // In future API integration, this would track actual loading state
  const isLoading = false;

  return {
    deskType,
    deskName,
    metrics,
    isLoading,
  };
};

export default useSideDeskMetrics;
