'use client';

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  LinearProgress,
  Stack
} from '@mui/material';
import ReactEchart from 'components/base/ReactEchart';

const LaborCostBreakdown = ({ project }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Mock labor data
  const laborData = [
    {
      id: 1,
      name: 'John Smith',
      role: 'Senior Developer',
      avatar: '/avatars/john.jpg',
      hourlyRate: 85,
      hoursWorked: 160,
      budgetedHours: 180,
      totalCost: 13600,
      budgetedCost: 15300,
      billableHours: 150,
      nonBillableHours: 10
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'UI/UX Designer',
      avatar: '/avatars/sarah.jpg',
      hourlyRate: 75,
      hoursWorked: 120,
      budgetedHours: 100,
      totalCost: 9000,
      budgetedCost: 7500,
      billableHours: 115,
      nonBillableHours: 5
    },
    {
      id: 3,
      name: 'Mike Davis',
      role: 'Project Manager',
      avatar: '/avatars/mike.jpg',
      hourlyRate: 95,
      hoursWorked: 80,
      budgetedHours: 90,
      totalCost: 7600,
      budgetedCost: 8550,
      billableHours: 70,
      nonBillableHours: 10
    }
  ];

  const totalActualCost = laborData.reduce((sum, item) => sum + item.totalCost, 0);
  const totalBudgetedCost = laborData.reduce((sum, item) => sum + item.budgetedCost, 0);
  const totalHoursWorked = laborData.reduce((sum, item) => sum + item.hoursWorked, 0);
  const totalBudgetedHours = laborData.reduce((sum, item) => sum + item.budgetedHours, 0);

  // Chart data for labor cost by role
  const roleChartOptions = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: 'Labor Cost by Role',
        type: 'pie',
        radius: '50%',
        data: laborData.map(item => ({
          value: item.totalCost,
          name: item.role
        })),
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
              {formatCurrency(totalActualCost)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Labor Cost
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
              {totalHoursWorked}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hours Worked
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
              ${Math.round(totalActualCost / totalHoursWorked)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg Hourly Rate
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 600, 
                color: totalActualCost > totalBudgetedCost ? 'error.main' : 'success.main' 
              }}
            >
              {formatCurrency(totalActualCost - totalBudgetedCost)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Budget Variance
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Labor Cost Chart */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Labor Cost by Role
            </Typography>
            <ReactEchart option={roleChartOptions} height="300px" />
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
            <Stack spacing={2}>
              {laborData.map((member) => {
                const efficiency = (member.hoursWorked / member.budgetedHours) * 100;
                return (
                  <Box key={member.id}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                      <Avatar src={member.avatar} sx={{ width: 32, height: 32 }}>
                        {member.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {member.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.role}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {member.hoursWorked}h / {member.budgetedHours}h
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(efficiency, 100)}
                      color={efficiency > 100 ? 'error' : efficiency > 80 ? 'warning' : 'success'}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Detailed Labor Table */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Detailed Labor Breakdown
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Team Member</TableCell>
                    <TableCell align="right">Hourly Rate</TableCell>
                    <TableCell align="right">Hours Worked</TableCell>
                    <TableCell align="right">Budgeted Hours</TableCell>
                    <TableCell align="right">Total Cost</TableCell>
                    <TableCell align="right">Budgeted Cost</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {laborData.map((member) => {
                    const isOverBudget = member.totalCost > member.budgetedCost;
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar src={member.avatar} sx={{ width: 32, height: 32 }}>
                              {member.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {member.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {member.role}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">${member.hourlyRate}/hr</TableCell>
                        <TableCell align="right">{member.hoursWorked}h</TableCell>
                        <TableCell align="right">{member.budgetedHours}h</TableCell>
                        <TableCell align="right">{formatCurrency(member.totalCost)}</TableCell>
                        <TableCell align="right">{formatCurrency(member.budgetedCost)}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={isOverBudget ? 'Over Budget' : 'On Track'}
                            color={isOverBudget ? 'error' : 'success'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default LaborCostBreakdown;
