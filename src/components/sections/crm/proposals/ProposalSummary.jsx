'use client';

import { Paper, Stack, Typography, TextField, Divider, Box } from '@mui/material';
import {
  calculateSubtotal,
  calculateTaxAmount,
  calculateTotal,
} from 'utils/crm/proposalCalculations';

/**
 * ProposalSummary Component
 *
 * Displays proposal financial summary with editable tax rate.
 * Updates in real-time as line items change.
 *
 * @param {Object} props
 * @param {Array} props.lineItems - Array of line item objects with quantity, unit_price
 * @param {number} props.taxRate - Current tax rate percentage (0-100)
 * @param {Function} props.onTaxRateChange - Tax rate change handler: (newRate) => void
 * @param {boolean} props.readOnly - If true, tax rate is read-only
 */
const ProposalSummary = ({
  lineItems = [],
  taxRate = 0,
  onTaxRateChange,
  readOnly = false,
}) => {
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const subtotal = calculateSubtotal(lineItems);
  const taxAmount = calculateTaxAmount(subtotal, taxRate);
  const total = calculateTotal(subtotal, taxAmount);

  const handleTaxRateChange = (e) => {
    const newRate = parseFloat(e.target.value) || 0;
    // Clamp between 0 and 100
    const clampedRate = Math.max(0, Math.min(100, newRate));
    if (onTaxRateChange) {
      onTaxRateChange(clampedRate);
    }
  };

  return (
    <Paper
      background={1}
      sx={{
        p: { xs: 2, md: 3 },
        position: { md: 'sticky' },
        top: { md: 16 },
      }}
    >
      <Typography variant="h6" gutterBottom>
        Summary
      </Typography>

      <Stack spacing={2}>
        {/* Subtotal */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Subtotal
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {formatCurrency(subtotal)}
          </Typography>
        </Stack>

        {/* Tax Rate */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Tax Rate
          </Typography>
          <Box sx={{ width: 100 }}>
            <TextField
              size="small"
              type="number"
              value={taxRate}
              onChange={handleTaxRateChange}
              disabled={readOnly}
              inputProps={{
                min: 0,
                max: 100,
                step: 0.25,
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                      %
                    </Typography>
                  ),
                },
              }}
              sx={{
                '& .MuiInputBase-input': {
                  textAlign: 'right',
                  pr: 0.5,
                },
              }}
            />
          </Box>
        </Stack>

        {/* Tax Amount */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Tax Amount
          </Typography>
          <Typography variant="body1">
            {formatCurrency(taxAmount)}
          </Typography>
        </Stack>

        <Divider />

        {/* Total */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Total
          </Typography>
          <Typography variant="h6" color="primary.main" fontWeight={600}>
            {formatCurrency(total)}
          </Typography>
        </Stack>

        {/* Line Item Count */}
        <Typography variant="caption" color="text.secondary" align="center">
          {lineItems.length} {lineItems.length === 1 ? 'item' : 'items'}
        </Typography>
      </Stack>
    </Paper>
  );
};

export default ProposalSummary;
