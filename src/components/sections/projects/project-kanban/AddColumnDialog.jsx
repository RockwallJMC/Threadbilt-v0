'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useProjectKanbanContext } from './ProjectKanbanContext';

const colorOptions = [
  '#3498db', // Blue
  '#27ae60', // Green
  '#f39c12', // Orange
  '#9b59b6', // Purple
  '#e74c3c', // Red
  '#1abc9c', // Teal
  '#34495e', // Dark gray
  '#f1c40f', // Yellow
];

const AddColumnDialog = () => {
  const {
    addColumnDialogOpen,
    closeAddColumnDialog,
    handleAddColumn,
  } = useProjectKanbanContext();

  const [name, setName] = useState('');
  const [color, setColor] = useState(colorOptions[0]);
  const [cardLimit, setCardLimit] = useState(20);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setName('');
    setColor(colorOptions[0]);
    setCardLimit(20);
    closeAddColumnDialog();
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      await handleAddColumn({
        name: name.trim(),
        color,
        cardLimit,
      });
      handleClose();
    } catch (error) {
      console.error('Failed to create column:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={addColumnDialogOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Add New Column</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Name */}
          <TextField
            label="Column Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            autoFocus
            placeholder="e.g., To Do, In Progress, Done"
          />

          {/* Color Selection */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Column Color
            </Typography>
            <ToggleButtonGroup
              value={color}
              exclusive
              onChange={(_, newColor) => newColor && setColor(newColor)}
              sx={{ flexWrap: 'wrap', gap: 0.5 }}
            >
              {colorOptions.map((c) => (
                <ToggleButton
                  key={c}
                  value={c}
                  sx={{
                    width: 40,
                    height: 40,
                    p: 0,
                    bgcolor: c,
                    border: '2px solid',
                    borderColor: color === c ? 'primary.main' : 'transparent',
                    '&:hover': {
                      bgcolor: c,
                      opacity: 0.8,
                    },
                    '&.Mui-selected': {
                      bgcolor: c,
                      '&:hover': {
                        bgcolor: c,
                      },
                    },
                  }}
                />
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* Card Limit */}
          <TextField
            label="Card Limit"
            type="number"
            value={cardLimit}
            onChange={(e) => setCardLimit(parseInt(e.target.value) || 0)}
            fullWidth
            helperText="Maximum number of tasks allowed in this column (0 for unlimited)"
            inputProps={{ min: 0, max: 100 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!name.trim() || loading}
        >
          {loading ? 'Creating...' : 'Create Column'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddColumnDialog;
