'use client';

import { Avatar, Box, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import useNumberFormat from 'hooks/useNumberFormat';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  calculateTotalPipeline,
  calculateWeightedForecast,
} from 'helpers/crm/forecastingCalculations';

const MetricCard = ({ title, value, subtitle, icon, color = 'primary' }) => {
  return (
    <Box sx={{ p: 2, bgcolor: 'background.elevation1', borderRadius: 4, height: 1 }}>
      <Stack direction="column" gap={0.5} sx={{ height: 1, justifyContent: 'space-between' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Typography variant="subtitle2" fontWeight={600}>
            {title}
          </Typography>

          <Avatar
            variant="circular"
            sx={({ vars }) => ({
              width: 40,
              height: 40,
              bgcolor: vars.palette[color]?.[50] || vars.palette.chBlue[50],
            })}
          >
            <IconifyIcon icon={icon} sx={{ fontSize: 24, color: `${color}.main` }} />
          </Avatar>
        </Stack>

        <Stack direction="column" gap={0.5}>
          <Typography variant="h5" fontWeight={500}>
            {value}
          </Typography>

          {subtitle && (
            <Typography variant="caption" fontWeight={500} color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

const PipelineMetrics = ({ opportunities = [] }) => {
  const { currencyFormat, numberFormat } = useNumberFormat();

  const totalPipeline = calculateTotalPipeline(opportunities);
  const weightedForecast = calculateWeightedForecast(opportunities);

  // Calculate expected wins (opportunities closing in next 30 days with >= 50% probability)
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expectedWins = opportunities.filter((opp) => {
    const closeDateStr = opp.expected_close_date || opp.closeDate;
    if (!closeDateStr) return false;
    const closeDate = new Date(closeDateStr);
    return (
      closeDate <= thirtyDaysFromNow &&
      closeDate >= now &&
      (opp.probability || 0) >= 50 &&
      !['closed_won', 'closed_lost'].includes(opp.stage)
    );
  }).length;

  // Calculate average opportunity size
  const openOpportunities = opportunities.filter(
    (opp) => !['closed_won', 'closed_lost'].includes(opp.stage)
  );
  const avgOpportunitySize =
    openOpportunities.length > 0 ? totalPipeline / openOpportunities.length : 0;

  // Calculate weighted forecast percentage
  const weightedPercentage =
    totalPipeline > 0 ? Math.round((weightedForecast / totalPipeline) * 100) : 0;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard
          title="Total Pipeline"
          value={currencyFormat(totalPipeline)}
          icon="material-symbols:trending-up"
          color="primary"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard
          title="Weighted Forecast"
          value={currencyFormat(weightedForecast)}
          subtitle={`${weightedPercentage}% of pipeline`}
          icon="material-symbols:calculate"
          color="success"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard
          title="Expected Wins"
          value={numberFormat(expectedWins)}
          subtitle="Closing in next 30 days"
          icon="material-symbols:check-circle"
          color="warning"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard
          title="Avg Opportunity"
          value={currencyFormat(avgOpportunitySize)}
          icon="material-symbols:analytics"
          color="info"
        />
      </Grid>
    </Grid>
  );
};

export default PipelineMetrics;
