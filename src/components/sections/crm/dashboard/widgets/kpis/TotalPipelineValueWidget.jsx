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
 * Total Pipeline Value KPI Widget
 * Displays the sum of all open opportunities
 */
const TotalPipelineValueWidget = () => {
  const { dateRange } = useCRMDashboard();
  const { data: kpis, isLoading, error } = useDashboardKPIs(dateRange);
  const { currencyFormat } = useNumberFormat();

  const value = useMemo(() => {
    if (!kpis) return null;
    return currencyFormat(kpis.totalPipelineValue);
  }, [kpis, currencyFormat]);

  return (
    <DashboardWidgetContainer
      title="Total Pipeline Value"
      loading={isLoading}
      error={error}
      minHeight={160}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.lighter' }}>
          <Icon icon="material-symbols:trending-up" width={28} />
        </Avatar>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 500 }}>
            {value || '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            All open opportunities
          </Typography>
        </div>
      </Stack>
    </DashboardWidgetContainer>
  );
};

export default TotalPipelineValueWidget;
