'use client';

import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

const ProjectColumnDragOverlay = ({ column }) => {
  if (!column) return null;

  return (
    <Paper
      sx={{
        width: 300,
        bgcolor: 'background.elevation1',
        borderRadius: 2,
        p: 2,
        cursor: 'grabbing',
        transform: 'rotate(3deg)',
        boxShadow: 8,
        opacity: 0.95,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: column.color || 'primary.main',
            flexShrink: 0,
          }}
        />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
          {column.name}
        </Typography>
        <Chip size="small" label="..." sx={{ height: 20, minWidth: 24 }} />
      </Stack>
    </Paper>
  );
};

export default ProjectColumnDragOverlay;
