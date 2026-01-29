'use client';

import { Box, Paper, Typography, Link, Stack, Divider } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/navigation';
import paths from 'routes/paths';

/**
 * InfoCard - Reusable card component for proposal information sections
 */
const InfoCard = ({ title: cardTitle, children, ...props }) => (
  <Paper background={1} sx={{ p: 2, height: '100%', ...props.sx }}>
    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
      {cardTitle}
    </Typography>
    {children}
  </Paper>
);

/**
 * ProposalOverview Component
 *
 * Grid layout displaying proposal overview information in cards.
 *
 * @param {Object} props
 * @param {Object} props.proposal - Proposal object with all related data
 */
const ProposalOverview = ({ proposal }) => {
  const router = useRouter();

  if (!proposal) return null;

  const {
    title,
    description,
    opportunity,
    account,
    created_at,
    valid_until,
    sent_at,
    accepted_at,
    rejected_at,
    subtotal,
    tax_rate,
    tax_amount,
    total_amount,
    terms_and_conditions,
  } = proposal;

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Grid container spacing={3}>
      {/* Title and Description */}
      <Grid size={12}>
        <InfoCard title="Proposal Information">
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </InfoCard>
      </Grid>

      {/* Opportunity Link */}
      {opportunity && (
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoCard title="Opportunity">
            <Link
              href={paths.opportunityDetail(opportunity.id)}
              variant="body1"
              sx={{ fontWeight: 500, cursor: 'pointer' }}
              onClick={(e) => {
                e.preventDefault();
                router.push(paths.opportunityDetail(opportunity.id));
              }}
            >
              {opportunity.name}
            </Link>
            {opportunity.stage && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                Stage: {opportunity.stage.replace(/_/g, ' ')}
              </Typography>
            )}
          </InfoCard>
        </Grid>
      )}

      {/* Account Info */}
      {account && (
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoCard title="Client">
            <Link
              href={paths.crmAccountDetail(account.id)}
              variant="body1"
              sx={{ fontWeight: 500, cursor: 'pointer' }}
              onClick={(e) => {
                e.preventDefault();
                router.push(paths.crmAccountDetail(account.id));
              }}
            >
              {account.name}
            </Link>
            {account.billing_address && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {account.billing_address}
                {account.billing_city && `, ${account.billing_city}`}
                {account.billing_state && `, ${account.billing_state}`}
                {account.billing_zip && ` ${account.billing_zip}`}
              </Typography>
            )}
          </InfoCard>
        </Grid>
      )}

      {/* Dates */}
      <Grid size={{ xs: 12, md: 6 }}>
        <InfoCard title="Important Dates">
          <Stack spacing={1}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body2">{formatDate(created_at)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Valid Until
              </Typography>
              <Typography variant="body2">{formatDate(valid_until)}</Typography>
            </Box>
            {sent_at && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Sent
                </Typography>
                <Typography variant="body2">{formatDate(sent_at)}</Typography>
              </Box>
            )}
            {accepted_at && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Accepted
                </Typography>
                <Typography variant="body2">{formatDate(accepted_at)}</Typography>
              </Box>
            )}
            {rejected_at && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Rejected
                </Typography>
                <Typography variant="body2">{formatDate(rejected_at)}</Typography>
              </Box>
            )}
          </Stack>
        </InfoCard>
      </Grid>

      {/* Financial Summary */}
      <Grid size={{ xs: 12, md: 6 }}>
        <InfoCard title="Financial Summary">
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Subtotal
              </Typography>
              <Typography variant="body2">{formatCurrency(subtotal)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Tax ({tax_rate}%)
              </Typography>
              <Typography variant="body2">{formatCurrency(tax_amount)}</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Total
              </Typography>
              <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                {formatCurrency(total_amount)}
              </Typography>
            </Box>
          </Stack>
        </InfoCard>
      </Grid>

      {/* Terms */}
      {terms_and_conditions && (
        <Grid size={12}>
          <InfoCard title="Terms & Conditions">
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              }}
            >
              {terms_and_conditions}
            </Typography>
          </InfoCard>
        </Grid>
      )}
    </Grid>
  );
};

export default ProposalOverview;
