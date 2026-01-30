'use client';

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Stack
} from '@mui/material';
import ReactEchart from 'components/base/ReactEchart';

const MaterialsSummary = ({ project }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Mock summary data
  const summary = {
    totalCost: 17850,
    billableCost: 16000,
    nonBillableCost: 1850,
    totalItems: 15,
    categories: {
      'Structural': 6250,
      'Foundation': 9500,
      'Electrical': 1250,
      'Safety': 850
    }
  };

  // Chart for cost by category
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
        name: 'Material Cost by Category',
        type: 'pie',
        radius: '50%',
        data: Object.entries(summary.categories).map(([category, cost]) => ({
          value: cost,
          name: category
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
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {formatCurrency(summary.totalCost)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Material Cost
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
              {formatCurrency(summary.billableCost)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Billable Materials
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'info.main' }}>
              {summary.totalItems}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Items
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      {/* Cost by Category Chart */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Cost by Category
            </Typography>
            <ReactEchart option={chartOptions} height="400px" />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default MaterialsSummary;
