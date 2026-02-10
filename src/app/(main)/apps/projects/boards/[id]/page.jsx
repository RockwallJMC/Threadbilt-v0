'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useProject } from 'services/swr/api-hooks/useProjectApi';
import IconifyIcon from 'components/base/IconifyIcon';
import paths from 'routes/paths';
import ProjectKanban from 'components/sections/projects/project-kanban';

const ProjectBoardPage = ({ params }) => {
  const { id } = use(params);
  const router = useRouter();
  const { data: project, isLoading, error } = useProject(id);

  if (isLoading) {
    return (
      <Paper sx={{ p: 4, minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error || !project) {
    return (
      <Paper sx={{ p: 4, minHeight: 400 }}>
        <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ height: 300 }}>
          <IconifyIcon icon="material-symbols:error-outline" sx={{ fontSize: 48, color: 'error.main' }} />
          <Typography variant="h6" color="text.secondary">
            Project not found
          </Typography>
          <Button variant="contained" onClick={() => router.push(paths.projectBoards)}>
            Back to Projects
          </Button>
        </Stack>
      </Paper>
    );
  }

  return <ProjectKanban project={project} />;
};

export default ProjectBoardPage;
