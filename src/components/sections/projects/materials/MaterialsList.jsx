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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Button
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Search as SearchIcon 
} from '@mui/icons-material';
import { useState } from 'react';

const MaterialsList = ({ project }) => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Mock materials data
  const materialsData = [
    {
      id: 1,
      name: 'Steel Beams',
      category: 'Structural',
      supplier: 'Steel Supply Co.',
      quantity: 50,
      unit: 'pieces',
      unitPrice: 125.00,
      totalCost: 6250.00,
      purchaseDate: '2024-01-15',
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
      purchaseDate: '2024-01-20',
      billable: true,
      status: 'delivered'
    },
    {
      id: 3,
      name: 'Electrical Wire',
      category: 'Electrical',
      supplier: 'Electric Supply Inc.',
      quantity: 500,
      unit: 'feet',
      unitPrice: 2.50,
      totalCost: 1250.00,
      purchaseDate: '2024-02-01',
      billable: true,
      status: 'ordered'
    }
  ];

  const categories = ['all', 'Structural', 'Foundation', 'Electrical', 'Plumbing', 'HVAC', 'Safety'];

  const filteredMaterials = materialsData.filter(material => {
    const matchesCategory = filterCategory === 'all' || material.category === filterCategory;
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'ordered':
        return 'warning';
      case 'pending':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Filters and Search */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  size="small"
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filterCategory}
                    label="Category"
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
              >
                Export
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      {/* Materials Table */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Materials List ({filteredMaterials.length} items)
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
                    <TableCell>Purchase Date</TableCell>
                    <TableCell align="center">Billable</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {material.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{material.category}</TableCell>
                      <TableCell>{material.supplier}</TableCell>
                      <TableCell align="right">
                        {material.quantity} {material.unit}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(material.unitPrice)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontWeight: 500 }}>
                          {formatCurrency(material.totalCost)}
                        </Typography>
                      </TableCell>
                      <TableCell>{material.purchaseDate}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={material.billable ? 'Yes' : 'No'}
                          color={material.billable ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={material.status}
                          color={getStatusColor(material.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
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

export default MaterialsList;
