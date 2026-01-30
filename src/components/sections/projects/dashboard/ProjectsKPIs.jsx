'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';

const KPICard = ({ metric }) => {
  const { title, count, change, icon } = metric;
  const isPositive = change?.direction === 'more';
  const isNegative = change?.direction === 'less';

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${icon.color}.lighter`,
              color: `${icon.color}.main`,
            }}
          >
            <IconifyIcon icon={icon.name} sx={{ fontSize: 24 }} />
          </Box>
        </Stack>

        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          {count}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {title}
        </Typography>

        {change && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: isPositive ? 'success.main' : isNegative ? 'error.main' : 'text.secondary',
              }}
            >
              <IconifyIcon
                icon={
                  isPositive
                    ? 'material-symbols:trending-up'
                    : isNegative
                    ? 'material-symbols:trending-down'
                    : 'material-symbols:trending-flat'
                }
                sx={{ fontSize: 16, mr: 0.5 }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {change.amount}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {change.timeFrame}
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

const ProjectsKPIs = ({ metrics }) => {
  return (
    <Grid container spacing={3}>
      {metrics.map((metric, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard metric={metric} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProjectsKPIs;
