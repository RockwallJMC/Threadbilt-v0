'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

const CalibrationDialog = ({ open, calibrationPoints, onSave, onClose, onReset }) => {
  const [distance, setDistance] = useState('');
  const [unit, setUnit] = useState('feet');

  const { pointA, pointB } = calibrationPoints || {};
  const bothPointsSet = pointA && pointB;

  const handleSave = () => {
    const distanceNum = parseFloat(distance);
    if (distanceNum > 0) {
      onSave({ distance: distanceNum, unit });
      setDistance('');
      setUnit('feet');
    }
  };

  const handleReset = () => {
    setDistance('');
    onReset();
  };

  const handleClose = () => {
    setDistance('');
    setUnit('feet');
    onClose();
  };

  // Step indicator text
  let stepText = '';
  if (!pointA) {
    stepText = 'Click the first point on the drawing';
  } else if (!pointB) {
    stepText = 'Click the second point on the drawing';
  } else {
    stepText = 'Enter the distance between the two points';
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#2a2a2a',
          color: 'white',
          maxWidth: 400,
        },
      }}
    >
      <DialogTitle>Calibrate Scale</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              mb: 3,
              textAlign: 'center',
            }}
          >
            {stepText}
          </Typography>

          {bothPointsSet && (
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  autoFocus
                  type="number"
                  label="Distance between points"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  inputProps={{ min: 0, step: 0.1 }}
                  sx={{
                    '& .MuiInputBase-root': {
                      color: 'white',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.7)',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                  }}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  select
                  label="Unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  sx={{
                    '& .MuiInputBase-root': {
                      color: 'white',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.7)',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                  }}
                >
                  <MenuItem value="feet">Feet</MenuItem>
                  <MenuItem value="inches">Inches</MenuItem>
                  <MenuItem value="meters">Meters</MenuItem>
                  <MenuItem value="centimeters">Centimeters</MenuItem>
                </TextField>
              </Grid>

              <Grid size={12}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSave}
                  disabled={!distance || parseFloat(distance) <= 0}
                  sx={{ mb: 1 }}
                >
                  Calibrate
                </Button>
                <Button
                  fullWidth
                  variant="text"
                  onClick={handleReset}
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  Reset Points
                </Button>
              </Grid>
            </Grid>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalibrationDialog;
