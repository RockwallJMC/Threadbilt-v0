import { Box, Chip, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

const MetricItem = ({ label, quantity, value, icon }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        py: 1.5,
        px: 2,
        borderRadius: 2,
        bgcolor: 'background.elevation1',
        transition: 'background-color 0.2s',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      {/* Top row: Icon + Label */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%', minWidth: 0 }}>
        <IconifyIcon icon={icon} sx={{ fontSize: 20, color: 'text.secondary', flexShrink: 0 }} />
        <Typography
          variant="body2"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            minWidth: 0,
          }}
        >
          {label}
        </Typography>
      </Stack>

      {/* Bottom row: Quantity Chip + Value */}
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ width: '100%', justifyContent: 'flex-start', pl: 3.5 }}
      >
        <Chip label={quantity} size="small" color="primary" />
        <Typography variant="body2" fontWeight={500}>
          {value}
        </Typography>
      </Stack>
    </Box>
  );
};

export default MetricItem;
