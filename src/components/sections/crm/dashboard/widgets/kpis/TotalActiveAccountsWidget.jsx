'use client';

import { useMemo } from 'react';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import DashboardWidgetContainer from '../../DashboardWidgetContainer';
import { useDashboardKPIs } from 'services/swr/api-hooks/useDashboardApi';
import { useCRMDashboard } from 'providers/CRMDashboardProvider';
import useNumberFormat from 'hooks/useNumberFormat';

/**
 * Total Active Accounts KPI Widget
 * Displays count of accounts with recent activity
 */
const TotalActiveAccountsWidget = () => {
  const { dateRange } = useCRMDashboard();
  const { data: kpis, isLoading, error } = useDashboardKPIs(dateRange);
  const { numberFormat } = useNumberFormat();

  const value = useMemo(() => {
    if (!kpis) return null;
    return numberFormat(kpis.totalActiveAccounts);
  }, [kpis, numberFormat]);

  return (
    <DashboardWidgetContainer
      title="Total Active Accounts"
      loading={isLoading}
      error={error}
      minHeight={160}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ width: 48, height: 48, bgcolor: 'secondary.lighter' }}>
          <Icon icon="material-symbols:business" width={28} />
        </Avatar>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 500 }}>
            {value || '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            With recent activity
          </Typography>
        </div>
      </Stack>
    </DashboardWidgetContainer>
  );
};

export default TotalActiveAccountsWidget;
