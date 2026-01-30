'use client';

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Stack,
  LinearProgress,
  Avatar,
  Chip
} from '@mui/material';
import ReactEchart from 'components/base/ReactEchart';

const LaborSummary = ({ project }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Mock labor summary data
  const laborSummary = {
    totalHours: 245,
    billableHours: 220,
    nonBillableHours: 25,
    totalCost: 20825,
    averageRate: 85,
    efficiency: 89.8
  };

  const teamMembers = [
    {
      id: 1,
      name: 'John Smith',
      role: 'Senior Developer',
      avatar: '/avatars/john.jpg',
      hours: 120,
      cost: 10200,
      efficiency: 95
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'UI/UX Designer',
      avatar: '/avatars/sarah.jpg',
      hours: 85,
      cost: 6375,
      efficiency: 88
    },
    {
      id: 3,
      name: 'Mike Davis',
      role: 'Project Manager',
      avatar: '/avatars/mike.jpg',
      hours: 40,
      cost: 3800,
      efficiency: 85
    }
  ];

  // Chart for hours distribution
  const hoursChartOptions = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} hours ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: 'Hours Distribution',
        type: 'pie',
        radius: '50%',
        data: [
          { value: laborSummary.billableHours, name: 'Billable Hours' },
          { value: laborSummary.nonBillableHours, name: 'Non-Billable Hours' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  return (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {laborSummary.totalHours}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Hours
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
              {formatCurrency(laborSummary.totalCost)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Cost
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
              ${laborSummary.averageRate}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average Rate
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'info.main' }}>
              {laborSummary.efficiency}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Efficiency
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      {/* Hours Distribution Chart */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Hours Distribution
            </Typography>
            <ReactEchart option={hoursChartOptions} height="300px" />
          </CardContent>
        </Card>
      </Grid>
      {/* Team Performance */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Team Performance
            </Typography>
            <Stack spacing={3}>
              {teamMembers.map((member) => (
                <Box key={member.id}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                    <Avatar src={member.avatar} sx={{ width: 40, height: 40 }}>
                      {member.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {member.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.role}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {member.hours}h • {formatCurrency(member.cost)}
                      </Typography>
                      <Chip
                        label={`${member.efficiency}% efficient`}
                        color={member.efficiency > 90 ? 'success' : member.efficiency > 80 ? 'warning' : 'error'}
                        size="small"
                      />
                    </Box>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={member.efficiency}
                    color={member.efficiency > 90 ? 'success' : member.efficiency > 80 ? 'warning' : 'error'}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default LaborSummary;
