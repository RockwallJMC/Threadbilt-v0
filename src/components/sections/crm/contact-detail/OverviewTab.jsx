'use client';

import { Paper, Stack, Typography, Link as MuiLink, Alert } from '@mui/material';
import Grid from '@mui/material/Grid';
import accounts from 'data/crm/accounts';

const OverviewTab = ({ contact }) => {
  // Find linked account if exists
  const linkedAccount = contact.account_id
    ? accounts.find((acc) => acc.id === contact.account_id)
    : null;

  return (
    <Stack spacing={3}>
      {/* Personal Information Section */}
      <Paper background={1} sx={{ p: { xs: 3, md: 5 } }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Personal Information
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Full Name
              </Typography>
              <Typography variant="body2">
                {contact.first_name} {contact.last_name}
              </Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Email
              </Typography>
              {contact.email ? (
                <MuiLink href={`mailto:${contact.email}`} variant="body2">
                  {contact.email}
                </MuiLink>
              ) : (
                <Typography variant="body2" color="text.disabled">
                  N/A
                </Typography>
              )}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Phone
              </Typography>
              <Typography variant="body2">{contact.phone || 'N/A'}</Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Title
              </Typography>
              <Typography variant="body2">{contact.title || 'N/A'}</Typography>
            </Stack>
          </Grid>

          {contact.linkedin_url && (
            <Grid size={{ xs: 12 }}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  LinkedIn Profile
                </Typography>
                <MuiLink
                  href={contact.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                >
                  {contact.linkedin_url}
                </MuiLink>
              </Stack>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Account Information Section */}
      <Paper background={1} sx={{ p: { xs: 3, md: 5 } }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Account Information
        </Typography>
        {linkedAccount ? (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Account Name
                </Typography>
                <Typography variant="body2">{linkedAccount.name}</Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Industry
                </Typography>
                <Typography variant="body2">{linkedAccount.industry || 'N/A'}</Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Role
                </Typography>
                <Typography variant="body2">{contact.role || 'N/A'}</Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Website
                </Typography>
                {linkedAccount.website ? (
                  <MuiLink
                    href={linkedAccount.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                  >
                    {linkedAccount.website}
                  </MuiLink>
                ) : (
                  <Typography variant="body2" color="text.disabled">
                    N/A
                  </Typography>
                )}
              </Stack>
            </Grid>

            {linkedAccount.phone && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Account Phone
                  </Typography>
                  <Typography variant="body2">{linkedAccount.phone}</Typography>
                </Stack>
              </Grid>
            )}
          </Grid>
        ) : (
          <Alert severity="info">Independent Contact</Alert>
        )}
      </Paper>
    </Stack>
  );
};

export default OverviewTab;
