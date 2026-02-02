import { Box, Stack, Typography } from '@mui/material';
import MetricItem from './MetricItem';

const MetricSection = ({ title, metrics }) => {
  if (!metrics || metrics.length === 0) {
    return null;
  }

  return (
    <Box sx={{ px: 3, py: 2, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, color: 'text.primary' }}>
        {title}
      </Typography>
      <Stack spacing={1} sx={{ width: '100%' }}>
        {metrics.map((metric, index) => (
          <MetricItem
            key={`${metric.label}-${index}`}
            label={metric.label}
            quantity={metric.quantity}
            value={metric.value}
            icon={metric.icon}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default MetricSection;
