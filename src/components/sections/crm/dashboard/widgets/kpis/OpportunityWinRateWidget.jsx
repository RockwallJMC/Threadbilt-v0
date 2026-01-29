'use client';

import { useMemo } from 'react';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import DashboardWidgetContainer from '../../DashboardWidgetContainer';
import { useDashboardKPIs } from 'services/swr/api-hooks/useDashboardApi';
import { useCRMDashboard } from 'providers/CRMDashboardProvider';

/**
 * Opportunity Win Rate KPI Widget
 * Displays percentage of opportunities closed won
 */
const OpportunityWinRateWidget = () => {
  const { dateRange } = useCRMDashboard();
  const { data: kpis, isLoading, error } = useDashboardKPIs(dateRange);

  const value = useMemo(() => {
    if (!kpis) return null;
    return `${kpis.opportunityWinRate.toFixed(1)}%`;
  }, [kpis]);

  return (
    <DashboardWidgetContainer
      title="Opportunity Win Rate"
      loading={isLoading}
      error={error}
      minHeight={160}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ width: 48, height: 48, bgcolor: 'success.lighter' }}>
          <Icon icon="material-symbols:emoji-events" width={28} />
        </Avatar>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 500 }}>
            {value || '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Closed won rate
          </Typography>
        </div>
      </Stack>
    </DashboardWidgetContainer>
  );
};

export default OpportunityWinRateWidget;
