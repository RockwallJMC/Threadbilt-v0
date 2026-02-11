'use client';

import { Box, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';

const COLORS = [
  { value: '#FF5252', label: 'Red' },
  { value: '#FF9800', label: 'Orange' },
  { value: '#FFEB3B', label: 'Yellow' },
  { value: '#4CAF50', label: 'Green' },
  { value: '#2196F3', label: 'Blue' },
  { value: '#FFFFFF', label: 'White' },
];

const StrokeOptions = ({ open, color, strokeWidth, onColorChange, onStrokeWidthChange }) => {
  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 56 + 8, // Toolbar height + gap
        left: '50%',
        transform: 'translateX(-50%)',
        height: 40,
        bgcolor: 'rgba(26,26,26,0.9)',
        backdropFilter: 'blur(8px)',
        borderRadius: 2,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        zIndex: 10,
      }}
    >
      {/* Color selection */}
      <Stack direction="row" spacing={1} alignItems="center">
        {COLORS.map((colorOption) => (
          <Box
            key={colorOption.value}
            onClick={() => onColorChange(colorOption.value)}
            aria-label={`Color ${colorOption.label}`}
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: colorOption.value,
              cursor: 'pointer',
              border: color === colorOption.value
                ? '3px solid rgba(255,255,255,0.8)'
                : '2px solid rgba(255,255,255,0.3)',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'scale(1.15)',
                border: color === colorOption.value
                  ? '3px solid rgba(255,255,255,1)'
                  : '2px solid rgba(255,255,255,0.5)',
              },
            }}
          />
        ))}
      </Stack>

      {/* Separator */}
      <Box
        sx={{
          width: 1,
          height: 20,
          bgcolor: 'rgba(255,255,255,0.2)',
        }}
      />

      {/* Width selection */}
      <ToggleButtonGroup
        value={strokeWidth}
        exclusive
        onChange={(e, value) => {
          if (value !== null) {
            onStrokeWidthChange(value);
          }
        }}
        size="small"
        aria-label="stroke width"
        sx={{
          gap: 0.5,
          '& .MuiToggleButton-root': {
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.7)',
            minWidth: 32,
            height: 28,
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.08)',
              borderColor: 'rgba(255,255,255,0.3)',
            },
            '&.Mui-selected': {
              bgcolor: 'rgba(255,255,255,0.15)',
              color: 'white',
              borderColor: 'rgba(255,255,255,0.4)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
              },
            },
          },
        }}
      >
        <ToggleButton value="thin" aria-label="thin stroke">
          <Box
            sx={{
              width: 16,
              height: 2,
              bgcolor: 'currentColor',
              borderRadius: 1,
            }}
          />
        </ToggleButton>
        <ToggleButton value="medium" aria-label="medium stroke">
          <Box
            sx={{
              width: 16,
              height: 4,
              bgcolor: 'currentColor',
              borderRadius: 1,
            }}
          />
        </ToggleButton>
        <ToggleButton value="thick" aria-label="thick stroke">
          <Box
            sx={{
              width: 16,
              height: 6,
              bgcolor: 'currentColor',
              borderRadius: 1,
            }}
          />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default StrokeOptions;
