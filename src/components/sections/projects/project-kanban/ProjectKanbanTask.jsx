'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Avatar,
  Card,
  CardContent,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import IconifyIcon from 'components/base/IconifyIcon';
import { useProjectKanbanContext } from './ProjectKanbanContext';

const priorityColors = {
  high: 'error',
  medium: 'warning',
  low: 'success',
};

const ProjectKanbanTask = ({ task }) => {
  const { openTaskDetails } = useProjectKanbanContext();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task', item: task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue = task.due_date && dayjs(task.due_date).isBefore(dayjs(), 'day');
  const isDueSoon = task.due_date && dayjs(task.due_date).diff(dayjs(), 'day') <= 3 && !isOverdue;

  const handleClick = () => {
    openTaskDetails(task);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      data-testid="kanban-task"
      sx={{
        mb: 1.5,
        cursor: 'grab',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Priority indicator */}
        {task.priority && task.priority !== 'medium' && (
          <Chip
            size="small"
            label={task.priority}
            color={priorityColors[task.priority] || 'default'}
            sx={{ height: 18, fontSize: 10, mb: 1, textTransform: 'capitalize' }}
          />
        )}

        {/* Title */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }} data-testid="task-title">
          {task.title}
        </Typography>

        {/* Description preview */}
        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            data-testid="task-description"
            sx={{
              mb: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {task.description}
          </Typography>
        )}

        {/* Footer with due date and assignee */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          {task.due_date && (
            <Chip
              size="small"
              icon={<IconifyIcon icon="material-symbols:calendar-today" sx={{ fontSize: 14 }} />}
              label={dayjs(task.due_date).format('MMM D')}
              color={isOverdue ? 'error' : isDueSoon ? 'warning' : 'default'}
              variant={isOverdue || isDueSoon ? 'filled' : 'outlined'}
              data-testid="task-due-date"
              sx={{ height: 24 }}
            />
          )}

          {task.assignee && (
            <Tooltip title={task.assignee.full_name || task.assignee.email}>
              <Avatar
                src={task.assignee.avatar_url}
                alt={task.assignee.full_name}
                sx={{ width: 24, height: 24 }}
              />
            </Tooltip>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProjectKanbanTask;
