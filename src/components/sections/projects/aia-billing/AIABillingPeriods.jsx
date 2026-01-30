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
  Chip,
  IconButton,
  Button,
  Stack
} from '@mui/material';
import { 
  Add as AddIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Edit as EditIcon 
} from '@mui/icons-material';
import { useState } from 'react';

const AIABillingPeriods = ({ project, onCreateNew, onViewDetails }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Mock AIA billing periods data
  const billingPeriods = [
    {
      id: 1,
      periodNumber: 1,
      periodEnd: '2024-01-31',
      scheduleValue: 150000,
      workCompleted: 45000,
      previouslyBilled: 0,
      currentBilling: 45000,
      retainage: 4500,
      amountDue: 40500,
      status: 'approved',
      submittedDate: '2024-02-01'
    },
    {
      id: 2,
      periodNumber: 2,
      periodEnd: '2024-02-29',
      scheduleValue: 150000,
      workCompleted: 75000,
      previouslyBilled: 45000,
      currentBilling: 30000,
      retainage: 7500,
      amountDue: 22500,
      status: 'pending',
      submittedDate: '2024-03-01'
    },
    {
      id: 3,
      periodNumber: 3,
      periodEnd: '2024-03-31',
      scheduleValue: 150000,
      workCompleted: 97500,
      previouslyBilled: 75000,
      currentBilling: 22500,
      retainage: 9750,
      amountDue: 12750,
      status: 'draft',
      submittedDate: null
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'draft':
        return 'default';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const totalBilled = billingPeriods.reduce((sum, period) => sum + period.currentBilling, 0);
  const totalRetainage = billingPeriods.reduce((sum, period) => sum + period.retainage, 0);
  const totalAmountDue = billingPeriods.reduce((sum, period) => sum + period.amountDue, 0);

  return (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {formatCurrency(totalBilled)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Billed
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
              {formatCurrency(totalRetainage)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Retainage
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
              {formatCurrency(totalAmountDue)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Amount Due
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      {/* Create New Button */}
      <Grid size={12}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateNew}
          >
            Create New Billing Period
          </Button>
        </Box>
      </Grid>
      {/* Billing Periods Table */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              AIA Billing Periods
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Period</TableCell>
                    <TableCell>Period End</TableCell>
                    <TableCell align="right">Work Completed</TableCell>
                    <TableCell align="right">Current Billing</TableCell>
                    <TableCell align="right">Retainage</TableCell>
                    <TableCell align="right">Amount Due</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {billingPeriods.map((period) => (
                    <TableRow key={period.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Period {period.periodNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>{period.periodEnd}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(period.workCompleted)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontWeight: 500 }}>
                          {formatCurrency(period.currentBilling)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(period.retainage)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontWeight: 500, color: 'success.main' }}>
                          {formatCurrency(period.amountDue)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={period.status}
                          color={getStatusColor(period.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => onViewDetails(period.id)}
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small" color="info">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="success">
                            <DownloadIcon />
                          </IconButton>
                        </Stack>
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

export default AIABillingPeriods;
