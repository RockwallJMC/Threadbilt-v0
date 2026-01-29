'use client';

import { Box, Stack, Typography, CircularProgress, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useProposal } from 'services/swr/api-hooks/useProposalApi';
import paths from 'routes/paths';
import ProposalHeader from './ProposalHeader';
import ProposalOverview from './ProposalOverview';
import ProposalLineItemsDisplay from './ProposalLineItemsDisplay';

/**
 * ProposalDetail Component
 *
 * Main container for proposal detail view.
 * Fetches proposal data and renders all sub-components.
 *
 * @param {Object} props
 * @param {string} props.proposalId - Proposal ID to load
 */
const ProposalDetail = ({ proposalId }) => {
  const router = useRouter();
  const { data: proposal, error, isLoading } = useProposal(proposalId);

  const handleEdit = () => {
    // TODO: Navigate to edit page or open edit dialog
    console.log('Edit proposal:', proposalId);
  };

  const handleDelete = () => {
    // TODO: Implement delete with confirmation
    console.log('Delete proposal:', proposalId);
    // After successful delete, navigate back to proposals list
    // router.push(paths.crmProposals);
  };

  const handleRevise = () => {
    // TODO: Create new draft proposal based on this one
    console.log('Revise proposal:', proposalId);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Error loading proposal</Typography>
          <Typography variant="body2">{error.message}</Typography>
        </Alert>
      </Box>
    );
  }

  if (!proposal) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          <Typography variant="body1">Proposal not found</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with Actions */}
      <ProposalHeader
        proposal={proposal}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRevise={handleRevise}
      />

      <Stack spacing={4}>
        {/* Overview Section */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Overview
          </Typography>
          <ProposalOverview proposal={proposal} />
        </Box>

        {/* Line Items Section */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Line Items
          </Typography>
          <ProposalLineItemsDisplay lineItems={proposal.line_items || []} />
        </Box>
      </Stack>
    </Box>
  );
};

export default ProposalDetail;
