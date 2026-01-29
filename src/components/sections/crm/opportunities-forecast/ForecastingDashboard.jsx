'use client';

import { CircularProgress, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { useOpportunities } from 'services/swr/api-hooks/useOpportunitiesApi';
import PipelineMetrics from './PipelineMetrics';
import StageBreakdownChart from './StageBreakdownChart';

const ForecastingDashboard = () => {
  const { data: opportunities, isLoading, error } = useOpportunities();

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 400 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (error) {
    return (
      <Paper background={1} sx={{ p: { xs: 3, md: 5 } }}>
        <Typography variant="h6" color="error">
          Error loading forecast data
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {error.message || 'Failed to load opportunities data'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Pipeline Metrics Cards */}
      <PipelineMetrics opportunities={opportunities || []} />

      {/* Stage Breakdown Chart */}
      <Grid container spacing={3}>
        <Grid size={12}>
          <Paper background={1} sx={{ p: { xs: 3, md: 5 } }}>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={600}>
                  Pipeline by Stage
                </Typography>
              </Stack>

              <StageBreakdownChart opportunities={opportunities || []} />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ForecastingDashboard;
