'use client';

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const DeleteMarkerDialog = ({ open, annotation, onConfirm, onCancel }) => {
  const title = annotation?.properties?.title || 'this marker';

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{
        sx: {
          bgcolor: '#2a2a2a',
          color: '#fff',
          minWidth: 360,
        },
      }}
    >
      <DialogTitle>Delete Marker?</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Are you sure you want to delete <strong style={{ color: '#fff' }}>{title}</strong>? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteMarkerDialog;
