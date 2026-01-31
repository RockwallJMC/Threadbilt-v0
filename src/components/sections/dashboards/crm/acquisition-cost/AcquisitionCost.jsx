'use client';

import { useRef } from 'react';
import { CircularProgress, Alert, Paper, Stack, Typography, boxClasses } from '@mui/material';
import useToggleChartLegends from 'hooks/useToggleChartLegends';
import ChartLegend from 'components/common/ChartLegend';
import DashboardMenu from 'components/common/DashboardMenu';
import AcquisitionCostChart from './AcquisitionCostChart';
import { useCRMDashboardApi } from '@/services/swr/api-hooks/useCRMDashboardApi';

const chartLegends = [
  { label: 'Allotted', color: 'chBlue.300' },
  { label: 'Used', color: 'chGrey.300' },
];

const AcquisitionCost = () => {
  const chartRef = useRef(null);
  const { legendState, handleLegendToggle } = useToggleChartLegends(chartRef);
  const { acquisitionCost, isLoading, hasError } = useCRMDashboardApi();

  if (isLoading) {
    return (
      <Paper sx={{ height: 1, p: { xs: 3, md: 5 }, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (hasError || !acquisitionCost) {
    return (
      <Paper sx={{ height: 1, p: { xs: 3, md: 5 } }}>
        <Alert severity="error">Failed to load acquisition cost</Alert>
      </Paper>
    );
  }

  // Generate simple chart data from API metrics (placeholder visualization)
  // API returns: {costPerAcquisition, totalCost, totalAcquisitions, trend}
  // Chart expects: {allotted: [...], used: [...]}
  const avgCost = acquisitionCost.costPerAcquisition;
  const totalCost = acquisitionCost.totalCost;

  const acquisitionCostData = {
    allotted: Array(7).fill(totalCost * 1.2), // 20% above actual as "allotted"
    used: Array(7).fill(avgCost * acquisitionCost.totalAcquisitions / 7) // Distribute across week
  };

  return (
    <Paper sx={{ height: 1, p: { xs: 3, md: 5 } }}>
      <Stack
        sx={{
          columnGap: { xs: 5, lg: 3 },
          rowGap: 2,
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          justifyContent: 'space-between',
        }}
      >
        <div>
          <Typography variant="h6" mb={1}>
            Customer Acquisition Cost
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            CAC present vs last week
          </Typography>
        </div>

        <Stack
          sx={{
            flex: 1,
            flexBasis: { xs: '100%', sm: 0 },
            order: { xs: 1, sm: 0 },
            alignSelf: 'flex-start',
            gap: 2,
            my: 1.25,
          }}
        >
          {chartLegends.map((legend) => (
            <ChartLegend
              key={legend.label}
              label={legend.label}
              color={legend.color}
              isActive={legendState[legend.label]}
              handleClick={() => handleLegendToggle(legend.label)}
              sx={{
                [`& .${boxClasses.root}`]: {
                  borderRadius: 0.5,
                  height: 8,
                },
              }}
            />
          ))}
        </Stack>
        <DashboardMenu />
      </Stack>

      <AcquisitionCostChart
        data={acquisitionCostData}
        sx={{ height: '230px !important' }}
        ref={chartRef}
      />
    </Paper>
  );
};

export default AcquisitionCost;
