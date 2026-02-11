'use client';

import { Box, Popover, Stack, Typography } from '@mui/material';

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
      anchorPosition={anchorPosition ? { top: anchorPosition.y - 10, left: anchorPosition.x } : undefined}
      transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      PaperProps={{
        sx: {
          bgcolor: '#2a2a2a',
          color: '#fff',
          p: 2,
          minWidth: 200,
          maxWidth: 280,
          borderRadius: 2,
        },
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
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
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {title}
          </Typography>
        </Stack>
        <Stack spacing={0.5}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            Coordinates
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)' }}>
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </Typography>
        </Stack>
        {annotation.created_at && (
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', mt: 0.5 }}>
            Created {new Date(annotation.created_at).toLocaleDateString()}
          </Typography>
        )}
      </Stack>
    </Popover>
  );
};

export default MarkerInfoPopover;
