'use client';

import { Box, Popover, Typography } from '@mui/material';

const MarkerInfoPopover = ({ open, anchorPosition, annotation, onClose }) => {
  if (!annotation) return null;

  const title = annotation.properties?.title || 'Untitled Pin';
  const color = annotation.properties?.color || '#FF5252';
  const [lng, lat] = annotation.geometry?.coordinates || [0, 0];

  return (
    <Popover
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={
        anchorPosition
          ? { top: anchorPosition.y - 10, left: anchorPosition.x }
          : undefined
      }
      transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#2a2a2a',
            color: '#fff',
            borderRadius: 2,
            minWidth: 220,
            maxWidth: 300,
            overflow: 'hidden',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 2 }}>
        {/* Title row with color dot */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              bgcolor: color,
              border: '2px solid rgba(255,255,255,0.3)',
              flexShrink: 0,
            }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
            {title}
          </Typography>
        </Box>

        {/* Coordinates */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            Coordinates
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)' }}
          >
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </Typography>
        </Box>

        {/* Created date */}
        {annotation.created_at && (
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
            Created {new Date(annotation.created_at).toLocaleDateString()}
          </Typography>
        )}
      </Box>
    </Popover>
  );
};

export default MarkerInfoPopover;
