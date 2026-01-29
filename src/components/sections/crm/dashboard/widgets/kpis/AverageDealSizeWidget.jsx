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
 * Average Deal Size KPI Widget
 * Displays average value of won opportunities
 */
const AverageDealSizeWidget = () => {
  const { dateRange } = useCRMDashboard();
  const { data: kpis, isLoading, error } = useDashboardKPIs(dateRange);
  const { currencyFormat } = useNumberFormat();

  const value = useMemo(() => {
    if (!kpis) return null;
    return currencyFormat(kpis.averageDealSize);
  }, [kpis, currencyFormat]);

  return (
    <DashboardWidgetContainer
      title="Average Deal Size"
      loading={isLoading}
      error={error}
      minHeight={160}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.lighter' }}>
          <Icon icon="material-symbols:payments" width={28} />
        </Avatar>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 500 }}>
            {value || '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Per won opportunity
          </Typography>
        </div>
      </Stack>
    </DashboardWidgetContainer>
  );
};

export default AverageDealSizeWidget;
