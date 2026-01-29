import { Stack, Typography } from '@mui/material';
import ForecastingDashboard from 'components/sections/crm/opportunities-forecast/ForecastingDashboard';

export const metadata = {
  title: 'Sales Forecast | PierceDesk',
};

const ForecastPage = () => {
  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight={600}>
          Sales Forecast
        </Typography>
      </Stack>

      <ForecastingDashboard />
    </Stack>
  );
};

export default ForecastPage;
