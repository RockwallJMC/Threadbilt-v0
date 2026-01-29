import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

/**
 * Calculate days until a given date
 * @param {string|Date} dateString - Expected close date
 * @returns {number} Days until the date (negative if past)
 */
const calculateDaysUntil = (dateString) => {
  if (!dateString) return 0;
  const targetDate = new Date(dateString);
  const today = new Date();
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Get probability chip color based on percentage
 * @param {number} probability - Probability percentage (0-100)
 * @returns {string} MUI chip color
 */
const getProbabilityColor = (probability) => {
  if (probability >= 75) return 'success';
  if (probability >= 50) return 'info';
  if (probability >= 25) return 'warning';
  return 'error';
};

/**
 * ForecastingWidget Component
 *
 * Displays forecasting metrics for an opportunity:
 * - Weighted Value: opportunity value × probability / 100
 * - Days to Close: Days until expected close date
 * - Probability: Success probability percentage
 *
 * @param {Object} props
 * @param {number} props.value - Opportunity value in dollars
 * @param {number} props.probability - Probability percentage (0-100)
 * @param {string} props.expectedCloseDate - Expected close date (ISO string)
 */
const ForecastingWidget = ({ value, probability, expectedCloseDate }) => {
  const weightedValue = Math.floor((value * probability) / 100);
  const daysToClose = calculateDaysUntil(expectedCloseDate);
  const probabilityColor = getProbabilityColor(probability);

  return (
    <Paper
      data-testid="forecasting-widget"
      sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}
      background={1}
    >
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
        Forecast
      </Typography>

      <Stack direction="column" spacing={2.5}>
        {/* Weighted Value */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Weighted Value
          </Typography>
          <Typography
            variant="h6"
            data-testid="weighted-value"
            sx={{ fontWeight: 700, color: 'primary.main' }}
          >
            ${weightedValue.toLocaleString()}
          </Typography>
        </Stack>

        {/* Days to Close */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Days to Close
          </Typography>
          <Typography
            variant="h6"
            data-testid="days-to-close"
            sx={{
              fontWeight: 700,
              color: daysToClose < 0 ? 'error.main' : 'text.primary',
            }}
          >
            {daysToClose < 0 ? `${Math.abs(daysToClose)} overdue` : daysToClose}
          </Typography>
        </Stack>

        {/* Probability */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Probability
          </Typography>
          <Chip
            label={`${probability}%`}
            color={probabilityColor}
            data-testid="probability-chip"
            sx={{ fontWeight: 600 }}
          />
        </Stack>
      </Stack>
    </Paper>
  );
};

export default ForecastingWidget;
