'use client';

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from '@mui/material';

/**
 * ProposalLineItemsDisplay Component
 *
 * Read-only table displaying proposal line items.
 * Optional items are marked with "(Optional)" badge.
 *
 * @param {Object} props
 * @param {Array} props.lineItems - Array of line item objects
 */
const ProposalLineItemsDisplay = ({ lineItems = [] }) => {
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getItemTypeColor = (itemType) => {
    switch (itemType) {
      case 'material':
        return 'primary';
      case 'labor':
        return 'secondary';
      case 'equipment':
        return 'info';
      case 'service':
        return 'success';
      case 'optional':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (lineItems.length === 0) {
    return (
      <Paper background={1} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No line items in this proposal
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} background={1}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Item Type</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell align="right">Unit Price</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lineItems.map((item, index) => (
            <TableRow key={item.id || index} hover>
              <TableCell>
                <Chip
                  label={item.item_type || 'Service'}
                  color={getItemTypeColor(item.item_type)}
                  size="small"
                  variant="soft"
                  sx={{ textTransform: 'capitalize' }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {item.description}
                  {item.item_type === 'optional' && (
                    <Chip
                      label="Optional"
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">{item.quantity}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {formatCurrency(item.unit_price)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight={500}>
                  {formatCurrency(item.total_price)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProposalLineItemsDisplay;
