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
  Button,
  Stack
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const MaterialCostBreakdown = ({ project }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Sample material data
  const materialData = [
    {
      id: 1,
      name: 'Steel Beams',
      category: 'Structural',
      supplier: 'Steel Supply Co.',
      quantity: 50,
      unit: 'pieces',
      unitPrice: 125.00,
      totalCost: 6250.00,
      billable: true,
      status: 'delivered'
    },
    {
      id: 2,
      name: 'Concrete Mix',
      category: 'Foundation',
      supplier: 'Concrete Solutions',
      quantity: 100,
      unit: 'cubic yards',
      unitPrice: 95.00,
      totalCost: 9500.00,
      billable: true,
      status: 'delivered'
    }
  ];

  const totalMaterialCost = materialData.reduce((sum, item) => sum + item.totalCost, 0);
  const billableCost = materialData.filter(item => item.billable).reduce((sum, item) => sum + item.totalCost, 0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'ordered':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {formatCurrency(totalMaterialCost)}
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
              {formatCurrency(billableCost)}
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
              {materialData.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Items
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Add Material Button */}
      <Grid size={12}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />}>
            Add Material Purchase
          </Button>
        </Box>
      </Grid>

      {/* Materials Table */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Material Purchases
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Material</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Supplier</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Total Cost</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materialData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell align="right">
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontWeight: 500 }}>
                          {formatCurrency(item.totalCost)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={item.status}
                          color={getStatusColor(item.status)}
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

export default MaterialCostBreakdown;
