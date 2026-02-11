'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Popover, Stack, TextField, Typography } from '@mui/material';

const PRESET_COLORS = ['#FF5252', '#FF9800', '#FFEB3B', '#4CAF50', '#2196F3', '#9C27B0'];

const PinPopover = ({ open, anchorPosition, annotation, onSave, onDelete, onClose }) => {
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FF5252');

  // Initialize form when annotation changes or popover opens
  useEffect(() => {
    if (open) {
      if (annotation) {
        setTitle(annotation.properties?.title || '');
        setSelectedColor(annotation.properties?.color || '#FF5252');
      } else {
        setTitle('');
        setSelectedColor('#FF5252');
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
    <Popover
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition ? { top: anchorPosition.y, left: anchorPosition.x } : undefined}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      sx={{
        '& .MuiPaper-root': {
          bgcolor: '#2a2a2a',
          color: 'white',
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        },
      }}
    >
      <Box sx={{ width: 320, p: 2 }}>
        <Stack spacing={2}>
          {/* Title */}
          <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
            {annotation ? 'Edit Pin' : 'Add Pin'}
          </Typography>

          {/* Title Input */}
          <TextField
            fullWidth
            size="small"
            label="Pin Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            variant="filled"
            sx={{
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
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, display: 'block' }}>
              Color
            </Typography>
            <Stack direction="row" spacing={1}>
              {PRESET_COLORS.map((color) => (
                <Box
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: color,
                    cursor: 'pointer',
                    border: selectedColor === color ? '3px solid white' : '2px solid rgba(255,255,255,0.3)',
                    boxShadow: selectedColor === color ? '0 0 0 2px rgba(255,255,255,0.2)' : 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      border: '3px solid rgba(255,255,255,0.7)',
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {annotation && (
              <Button
                size="small"
                onClick={onDelete}
                sx={{
                  color: '#f44336',
                  '&:hover': { bgcolor: 'rgba(244,67,54,0.1)' },
                }}
              >
                Delete
              </Button>
            )}
            <Button size="small" onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Cancel
            </Button>
            <Button
              size="small"
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
          </Stack>
        </Stack>
      </Box>
    </Popover>
  );
};

export default PinPopover;
