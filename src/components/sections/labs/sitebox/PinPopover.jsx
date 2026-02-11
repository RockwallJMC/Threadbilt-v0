'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

const PRESET_COLORS = [
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
];

const PinPopover = ({ open, anchorPosition, annotation, onSave, onDelete, onClose }) => {
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState('#EF4444');

  // Initialize form when annotation changes or dialog opens
  useEffect(() => {
    if (open) {
      if (annotation) {
        setTitle(annotation.properties?.title || '');
        setSelectedColor(annotation.properties?.color || '#EF4444');
      } else {
        setTitle('');
        setSelectedColor('#EF4444');
      }
    }
  }, [open, annotation]);

  const handleSave = () => {
    onSave({ title, color: selectedColor });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#2a2a2a',
          color: 'white',
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        },
      }}
    >
      <DialogTitle sx={{ color: 'rgba(255,255,255,0.9)' }}>
        {annotation ? 'Edit Pin' : 'Add Pin'}
      </DialogTitle>

      <DialogContent>
        {/* Title Input */}
        <TextField
          fullWidth
          required
          label="Pin Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          variant="filled"
          sx={{
            mt: 1,
            '& .MuiFilledInput-root': {
              bgcolor: 'rgba(255,255,255,0.05)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
              '&.Mui-focused': { bgcolor: 'rgba(255,255,255,0.1)' },
              '&::before, &::after': { display: 'none' },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255,255,255,0.7)',
              '&.Mui-focused': { color: 'rgba(255,255,255,0.9)' },
            },
            '& .MuiInputBase-input': { color: 'white' },
          }}
        />

        {/* Color Picker */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1.5 }}>
            Color
          </Typography>
          <Stack direction="row" spacing={1.5}>
            {PRESET_COLORS.map((color) => (
              <Box
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: color.value,
                  cursor: 'pointer',
                  border: selectedColor === color.value ? '2px solid white' : '2px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  position: 'relative',
                  '&:hover': {
                    transform: 'scale(1.15)',
                    border: '2px solid rgba(255,255,255,0.7)',
                  },
                }}
              >
                {selectedColor === color.value && (
                  <IconifyIcon
                    icon="material-symbols:check"
                    sx={{
                      fontSize: 20,
                      color: 'white',
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
                    }}
                  />
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {annotation && (
          <Button
            onClick={onDelete}
            sx={{
              mr: 'auto',
              color: '#ef4444',
              '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' },
            }}
          >
            Delete
          </Button>
        )}
        <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!title.trim()}
          sx={{
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PinPopover;
