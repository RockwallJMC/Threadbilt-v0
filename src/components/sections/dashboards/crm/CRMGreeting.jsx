'use client';

import {
  Avatar,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { cssVarRgba } from 'lib/utils';
import DateRangePicker from 'components/base/DateRangePicker';
import IconifyIcon from 'components/base/IconifyIcon';
import StyledTextField from 'components/styled/StyledTextField';
import { useCRMDashboardApi } from '@/services/swr/api-hooks/useCRMDashboardApi';

const CRMGreeting = () => {
  const { dealsMetrics, isLoading, hasError } = useCRMDashboardApi();

  if (isLoading) {
    return (
      <Paper background={1} sx={{ px: { xs: 3, md: 5 }, py: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (hasError || !dealsMetrics) {
    return (
      <Paper background={1} sx={{ px: { xs: 3, md: 5 }, py: 2 }}>
        <Alert severity="error">Failed to load deals metrics</Alert>
      </Paper>
    );
  }

  // Transform API data to component format
  const data = [
    {
      icon: 'material-symbols:handshake-outline-rounded',
      count: dealsMetrics.created.count,
      label: 'Deals created',
      percentage: dealsMetrics.created.percentage,
      trend: dealsMetrics.created.trend,
    },
    {
      icon: 'material-symbols:payments-outline-rounded',
      count: dealsMetrics.closed.count,
      label: 'Deals closed',
      percentage: dealsMetrics.closed.percentage,
      trend: dealsMetrics.closed.trend,
    },
  ];

  return (
    <Paper background={1} sx={{ px: { xs: 3, md: 5 }, py: 2 }}>
      <Stack
        direction="row"
        sx={{
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: 3, lg: 2 },
        }}
      >
        {/* Left section: Date Range Picker */}
        <Stack sx={{ flex: 1, justifyContent: 'flex-start' }}>
          <DateRangePicker
            dateFormat="d MMM, yy"
            isClearable
            placeholderText="Select Date Range"
            defaultStartDate={dayjs().subtract(7, 'day').toDate()}
            defaultEndDate={dayjs().toDate()}
            customInput={
              <StyledTextField
                size="large"
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconifyIcon
                          icon="material-symbols:calendar-month-outline-rounded"
                          sx={{ color: 'text.secondary' }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            }
            sx={{
              width: 1,
              maxWidth: { lg: 352 },
            }}
          />
        </Stack>

        {/* Center section: Reserved for future expansion */}
        <Stack sx={{ flex: 1, justifyContent: 'center' }}>
          {/* Empty for future use */}
        </Stack>

        {/* Right section: KPI cards */}
        <Stack sx={{ flex: 1, justifyContent: 'flex-end' }}>
          <List
            disablePadding
            sx={{
              display: 'flex',
              rowGap: 1,
              columnGap: { xs: 2, lg: 6 },
              flexWrap: 'wrap',
              justifyContent: { xs: 'flex-start', lg: 'flex-end' },
            }}
          >
            {data.map(({ label, icon, count, percentage, trend }) => (
              <ListItem
                key={label}
                disableGutters
                disablePadding
                sx={{
                  gap: 1,
                  width: 'max-content',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  whiteSpace: 'nowrap',
                }}
              >
                <ListItemAvatar sx={{ minWidth: 0 }}>
                  <Avatar
                    sx={{
                      bgcolor: ({ vars }) => cssVarRgba(vars.palette.primary.mainChannel, 0.12),
                      width: 32,
                      height: 32,
                    }}
                  >
                    <IconifyIcon icon={icon} sx={{ fontSize: 16, color: 'primary.dark' }} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  primary={
                    <>
                      <Typography variant="h5" fontWeight={500}>
                        {count}
                      </Typography>
                      <Typography variant="body2" fontWeight={500} color="text.secondary">
                        {label}
                      </Typography>
                    </>
                  }
                  secondary={
                    <Typography
                      variant="subtitle2"
                      color={trend === 'up' ? 'success' : 'warning'}
                      sx={{ ml: 0.5, fontWeight: 600 }}
                    >
                      {percentage}%{' '}
                      <IconifyIcon
                        icon={
                          trend === 'up'
                            ? 'material-symbols:keyboard-double-arrow-up-rounded'
                            : 'material-symbols:keyboard-double-arrow-down-rounded'
                        }
                        fontSize={16}
                        sx={{ verticalAlign: 'bottom' }}
                      />
                    </Typography>
                  }
                  sx={{ m: 0, flexGrow: 0, display: 'flex', gap: 0.5, alignItems: 'baseline' }}
                />
              </ListItem>
            ))}
          </List>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default CRMGreeting;
