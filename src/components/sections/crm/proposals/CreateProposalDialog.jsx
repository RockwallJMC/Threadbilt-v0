'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  Button,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import ProposalForm from './ProposalForm';

/**
 * CreateProposalDialog Component
 *
 * Full-screen dialog for creating a new proposal from an opportunity.
 * Includes unsaved changes confirmation on close.
 *
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.opportunity - Opportunity object to pre-fill proposal
 * @param {Function} props.onSuccess - Success callback after proposal creation
 */
const CreateProposalDialog = ({ open, onClose, opportunity, onSuccess }) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setConfirmCloseOpen(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setConfirmCloseOpen(false);
    setHasUnsavedChanges(false);
    onClose();
  };

  const handleCancelClose = () => {
    setConfirmCloseOpen(false);
  };

  const handleFormChange = (hasChanges) => {
    setHasUnsavedChanges(hasChanges);
  };

  const handleFormSuccess = (proposal) => {
    setHasUnsavedChanges(false);
    if (onSuccess) {
      onSuccess(proposal);
    }
    onClose();
  };

  return (
    <>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: 'background.default',
          },
        }}
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="h5" component="div">
              Create Proposal
            </Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <IconifyIcon icon="material-symbols:close-rounded" sx={{ fontSize: 24 }} />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <ProposalForm
            opportunity={opportunity}
            onChange={handleFormChange}
            onSuccess={handleFormSuccess}
            onCancel={handleClose}
          />
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Confirmation Dialog */}
      <Dialog
        open={confirmCloseOpen}
        onClose={handleCancelClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved changes. Are you sure you want to close this dialog? Your changes will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose}>Continue Editing</Button>
          <Button onClick={handleConfirmClose} color="error" variant="contained">
            Discard Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateProposalDialog;
