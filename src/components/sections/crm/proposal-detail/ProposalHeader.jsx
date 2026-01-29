'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { pdf } from '@react-pdf/renderer';
import IconifyIcon from 'components/base/IconifyIcon';
import { STATUS_COLORS } from 'constants/crm/proposalDefaults';
import { useUpdateProposalStatus } from 'services/swr/api-hooks/useProposalApi';
import ProposalPDF from './ProposalPDF';

/**
 * ProposalHeader Component
 *
 * Header with proposal number, status chip, and status-conditional action buttons.
 *
 * @param {Object} props
 * @param {Object} props.proposal - Proposal object with status, proposal_number, etc.
 * @param {Function} props.onEdit - Edit handler (for draft status)
 * @param {Function} props.onDelete - Delete handler (for draft status)
 * @param {Function} props.onRevise - Revise handler (for sent/expired status)
 */
const ProposalHeader = ({ proposal, onEdit, onDelete, onRevise }) => {
  const { trigger: updateStatus, isMutating } = useUpdateProposalStatus();
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  if (!proposal) return null;

  const { status, proposal_number } = proposal;

  /**
   * Generate and download PDF
   */
  const handleDownloadPDF = async () => {
    setPdfGenerating(true);
    try {
      const blob = await pdf(<ProposalPDF proposal={proposal} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${proposal_number}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setPdfGenerating(false);
    }
  };

  /**
   * Preview PDF in new tab
   */
  const handlePreviewPDF = async () => {
    setPdfGenerating(true);
    try {
      const blob = await pdf(<ProposalPDF proposal={proposal} />).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setPdfGenerating(false);
    }
  };

  /**
   * Update proposal status with confirmation
   */
  const handleStatusChange = async (newStatus) => {
    try {
      await updateStatus({ id: proposal.id, status: newStatus });
      setConfirmDialogOpen(false);
      setConfirmAction(null);
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  /**
   * Open confirmation dialog
   */
  const openConfirmDialog = (action, actionFn) => {
    setConfirmAction({ action, fn: actionFn });
    setConfirmDialogOpen(true);
  };

  /**
   * Render action buttons based on status
   */
  const renderActions = () => {
    const isDraft = status === 'draft';
    const isSent = status === 'sent';
    const isAccepted = status === 'accepted';
    const isRejected = status === 'rejected';
    const isExpired = status === 'expired';

    return (
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        {/* Draft Actions */}
        {isDraft && (
          <>
            <Button
              variant="outlined"
              color="neutral"
              size="small"
              onClick={onEdit}
              startIcon={<IconifyIcon icon="material-symbols:edit-outline-rounded" />}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => openConfirmDialog('send', () => handleStatusChange('sent'))}
              disabled={isMutating}
              startIcon={<IconifyIcon icon="material-symbols:send-rounded" />}
            >
              Send Proposal
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => openConfirmDialog('delete', onDelete)}
              startIcon={<IconifyIcon icon="material-symbols:delete-outline-rounded" />}
            >
              Delete
            </Button>
          </>
        )}

        {/* Sent Actions */}
        {isSent && (
          <>
            <Button
              variant="outlined"
              color="neutral"
              size="small"
              onClick={handlePreviewPDF}
              disabled={pdfGenerating}
              startIcon={<IconifyIcon icon="material-symbols:preview-rounded" />}
            >
              Preview PDF
            </Button>
            <Button
              variant="outlined"
              color="neutral"
              size="small"
              onClick={handleDownloadPDF}
              disabled={pdfGenerating}
              startIcon={<IconifyIcon icon="material-symbols:download-rounded" />}
            >
              Download PDF
            </Button>
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() => openConfirmDialog('accept', () => handleStatusChange('accepted'))}
              disabled={isMutating}
              startIcon={<IconifyIcon icon="material-symbols:check-circle-outline-rounded" />}
            >
              Mark Accepted
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => openConfirmDialog('reject', () => handleStatusChange('rejected'))}
              disabled={isMutating}
              startIcon={<IconifyIcon icon="material-symbols:cancel-outline-rounded" />}
            >
              Mark Rejected
            </Button>
            <Button
              variant="outlined"
              color="neutral"
              size="small"
              onClick={onRevise}
              startIcon={<IconifyIcon icon="material-symbols:edit-document-rounded" />}
            >
              Revise
            </Button>
          </>
        )}

        {/* Accepted/Rejected Actions */}
        {(isAccepted || isRejected) && (
          <>
            <Button
              variant="outlined"
              color="neutral"
              size="small"
              onClick={handleDownloadPDF}
              disabled={pdfGenerating}
              startIcon={<IconifyIcon icon="material-symbols:download-rounded" />}
            >
              Download PDF
            </Button>
          </>
        )}

        {/* Expired Actions */}
        {isExpired && (
          <>
            <Button
              variant="outlined"
              color="neutral"
              size="small"
              onClick={onRevise}
              startIcon={<IconifyIcon icon="material-symbols:edit-document-rounded" />}
            >
              Revise
            </Button>
            <Button
              variant="outlined"
              color="neutral"
              size="small"
              onClick={handleDownloadPDF}
              disabled={pdfGenerating}
              startIcon={<IconifyIcon icon="material-symbols:download-rounded" />}
            >
              Download PDF
            </Button>
          </>
        )}
      </Stack>
    );
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Stack spacing={1}>
          <Typography variant="h4" component="h1">
            {proposal_number}
          </Typography>
          <Chip
            label={status}
            color={STATUS_COLORS[status] || 'default'}
            variant="soft"
            sx={{ textTransform: 'capitalize', width: 'fit-content' }}
          />
        </Stack>

        {renderActions()}
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>
          Confirm {confirmAction?.action}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmAction?.action === 'send' &&
              'Are you sure you want to send this proposal? The status will be changed to "Sent".'}
            {confirmAction?.action === 'accept' &&
              'Are you sure you want to mark this proposal as accepted?'}
            {confirmAction?.action === 'reject' &&
              'Are you sure you want to mark this proposal as rejected?'}
            {confirmAction?.action === 'delete' &&
              'Are you sure you want to delete this proposal? This action cannot be undone.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => confirmAction?.fn()}
            color={confirmAction?.action === 'delete' || confirmAction?.action === 'reject' ? 'error' : 'primary'}
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProposalHeader;
