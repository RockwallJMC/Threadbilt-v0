'use client';

import {
  Avatar,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import IconifyIcon from 'components/base/IconifyIcon';

const priorityColors = {
  high: 'error',
  medium: 'warning',
  low: 'success',
};

const ProjectTaskDragOverlay = ({ task }) => {
  if (!task) return null;

  const isOverdue = task.due_date && dayjs(task.due_date).isBefore(dayjs(), 'day');
  const isDueSoon = task.due_date && dayjs(task.due_date).diff(dayjs(), 'day') <= 3 && !isOverdue;

  return (
    <Card
      sx={{
        width: 280,
        cursor: 'grabbing',
        transform: 'rotate(3deg)',
        boxShadow: 8,
        opacity: 0.95,
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
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          {task.title}
        </Typography>

        {/* Description preview */}
        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
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
              sx={{ height: 24 }}
            />
          )}

          {task.assignee && (
            <Avatar
              src={task.assignee.avatar_url}
              alt={task.assignee.full_name}
              sx={{ width: 24, height: 24 }}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProjectTaskDragOverlay;
