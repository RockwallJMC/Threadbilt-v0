'use client';

import { useState } from 'react';
import { Box, Chip, CircularProgress, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

const TOOLS = [
  { id: 'select', icon: 'material-symbols:arrow-selector-tool', label: 'Select' },
  { id: 'pin', icon: 'material-symbols:location-on-outline', label: 'Pin' },
  { id: 'freehand', icon: 'material-symbols:draw-outline', label: 'Freehand' },
  { id: 'shape', icon: 'material-symbols:square-outline', label: 'Shape' },
  { id: 'text', icon: 'material-symbols:text-fields', label: 'Text' },
  { id: 'measure', icon: 'material-symbols:straighten', label: 'Measure' },
  { id: 'eraser', icon: 'material-symbols:ink-eraser-outline', label: 'Eraser' },
];

const SHAPE_TYPES = [
  { id: 'rectangle', icon: 'material-symbols:square-outline', label: 'Rectangle' },
  { id: 'circle', icon: 'material-symbols:circle-outline', label: 'Circle' },
  { id: 'arrow', icon: 'material-symbols:north-east', label: 'Arrow' },
];

const SiteBoxToolbar = ({
  drawing,
  activeTool,
  onToolChange,
  onBack,
  zoomLevel,
  onFitToView,
  shapeType,
  onShapeTypeChange,
  isCalibrated,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  saveStatus,
}) => {
  const [shapeMenuAnchor, setShapeMenuAnchor] = useState(null);

  const handleShapeButtonClick = (e) => {
    if (activeTool === 'shape') {
      // If shape is already active, toggle the dropdown
      setShapeMenuAnchor(shapeMenuAnchor ? null : e.currentTarget);
    } else {
      // Activate shape tool and show dropdown
      onToolChange('shape');
      setShapeMenuAnchor(e.currentTarget);
    }
  };

  const handleShapeTypeSelect = (type) => {
    onShapeTypeChange(type);
    setShapeMenuAnchor(null);
  };

  const handleShapeMenuClose = () => {
    setShapeMenuAnchor(null);
  };

  return (
    <Box
      sx={{
        height: 56,
        bgcolor: 'rgba(26,26,26,0.9)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        gap: 2,
        flexShrink: 0,
      }}
    >
      {/* Left section */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
        <IconButton onClick={onBack} sx={{ color: 'white' }} aria-label="back">
          <IconifyIcon icon="material-symbols:arrow-back" />
        </IconButton>
        <Typography
          variant="subtitle1"
          sx={{
            color: 'white',
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {drawing.title}
        </Typography>
        <Chip
          label={drawing.version}
          size="small"
          variant="outlined"
          sx={{
            height: 24,
            borderColor: 'rgba(255,255,255,0.3)',
            color: 'white',
            fontSize: '0.75rem',
          }}
        />
      </Stack>

      {/* Center section - Tools */}
      <Stack direction="row" spacing={0.5} sx={{ flex: 0, flexShrink: 0 }}>
        {TOOLS.map((tool) => {
          if (tool.id === 'measure') {
            return (
              <Box key={tool.id} sx={{ position: 'relative' }}>
                <IconButton
                  onClick={() => onToolChange(tool.id)}
                  aria-label={tool.label}
                  sx={{
                    color: 'white',
                    bgcolor: activeTool === tool.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                    '&:hover': {
                      bgcolor:
                        activeTool === tool.id
                          ? 'rgba(255,255,255,0.2)'
                          : 'rgba(255,255,255,0.08)',
                    },
                  }}
                >
                  <IconifyIcon icon={tool.icon} fontSize={20} />
                </IconButton>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: isCalibrated ? 'success.main' : 'error.main',
                    border: '1px solid rgba(0,0,0,0.5)',
                  }}
                />
              </Box>
            );
          }

          return (
            <IconButton
              key={tool.id}
              onClick={tool.id === 'shape' ? handleShapeButtonClick : () => onToolChange(tool.id)}
              aria-label={tool.label}
              sx={{
                color: 'white',
                bgcolor: activeTool === tool.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                '&:hover': {
                  bgcolor:
                    activeTool === tool.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
                },
              }}
            >
              <IconifyIcon icon={tool.icon} fontSize={20} />
            </IconButton>
          );
        })}
      </Stack>

      {/* Shape Type Menu */}
      <Menu
        anchorEl={shapeMenuAnchor}
        open={Boolean(shapeMenuAnchor)}
        onClose={handleShapeMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{
          '& .MuiPaper-root': {
            bgcolor: 'rgba(26,26,26,0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            mt: 1,
          },
        }}
      >
        {SHAPE_TYPES.map((shape) => (
          <MenuItem
            key={shape.id}
            onClick={() => handleShapeTypeSelect(shape.id)}
            selected={shapeType === shape.id}
            sx={{
              color: 'white',
              gap: 1.5,
              minWidth: 140,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.08)',
              },
              '&.Mui-selected': {
                bgcolor: 'rgba(255,255,255,0.15)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                },
              },
            }}
          >
            <IconifyIcon icon={shape.icon} fontSize={20} />
            <Typography variant="body2">{shape.label}</Typography>
          </MenuItem>
        ))}
      </Menu>

      {/* Right section */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, justifyContent: 'flex-end' }}>
        {/* Undo/Redo buttons */}
        <IconButton
          onClick={onUndo}
          disabled={!canUndo}
          sx={{ color: canUndo ? 'white' : 'rgba(255,255,255,0.3)' }}
          aria-label="undo"
        >
          <IconifyIcon icon="material-symbols:undo" fontSize={20} />
        </IconButton>
        <IconButton
          onClick={onRedo}
          disabled={!canRedo}
          sx={{ color: canRedo ? 'white' : 'rgba(255,255,255,0.3)' }}
          aria-label="redo"
        >
          <IconifyIcon icon="material-symbols:redo" fontSize={20} />
        </IconButton>

        {/* Save status indicator */}
        <Stack direction="row" spacing={0.5} alignItems="center">
          {saveStatus === 'saving' ? (
            <CircularProgress size={14} sx={{ color: 'rgba(255,255,255,0.5)' }} />
          ) : (
            <IconifyIcon icon="material-symbols:cloud-done-outline" sx={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }} />
          )}
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
            {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
          </Typography>
        </Stack>

        {/* Zoom level */}
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', minWidth: 50, textAlign: 'right' }}>
          {Math.round(zoomLevel)}%
        </Typography>
        <IconButton onClick={onFitToView} sx={{ color: 'white' }} aria-label="fit to view">
          <IconifyIcon icon="material-symbols:fit-screen-outline" fontSize={20} />
        </IconButton>
      </Stack>
    </Box>
  );
};

export default SiteBoxToolbar;
