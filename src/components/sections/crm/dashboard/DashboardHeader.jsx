'use client';

import { Stack, Typography } from '@mui/material';
import DashboardSelectMenu from 'components/common/DashboardSelectMenu';
import { useCRMDashboard } from 'providers/CRMDashboardProvider';

const dateRangeOptions = [
  {
    value: 7,
    label: 'Last 7 days',
  },
  {
    value: 30,
    label: 'Last 30 days',
  },
  {
    value: 90,
    label: 'Last 90 days',
  },
];

/**
 * Dashboard header with title and date range filter
 * Connected to CRMDashboardProvider for state management
 */
const DashboardHeader = () => {
  const { dateRange, setDateRange } = useCRMDashboard();

  const handleDateRangeChange = (preset) => {
    setDateRange(preset);
  };

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: { xs: 3, md: 4 },
      }}
    >
      <div>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
          CRM Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Real-time insights and performance metrics
        </Typography>
      </div>

      <DashboardSelectMenu
        options={dateRangeOptions}
        defaultValue={dateRange.preset}
        onChange={handleDateRangeChange}
        size="small"
      />
    </Stack>
  );
};

export default DashboardHeader;
