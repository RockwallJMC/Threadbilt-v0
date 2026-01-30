'use client';

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Stack,
  Chip,
  Alert
} from '@mui/material';
import {
  AccountBalanceWallet as BudgetIcon,
  TrendingUp as SpentIcon,
  Savings as RemainingIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import ReactEchart from 'components/base/ReactEchart';

const BudgetOverview = ({ project }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const budgetUsed = (project.spent / project.budget) * 100;
  const remaining = project.budget - project.spent;
  const isOverBudget = project.spent > project.budget;
  const isNearBudget = budgetUsed > 80;

  // Mock budget breakdown data
  const budgetBreakdown = [
    { category: 'Labor', budgeted: 80000, actual: 65000, color: '#1976d2' },
    { category: 'Materials', budgeted: 40000, actual: 35000, color: '#dc004e' },
    { category: 'Equipment', budgeted: 20000, actual: 18000, color: '#ed6c02' },
    { category: 'Overhead', budgeted: 10000, actual: 7000, color: '#2e7d32' }
  ];

  // Chart options for budget breakdown
  const chartOptions = {
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
        name: 'Budget Breakdown',
        type: 'pie',
        radius: '50%',
        data: budgetBreakdown.map(item => ({
          value: item.budgeted,
          name: item.category,
          itemStyle: { color: item.color }
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
      {/* Budget Alerts */}
      {(isOverBudget || isNearBudget) && (
        <Grid size={12}>
          <Alert 
            severity={isOverBudget ? 'error' : 'warning'} 
            icon={<WarningIcon />}
          >
            {isOverBudget 
              ? `Project is over budget by ${formatCurrency(project.spent - project.budget)}`
              : `Project is approaching budget limit (${budgetUsed.toFixed(1)}% used)`
            }
          </Alert>
        </Grid>
      )}

      {/* Budget Summary Cards */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <BudgetIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {formatCurrency(project.budget)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Budget
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <SpentIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {formatCurrency(project.spent)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Spent ({budgetUsed.toFixed(1)}%)
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <RemainingIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {formatCurrency(remaining)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Remaining
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Budget Progress */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Budget Progress
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(budgetUsed, 100)}
              color={isOverBudget ? 'error' : budgetUsed > 80 ? 'warning' : 'success'}
              sx={{ height: 12, borderRadius: 6 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                0%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {budgetUsed.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                100%
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Budget Breakdown Chart */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Budget Breakdown
            </Typography>
            <ReactEchart option={chartOptions} height="300px" />
          </CardContent>
        </Card>
      </Grid>

      {/* Category Details */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Category Details
            </Typography>
            <Stack spacing={2}>
              {budgetBreakdown.map((item, index) => {
                const variance = item.actual - item.budgeted;
                const variancePercent = (variance / item.budgeted) * 100;
                
                return (
                  <Box key={index}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {item.category}
                      </Typography>
                      <Chip
                        label={variance >= 0 ? `+${formatCurrency(variance)}` : formatCurrency(variance)}
                        color={variance > 0 ? 'error' : variance < 0 ? 'success' : 'default'}
                        size="small"
                      />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Budgeted: {formatCurrency(item.budgeted)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Actual: {formatCurrency(item.actual)}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(item.actual / item.budgeted) * 100}
                      color={variance > 0 ? 'error' : 'success'}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default BudgetOverview;
