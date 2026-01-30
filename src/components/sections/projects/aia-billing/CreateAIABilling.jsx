'use client';

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Save as SaveIcon, Calculate as CalculateIcon } from '@mui/icons-material';
import { useState } from 'react';
import dayjs from 'dayjs';

const CreateAIABilling = ({ project, onSave, onCancel }) => {
  const [billingData, setBillingData] = useState({
    periodEnd: dayjs(),
    retainageRate: 10, // 10% default
    scheduleOfValues: [
      {
        id: 1,
        description: 'Site Preparation',
        scheduledValue: 25000,
        workCompletedPrevious: 25000,
        workCompletedCurrent: 0,
        materialsPrevious: 0,
        materialsCurrent: 0
      },
      {
        id: 2,
        description: 'Foundation Work',
        scheduledValue: 50000,
        workCompletedPrevious: 30000,
        workCompletedCurrent: 20000,
        materialsPrevious: 5000,
        materialsCurrent: 3000
      },
      {
        id: 3,
        description: 'Structural Framework',
        scheduledValue: 75000,
        workCompletedPrevious: 0,
        workCompletedCurrent: 15000,
        materialsPrevious: 0,
        materialsCurrent: 8000
      }
    ]
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  const calculateTotals = () => {
    const totals = billingData.scheduleOfValues.reduce((acc, item) => {
      const totalWorkCompleted = item.workCompletedPrevious + item.workCompletedCurrent;
      const totalMaterials = item.materialsPrevious + item.materialsCurrent;
      const totalCompleted = totalWorkCompleted + totalMaterials;
      
      acc.scheduledValue += item.scheduledValue;
      acc.workCompletedToDate += totalCompleted;
      acc.workCompletedCurrent += item.workCompletedCurrent + item.materialsCurrent;
      acc.workCompletedPrevious += item.workCompletedPrevious + item.materialsPrevious;
      
      return acc;
    }, {
      scheduledValue: 0,
      workCompletedToDate: 0,
      workCompletedCurrent: 0,
      workCompletedPrevious: 0
    });
    const retainage = (totals.workCompletedToDate * billingData.retainageRate) / 100;
    const amountDue = totals.workCompletedCurrent - (retainage - ((totals.workCompletedPrevious * billingData.retainageRate) / 100));
    return {
      ...totals,
      retainage,
      amountDue: Math.max(0, amountDue)
    };
  };
  const totals = calculateTotals();
  const handleSOVChange = (index, field, value) => {
    const newSOV = [...billingData.scheduleOfValues];
    newSOV[index] = { ...newSOV[index], [field]: parseFloat(value) || 0 };
    setBillingData(prev => ({ ...prev, scheduleOfValues: newSOV }));
  };
  const handleSubmit = () => {
    const billingPeriod = {
      ...billingData,
      totals,
      createdDate: dayjs().toISOString()
    };
    
    console.log('AIA Billing Period created:', billingPeriod);
    onSave?.(billingPeriod);
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  return (
    <Grid container spacing={3}>
      {showSuccess && (
        <Grid size={12}>
          <Alert severity="success">
            AIA Billing Period created successfully! Amount due: {formatCurrency(totals.amountDue)}
          </Alert>
        </Grid>
      )}
      {/* Billing Period Info */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Billing Period Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Period End Date"
                  value={billingData.periodEnd}
                  onChange={(newValue) => setBillingData(prev => ({ ...prev, periodEnd: newValue }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Retainage Rate (%)"
                  type="number"
                  fullWidth
                  value={billingData.retainageRate}
                  onChange={(e) => setBillingData(prev => ({ ...prev, retainageRate: parseFloat(e.target.value) || 0 }))}
                  InputProps={{ endAdornment: '%' }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      {/* Schedule of Values */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Schedule of Values (G703)
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Scheduled Value</TableCell>
                    <TableCell align="right">Work Completed (Previous)</TableCell>
                    <TableCell align="right">Work Completed (Current)</TableCell>
                    <TableCell align="right">Materials (Previous)</TableCell>
                    <TableCell align="right">Materials (Current)</TableCell>
                    <TableCell align="right">Total Completed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {billingData.scheduleOfValues.map((item, index) => {
                    const totalCompleted = item.workCompletedPrevious + item.workCompletedCurrent + 
                                         item.materialsPrevious + item.materialsCurrent;
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{formatCurrency(item.scheduledValue)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.workCompletedPrevious)}</TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small"
                            type="number"
                            value={item.workCompletedCurrent}
                            onChange={(e) => handleSOVChange(index, 'workCompletedCurrent', e.target.value)}
                            sx={{ width: 120 }}
                          />
                        </TableCell>
                        <TableCell align="right">{formatCurrency(item.materialsPrevious)}</TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small"
                            type="number"
                            value={item.materialsCurrent}
                            onChange={(e) => handleSOVChange(index, 'materialsCurrent', e.target.value)}
                            sx={{ width: 120 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontWeight: 500 }}>
                            {formatCurrency(totalCompleted)}
                          </Typography>
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
      {/* Billing Summary */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Billing Summary (G702)
            </Typography>
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Total Scheduled Value:</Typography>
                    <Typography sx={{ fontWeight: 500 }}>
                      {formatCurrency(totals.scheduledValue)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Work Completed to Date:</Typography>
                    <Typography sx={{ fontWeight: 500 }}>
                      {formatCurrency(totals.workCompletedToDate)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Less Previous Billing:</Typography>
                    <Typography sx={{ fontWeight: 500 }}>
                      {formatCurrency(totals.workCompletedPrevious)}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Current Billing:</Typography>
                    <Typography sx={{ fontWeight: 500 }}>
                      {formatCurrency(totals.workCompletedCurrent)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Retainage ({billingData.retainageRate}%):</Typography>
                    <Typography sx={{ fontWeight: 500, color: 'warning.main' }}>
                      -{formatCurrency(totals.retainage)}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Amount Due:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                      {formatCurrency(totals.amountDue)}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      {/* Action Buttons */}
      <Grid size={12}>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
          >
            Create Billing Period
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default CreateAIABilling;
