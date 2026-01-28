'use client';

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  dialogClasses,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useUnlinkContactFromAccount } from 'services/swr/api-hooks/useContactApi';
import IconifyIcon from 'components/base/IconifyIcon';

const UnlinkAccountDialog = ({ open, onClose, contactId, contactName, accountName }) => {
  const { trigger: unlinkContact, isMutating } = useUnlinkContactFromAccount();

  const handleUnlink = async () => {
    try {
      await unlinkContact({ contactId });

      enqueueSnackbar('Contact unlinked successfully', {
        variant: 'success',
      });

      onClose();
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to unlink contact', {
        variant: 'error',
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="unlink-account-dialog-title"
      sx={{
        [`& .${dialogClasses.paper}`]: {
          p: 0,
          borderRadius: 6,
          width: 1,
          maxWidth: 400,
        },
      }}
    >
      <Stack
        sx={{
          p: 3,
          pb: 2,
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <DialogTitle id="unlink-account-dialog-title" sx={{ p: 0, typography: 'h6' }}>
          Unlink Contact from Account?
        </DialogTitle>
        <Button shape="square" variant="text" size="small" color="neutral" onClick={onClose}>
          <IconifyIcon
            icon="material-symbols:close-rounded"
            sx={{ color: 'text.primary', fontSize: 20 }}
          />
        </Button>
      </Stack>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconifyIcon
              icon="material-symbols:warning-rounded"
              sx={{ color: 'warning.main', fontSize: 24 }}
            />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Warning
            </Typography>
          </Stack>

          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            Are you sure you want to unlink <strong>{contactName}</strong> from{' '}
            <strong>{accountName}</strong>? This action cannot be undone.
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          pt: 2,
          position: 'sticky',
          bottom: 0,
          zIndex: 1000,
        }}
      >
        <Button variant="soft" color="neutral" onClick={onClose} disabled={isMutating}>
          Cancel
        </Button>
        <Button
          variant="soft"
          color="error"
          onClick={handleUnlink}
          autoFocus
          disabled={isMutating}
        >
          {isMutating ? 'Unlinking...' : 'Unlink'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnlinkAccountDialog;
