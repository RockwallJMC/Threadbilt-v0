'use client';

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { useState } from 'react';
import ReactEchart from 'components/base/ReactEchart';

const BudgetVsActual = ({ project }) => {
  const [timeframe, setTimeframe] = useState('monthly');
  const [category, setCategory] = useState('all');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Mock data for budget vs actual over time
  const budgetData = [
    { period: 'Jan 2024', budgeted: 25000, actual: 22000 },
    { period: 'Feb 2024', budgeted: 30000, actual: 28000 },
    { period: 'Mar 2024', budgeted: 35000, actual: 38000 },
    { period: 'Apr 2024', budgeted: 40000, actual: 42000 },
    { period: 'May 2024', budgeted: 20000, actual: 18000 },
  ];

  // Chart options for budget vs actual
  const chartOptions = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['Budgeted', 'Actual']
    },
    xAxis: {
      type: 'category',
      data: budgetData.map(item => item.period)
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value) => `$${value / 1000}K`
      }
    },
    series: [
      {
        name: 'Budgeted',
        type: 'bar',
        data: budgetData.map(item => item.budgeted),
        itemStyle: { color: '#1976d2' }
      },
      {
        name: 'Actual',
        type: 'bar',
        data: budgetData.map(item => item.actual),
        itemStyle: { color: '#dc004e' }
      }
    ]
  };

  // Detailed breakdown data
  const detailedBreakdown = [
    { 
      category: 'Labor', 
      budgeted: 80000, 
      actual: 75000, 
      variance: -5000,
      status: 'under'
    },
    { 
      category: 'Materials', 
      budgeted: 40000, 
      actual: 45000, 
      variance: 5000,
      status: 'over'
    },
    { 
      category: 'Equipment', 
      budgeted: 20000, 
      actual: 18000, 
      variance: -2000,
      status: 'under'
    },
    { 
      category: 'Overhead', 
      budgeted: 10000, 
      actual: 12000, 
      variance: 2000,
      status: 'over'
    }
  ];

  return (
    <Grid container spacing={3}>
      {/* Controls */}
      <Grid size={12}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={timeframe}
              label="Timeframe"
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="labor">Labor</MenuItem>
              <MenuItem value="materials">Materials</MenuItem>
              <MenuItem value="equipment">Equipment</MenuItem>
              <MenuItem value="overhead">Overhead</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Grid>

      {/* Budget vs Actual Chart */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Budget vs Actual Spending
            </Typography>
            <ReactEchart option={chartOptions} height="400px" />
          </CardContent>
        </Card>
      </Grid>

      {/* Detailed Breakdown Table */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Detailed Breakdown
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Budgeted</TableCell>
                    <TableCell align="right">Actual</TableCell>
                    <TableCell align="right">Variance</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailedBreakdown.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {row.category}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(row.budgeted)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(row.actual)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          color={row.variance > 0 ? 'error.main' : 'success.main'}
                          sx={{ fontWeight: 500 }}
                        >
                          {row.variance > 0 ? '+' : ''}{formatCurrency(row.variance)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.status === 'over' ? 'Over Budget' : 'Under Budget'}
                          color={row.status === 'over' ? 'error' : 'success'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default BudgetVsActual;
