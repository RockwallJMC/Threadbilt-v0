'use client';

import { Paper, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';

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

const OverviewTab = ({ account }) => {
  return (
    <Stack spacing={3}>
      {/* Summary stats */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper sx={{ p: 3, bgcolor: 'primary.lighter' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Total Contacts
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
              0
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper sx={{ p: 3, bgcolor: 'success.lighter' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Open Opportunities
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
              0
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper sx={{ p: 3, bgcolor: 'warning.lighter' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Total Revenue
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
              $0
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Account details */}
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Account Details
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Account Name
              </Typography>
              <Typography variant="body1">{account.name}</Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Industry
              </Typography>
              <Typography variant="body1">{account.industry}</Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Website
              </Typography>
              <Typography
                variant="body1"
                component="a"
                href={account.website}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {account.website}
              </Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Phone
              </Typography>
              <Typography variant="body1">{account.phone}</Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Billing Address
              </Typography>
              <Typography variant="body1">{formatAddress(account.billing_address)}</Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Shipping Address
              </Typography>
              <Typography variant="body1">{formatAddress(account.shipping_address)}</Typography>
            </Stack>
          </Grid>

          {account.notes && (
            <Grid size={{ xs: 12 }}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Notes
                </Typography>
                <Typography variant="body1">{account.notes}</Typography>
              </Stack>
            </Grid>
          )}
        </Grid>
      </Stack>
    </Stack>
  );
};

export default OverviewTab;
