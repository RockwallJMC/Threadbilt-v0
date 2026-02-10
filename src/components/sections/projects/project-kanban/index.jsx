'use client';

import { Box, Paper, Stack, Typography } from '@mui/material';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import SimpleBar from 'components/base/SimpleBar';
import IconifyIcon from 'components/base/IconifyIcon';
import ProjectKanbanProvider from './ProjectKanbanProvider';
import ProjectKanbanHeader from './ProjectKanbanHeader';
import ProjectKanbanApp from './ProjectKanbanApp';
import ProjectTaskDetails from './ProjectTaskDetails';
import AddTaskDialog from './AddTaskDialog';
import AddColumnDialog from './AddColumnDialog';
import { useProjectKanbanContext } from './ProjectKanbanContext';

const ProjectKanbanBoard = () => {
  const { columns } = useProjectKanbanContext();
  const { topbarHeight } = useNavContext();
  const { up } = useBreakpoints();
  const upMd = up('md');
  const upSm = up('sm');

  return (
    <Paper sx={{ p: 0, overflow: 'hidden' }}>
      <ProjectKanbanHeader />

      <Paper
        sx={{
          width: 1,
          height: ({ mixins }) =>
            mixins.contentHeight(
              topbarHeight,
              (upSm ? mixins.footer.sm : mixins.footer.xs) + (upMd ? 66 : upSm ? 61 : 105),
            ),
          bgcolor: 'background.default',
          overflow: 'hidden',
          overflowX: 'auto',
          '&::-webkit-scrollbar-track': { bgcolor: 'background.default' },
        }}
      >
        <SimpleBar>
          <Stack sx={{ gap: 3, px: 3, py: 2, height: 1 }}>
            {columns.length === 0 ? (
              <EmptyState />
            ) : (
              <ProjectKanbanApp />
            )}
          </Stack>
        </SimpleBar>
      </Paper>

      <ProjectTaskDetails />
      <AddTaskDialog />
      <AddColumnDialog />
    </Paper>
  );
};

const EmptyState = () => {
  const { openAddColumnDialog } = useProjectKanbanContext();

  return (
    <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
      <IconifyIcon
        icon="material-symbols:view-kanban-outline"
        sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }}
      />
      <Typography variant="h6" color="text.secondary">
        No columns yet
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
        Add columns to start organizing tasks
      </Typography>
      <Box
        onClick={openAddColumnDialog}
        sx={{
          py: 1.5,
          px: 3,
          borderRadius: 2,
          cursor: 'pointer',
          border: '2px dashed',
          borderColor: 'primary.main',
          color: 'primary.main',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          '&:hover': {
            bgcolor: 'primary.lighter',
          },
        }}
      >
        <IconifyIcon icon="material-symbols:add" sx={{ mr: 1 }} />
        <Typography variant="button">Add First Column</Typography>
      </Box>
    </Stack>
  );
};

const ProjectKanban = ({ project }) => {
  return (
    <ProjectKanbanProvider project={project}>
      <ProjectKanbanBoard />
    </ProjectKanbanProvider>
  );
};

export default ProjectKanban;
