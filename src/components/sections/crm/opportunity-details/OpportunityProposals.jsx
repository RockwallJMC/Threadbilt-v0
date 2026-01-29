'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  Grid,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import IconifyIcon from 'components/base/IconifyIcon';
import { useProposals } from 'services/swr/api-hooks/useProposalApi';
import { STATUS_COLORS } from 'constants/crm/proposalDefaults';
import paths from 'routes/paths';
import CreateProposalDialog from '../proposals/CreateProposalDialog';

/**
 * OpportunityProposals Component
 *
 * Tab panel displaying proposals linked to an opportunity.
 * Shows card view with status, amounts, and dates.
 *
 * @param {Object} props
 * @param {string} props.opportunityId - Opportunity ID to filter proposals
 * @param {Object} props.opportunity - Opportunity object for creating new proposals
 */
const OpportunityProposals = ({ opportunityId, opportunity }) => {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: proposals, error, isLoading } = useProposals(
    opportunityId ? { opportunity_id: opportunityId } : {},
  );

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCardClick = (proposalId) => {
    router.push(paths.crmProposalDetail(proposalId));
  };

  const handleCreateProposal = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleProposalSuccess = () => {
    // Dialog will close automatically, SWR will revalidate
    setDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Loading proposals...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="error">
          Error loading proposals: {error.message}
        </Typography>
      </Box>
    );
  }

  if (!proposals || proposals.length === 0) {
    return (
      <>
        <Box
          sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 2,
          }}
        >
          <IconifyIcon
            icon="material-symbols:description-outline-rounded"
            sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            No proposals yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first proposal for this opportunity
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateProposal}
            startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
          >
            Create Proposal
          </Button>
        </Box>

        <CreateProposalDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          opportunity={opportunity}
          onSuccess={handleProposalSuccess}
        />
      </>
    );
  }

  return (
    <>
      <Stack spacing={2}>
        {/* Header with Create Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Proposals ({proposals.length})
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleCreateProposal}
            startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
          >
            Create Proposal
          </Button>
        </Box>

        {/* Proposals Grid */}
        <Grid container spacing={2}>
          {proposals.map((proposal) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={proposal.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => handleCardClick(proposal.id)}
              >
                <CardContent>
                  <Stack spacing={1.5}>
                    {/* Proposal Number and Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {proposal.proposal_number}
                      </Typography>
                      <Chip
                        label={proposal.status}
                        color={STATUS_COLORS[proposal.status] || 'default'}
                        size="small"
                        variant="soft"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Box>

                    {/* Title */}
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {proposal.title}
                    </Typography>

                    {/* Total Amount */}
                    <Typography variant="h6" color="primary.main">
                      {formatCurrency(proposal.total_amount)}
                    </Typography>

                    {/* Valid Until */}
                    <Typography variant="caption" color="text.secondary">
                      Valid until: {formatDate(proposal.valid_until)}
                    </Typography>

                    {/* Created Date */}
                    <Typography variant="caption" color="text.secondary">
                      Created: {formatDate(proposal.created_at)}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>

      <CreateProposalDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        opportunity={opportunity}
        onSuccess={handleProposalSuccess}
      />
    </>
  );
};

export default OpportunityProposals;
