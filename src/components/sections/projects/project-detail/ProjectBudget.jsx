'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';

const ProjectBudget = ({ project }) => {
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

  const budgetBreakdown = [
    { category: 'Development', amount: 80000, color: 'primary' },
    { category: 'Design', amount: 25000, color: 'secondary' },
    { category: 'Testing', amount: 15000, color: 'success' },
    { category: 'Management', amount: 30000, color: 'warning' },
  ];

  return (
    <Grid container spacing={3}>
      {/* Budget Overview */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Budget Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <IconifyIcon 
                    icon="material-symbols:account-balance-wallet-outline" 
                    sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} 
                  />
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {formatCurrency(project.budget)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Budget
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <IconifyIcon 
                    icon="material-symbols:trending-up" 
                    sx={{ fontSize: 48, color: 'error.main', mb: 1 }} 
                  />
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {formatCurrency(project.spent)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Spent ({budgetUsed.toFixed(1)}%)
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <IconifyIcon 
                    icon="material-symbols:savings-outline" 
                    sx={{ fontSize: 48, color: 'success.main', mb: 1 }} 
                  />
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {formatCurrency(remaining)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Remaining
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3 }}>
              <LinearProgress
                variant="determinate"
                value={budgetUsed}
                color={budgetUsed > 80 ? 'error' : budgetUsed > 60 ? 'warning' : 'success'}
                sx={{ height: 12, borderRadius: 6 }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Budget Breakdown */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Budget Breakdown
            </Typography>
            <Stack spacing={2}>
              {budgetBreakdown.map((item, index) => (
                <Box key={index}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body1">{item.category}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatCurrency(item.amount)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={(item.amount / project.budget) * 100}
                    color={item.color}
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

export default ProjectBudget;
