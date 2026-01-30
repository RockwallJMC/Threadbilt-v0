'use client';

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
  Stack
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

const BudgetAlerts = ({ project }) => {
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

  // Mock alert data
  const alerts = [
    {
      id: 1,
      type: 'error',
      title: 'Over Budget Alert',
      message: `Labor costs have exceeded budget by ${formatCurrency(5000)}`,
      category: 'Labor',
      severity: 'high',
      date: '2024-01-25'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Budget Threshold Warning',
      message: 'Material costs are approaching 90% of allocated budget',
      category: 'Materials',
      severity: 'medium',
      date: '2024-01-24'
    },
    {
      id: 3,
      type: 'info',
      title: 'Cost Trend Notice',
      message: 'Equipment costs are trending 15% below budget',
      category: 'Equipment',
      severity: 'low',
      date: '2024-01-23'
    }
  ];

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Overall Budget Status */}
      <Grid size={12}>
        {isOverBudget ? (
          <Alert severity="error" icon={<ErrorIcon />}>
            <AlertTitle>Project Over Budget</AlertTitle>
            This project has exceeded its budget by {formatCurrency(project.spent - project.budget)}. 
            Immediate action required to control costs.
          </Alert>
        ) : isNearBudget ? (
          <Alert severity="warning" icon={<WarningIcon />}>
            <AlertTitle>Budget Threshold Reached</AlertTitle>
            This project has used {budgetUsed.toFixed(1)}% of its budget. 
            Monitor spending closely to avoid overruns.
          </Alert>
        ) : (
          <Alert severity="success" icon={<InfoIcon />}>
            <AlertTitle>Budget On Track</AlertTitle>
            Project spending is within acceptable limits. 
            {formatCurrency(remaining)} remaining in budget.
          </Alert>
        )}
      </Grid>

      {/* Budget Progress */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Budget Utilization
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  Spent: {formatCurrency(project.spent)}
                </Typography>
                <Typography variant="body2">
                  Budget: {formatCurrency(project.budget)}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(budgetUsed, 100)}
                color={isOverBudget ? 'error' : budgetUsed > 80 ? 'warning' : 'success'}
                sx={{ height: 12, borderRadius: 6 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {budgetUsed.toFixed(1)}% of budget used
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Alerts */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Alerts
            </Typography>
            <List>
              {alerts.map((alert) => (
                <ListItem key={alert.id} sx={{ px: 0 }}>
                  <ListItemIcon>
                    {getAlertIcon(alert.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {alert.title}
                        </Typography>
                        <Chip
                          label={alert.severity}
                          color={getSeverityColor(alert.severity)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {alert.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {alert.category} • {alert.date}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Cost Trend Indicators */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Cost Trend Indicators
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUpIcon color="error" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Labor Costs Trending Up
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    15% increase over last month
                  </Typography>
                </Box>
                <Chip label="High Risk" color="error" size="small" />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ScheduleIcon color="warning" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Schedule Impact on Budget
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Delays may increase costs by 8%
                  </Typography>
                </Box>
                <Chip label="Medium Risk" color="warning" size="small" />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default BudgetAlerts;
