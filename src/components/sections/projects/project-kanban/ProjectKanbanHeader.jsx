'use client';

import { useRouter } from 'next/navigation';
import {
  Avatar,
  AvatarGroup,
  Button,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import paths from 'routes/paths';
import { useProjectKanbanContext } from './ProjectKanbanContext';

const ProjectKanbanHeader = () => {
  const router = useRouter();
  const { project, openAddColumnDialog, openAddTaskDialog, columns } = useProjectKanbanContext();

  if (!project) return null;

  const firstColumnId = columns?.[0]?.id;

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      data-testid="project-kanban-header"
      sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}
    >
      {/* Left side - Back button, title, status */}
      <Stack direction="row" alignItems="center" spacing={2}>
        <Button
          variant="text"
          color="neutral"
          startIcon={<IconifyIcon icon="material-symbols:arrow-back" />}
          onClick={() => router.push(paths.projectBoards)}
        >
          Back
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {project.name}
        </Typography>
        {project.status && (
          <Chip
            size="small"
            label={project.status}
            color={project.status === 'active' ? 'success' : 'default'}
            sx={{ textTransform: 'capitalize' }}
          />
        )}
      </Stack>

      {/* Right side - Actions and members */}
      <Stack direction="row" alignItems="center" spacing={2}>
        {/* Add Task Button */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<IconifyIcon icon="material-symbols:add-task" />}
          onClick={() => openAddTaskDialog(firstColumnId)}
          disabled={!firstColumnId}
        >
          Add Task
        </Button>

        {/* Add Column Button */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<IconifyIcon icon="material-symbols:add-column-right" />}
          onClick={openAddColumnDialog}
        >
          Add Column
        </Button>

        {/* Team Members */}
        {project.members?.length > 0 && (
          <AvatarGroup max={5} sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
            {project.members.map((member) => (
              <Tooltip key={member.user_id} title={member.user?.full_name || member.user?.email}>
                <Avatar src={member.user?.avatar_url} alt={member.user?.full_name} />
              </Tooltip>
            ))}
          </AvatarGroup>
        )}
      </Stack>
    </Stack>
  );
};

export default ProjectKanbanHeader;
