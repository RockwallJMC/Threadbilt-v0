'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { useKanbanContext } from 'providers/KanbanProvider';
import SimpleBar from 'components/base/SimpleBar';
import KanbanApp from 'components/sections/kanban/kanban/KanbanApp';
import KanbanHeader from 'components/sections/kanban/kanban/page-header/KanbanHeader';
import TaskDetails from 'components/sections/kanban/kanban/task-details/TaskDetails';
import ProjectKanbanBridge from './ProjectKanbanBridge';
import ProjectFileSidebar from './sidebar/ProjectFileSidebar';

const ProjectKanbanBoard = () => {
  const { kanbanBoard, isLoading, fileSidebarOpen, toggleFileSidebar } = useKanbanContext();
  const { backgroundOption } = kanbanBoard;
  const { topbarHeight } = useNavContext();
  const { up } = useBreakpoints();
  const upMd = up('md');
  const upSm = up('sm');

  if (isLoading) {
    return (
      <Paper
        sx={{
          p: 4,
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Stack sx={{ flexDirection: 'row', height: 1 }}>
      <ProjectFileSidebar
        open={fileSidebarOpen}
        onClose={() => toggleFileSidebar()}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Paper>
          <KanbanHeader />
          <Paper
            sx={[
              {
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
              },
              backgroundOption?.type === 'image' && {
                backgroundImage: `url('${backgroundOption.background}')`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              },
              backgroundOption?.type === 'color' && {
                background: backgroundOption.background,
              },
            ]}
          >
            <SimpleBar>
              <Stack sx={{ gap: 3, px: 3, height: 1 }}>
                <KanbanApp />
              </Stack>
            </SimpleBar>
          </Paper>
          <TaskDetails />
        </Paper>
      </Box>
    </Stack>
  );
};

const ProjectKanban = ({ project }) => {
  return (
    <ProjectKanbanBridge project={project}>
      <ProjectKanbanBoard />
    </ProjectKanbanBridge>
  );
};

export default ProjectKanban;
