'use client';

import { Button, Chip, Paper, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

const industryColors = {
  Technology: 'primary',
  Healthcare: 'success',
  Finance: 'warning',
  Manufacturing: 'info',
  Retail: 'secondary',
  Education: 'error',
};

const formatAddress = (address) => {
  if (!address) {
    return '';
  }

  if (typeof address === 'string') {
    return address;
  }

  if (Array.isArray(address)) {
    return address.filter(Boolean).join(', ');
  }

  if (typeof address === 'object') {
    return [
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.postal_code,
      address.country,
    ]
      .filter(Boolean)
      .join(', ');
  }

  return String(address);
};

const AccountSidebar = ({ account }) => {
  const handleEdit = () => {
    console.log('Edit account:', account.id);
    // TODO: Open edit dialog
  };

  const handleDelete = () => {
    console.log('Delete account:', account.id);
    // TODO: Open delete confirmation dialog
  };

  return (
    <Paper background={1} sx={{ p: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        {/* Industry */}
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Industry
          </Typography>
          <Chip
            label={account.industry}
            color={industryColors[account.industry] || 'default'}
            size="small"
            sx={{ width: 'fit-content' }}
          />
        </Stack>

        {/* Website */}
        {account.website && (
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Website
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconifyIcon icon="material-symbols:link" sx={{ fontSize: 18 }} />
              <Typography
                variant="body2"
                component="a"
                href={account.website}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                {account.website.replace(/^https?:\/\//, '')}
              </Typography>
            </Stack>
          </Stack>
        )}

        {/* Phone */}
        {account.phone && (
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Phone
            </Typography>
            <Typography variant="body2">{account.phone}</Typography>
          </Stack>
        )}

        {/* Billing Address */}
        {account.billing_address && (
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Billing Address
            </Typography>
            <Typography variant="body2">{formatAddress(account.billing_address)}</Typography>
          </Stack>
        )}

        {/* Shipping Address */}
        {account.shipping_address && (
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Shipping Address
            </Typography>
            <Typography variant="body2">{formatAddress(account.shipping_address)}</Typography>
          </Stack>
        )}

        {/* Notes */}
        {account.notes && (
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Notes
            </Typography>
            <Typography variant="body2">{account.notes}</Typography>
          </Stack>
        )}

        {/* Timestamps */}
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Created
          </Typography>
          <Typography variant="body2">
            {new Date(account.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
        </Stack>

        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Last Updated
          </Typography>
          <Typography variant="body2">
            {new Date(account.updated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
        </Stack>

        {/* Action buttons */}
        <Stack spacing={2} sx={{ pt: 2 }}>
          <Button variant="contained" color="primary" fullWidth onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="soft" color="error" fullWidth onClick={handleDelete}>
            Delete
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default AccountSidebar;
