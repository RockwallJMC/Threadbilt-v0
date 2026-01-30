'use client';

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Stack,
  Alert,
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Save as SaveIcon } from '@mui/icons-material';
import { useState } from 'react';
import dayjs from 'dayjs';

const MaterialPurchaseEntry = ({ project }) => {
  const [materialEntry, setMaterialEntry] = useState({
    name: '',
    category: '',
    supplier: '',
    quantity: '',
    unit: '',
    unitPrice: '',
    purchaseDate: dayjs(),
    billable: true,
    description: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);

  // Mock data for categories, suppliers, and units
  const categories = [
    'Structural',
    'Foundation',
    'Electrical',
    'Plumbing',
    'HVAC',
    'Safety',
    'Tools',
    'Finishing'
  ];

  const suppliers = [
    'Steel Supply Co.',
    'Concrete Solutions',
    'Electric Supply Inc.',
    'Plumbing Depot',
    'Safety First Ltd.',
    'Tool World',
    'Building Materials Inc.'
  ];

  const units = [
    'pieces',
    'cubic yards',
    'square feet',
    'linear feet',
    'tons',
    'gallons',
    'boxes',
    'sets',
    'rolls',
    'bags'
  ];

  const calculateTotalCost = () => {
    const quantity = parseFloat(materialEntry.quantity) || 0;
    const unitPrice = parseFloat(materialEntry.unitPrice) || 0;
    return quantity * unitPrice;
  };

  const handleSubmit = () => {
    // In a real app, this would submit to the backend
    console.log('Material entry submitted:', {
      ...materialEntry,
      totalCost: calculateTotalCost()
    });
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    
    // Reset form
    setMaterialEntry({
      name: '',
      category: '',
      supplier: '',
      quantity: '',
      unit: '',
      unitPrice: '',
      purchaseDate: dayjs(),
      billable: true,
      description: ''
    });
  };

  const totalCost = calculateTotalCost();

  return (
    <Grid container spacing={3}>
      {showSuccess && (
        <Grid size={12}>
          <Alert severity="success">
            Material purchase entry saved successfully! Total cost: ${totalCost.toFixed(2)}
          </Alert>
        </Grid>
      )}

      <Grid size={{ xs: 12, md: 8 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Add Material Purchase
            </Typography>
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Material Name"
                  fullWidth
                  value={materialEntry.name}
                  onChange={(e) => setMaterialEntry(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Steel Beams, Concrete Mix"
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  options={categories}
                  value={materialEntry.category}
                  onChange={(event, newValue) => setMaterialEntry(prev => ({ ...prev, category: newValue || '' }))}
                  renderInput={(params) => <TextField {...params} label="Category" />}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  options={suppliers}
                  value={materialEntry.supplier}
                  onChange={(event, newValue) => setMaterialEntry(prev => ({ ...prev, supplier: newValue || '' }))}
                  renderInput={(params) => <TextField {...params} label="Supplier" />}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Purchase Date"
                  value={materialEntry.purchaseDate}
                  onChange={(newValue) => setMaterialEntry(prev => ({ ...prev, purchaseDate: newValue }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Quantity"
                  type="number"
                  fullWidth
                  value={materialEntry.quantity}
                  onChange={(e) => setMaterialEntry(prev => ({ ...prev, quantity: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Autocomplete
                  options={units}
                  value={materialEntry.unit}
                  onChange={(event, newValue) => setMaterialEntry(prev => ({ ...prev, unit: newValue || '' }))}
                  renderInput={(params) => <TextField {...params} label="Unit" />}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Unit Price"
                  type="number"
                  fullWidth
                  value={materialEntry.unitPrice}
                  onChange={(e) => setMaterialEntry(prev => ({ ...prev, unitPrice: e.target.value }))}
                  InputProps={{
                    startAdornment: '$'
                  }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Description"
                  multiline
                  rows={3}
                  fullWidth
                  value={materialEntry.description}
                  onChange={(e) => setMaterialEntry(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional details about the material purchase..."
                />
              </Grid>
              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={materialEntry.billable}
                      onChange={(e) => setMaterialEntry(prev => ({ ...prev, billable: e.target.checked }))}
                    />
                  }
                  label="Billable to Client"
                />
              </Grid>
              <Grid size={12}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="outlined">
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                    disabled={!materialEntry.name || !materialEntry.quantity || !materialEntry.unitPrice}
                  >
                    Save Material Purchase
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Purchase Summary
            </Typography>
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Quantity
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 500 }}>
                  {materialEntry.quantity || '0'} {materialEntry.unit}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Unit Price
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 500 }}>
                  ${materialEntry.unitPrice || '0.00'}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Cost
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  ${totalCost.toFixed(2)}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: materialEntry.billable ? 'success.main' : 'text.secondary',
                  fontWeight: 500 
                }}>
                  {materialEntry.billable ? 'Billable' : 'Non-Billable'}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default MaterialPurchaseEntry;
