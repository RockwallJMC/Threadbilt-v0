'use client';

import { Box, Paper, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useProjectKanbanContext } from './ProjectKanbanContext';

const AddNewColumn = () => {
  const { openAddColumnDialog } = useProjectKanbanContext();

  return (
    <Paper
      onClick={openAddColumnDialog}
      sx={{
        minWidth: 300,
        maxWidth: 300,
        bgcolor: 'background.elevation1',
        borderRadius: 2,
        p: 2,
        height: 'fit-content',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 150,
        cursor: 'pointer',
        border: '2px dashed',
        borderColor: 'divider',
        transition: 'all 0.2s',
        flexShrink: 0,
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'action.hover',
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1,
        }}
      >
        <IconifyIcon icon="material-symbols:add" sx={{ fontSize: 24, color: 'text.secondary' }} />
      </Box>
      <Typography variant="body2" color="text.secondary">
        Add Column
      </Typography>
    </Paper>
  );
};

export default AddNewColumn;
