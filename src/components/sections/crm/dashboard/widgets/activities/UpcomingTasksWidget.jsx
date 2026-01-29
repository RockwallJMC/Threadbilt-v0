'use client';

import { useMemo } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Typography,
  Chip,
  Box,
  Stack,
} from '@mui/material';
import { format, parseISO, differenceInDays } from 'date-fns';
import DashboardWidgetContainer from '../../DashboardWidgetContainer';
import { upcomingTasks } from 'data/crm/dashboard-metrics';

/**
 * UpcomingTasksWidget - Dashboard widget showing upcoming tasks with checkboxes
 *
 * Phase 1.7.5: Task list with due dates, priority chips, and completion status
 *
 * @param {Array} tasks - Task data (defaults to mock data)
 * @param {boolean} loading - Loading state
 * @param {string} error - Error message
 * @param {Function} onTaskToggle - Callback when task checkbox toggled
 */
const UpcomingTasksWidget = ({
  tasks = upcomingTasks,
  loading = false,
  error = null,
  onTaskToggle = () => {},
}) => {
  const priorityColors = {
    high: 'error',
    medium: 'warning',
    low: 'info',
  };

  // Calculate days until due and sort by due date
  const tasksWithDaysUntil = useMemo(() => {
    if (!tasks) return [];

    return tasks
      .map((task) => {
        const dueDate = parseISO(task.dueDate);
        const daysUntil = differenceInDays(dueDate, new Date());

        return {
          ...task,
          dueDate,
          daysUntil,
          dueDateFormatted: format(dueDate, 'MMM d'),
          isOverdue: daysUntil < 0,
        };
      })
      .sort((a, b) => a.dueDate - b.dueDate);
  }, [tasks]);

  return (
    <DashboardWidgetContainer
      title="Upcoming Tasks"
      subtitle="Next 7 days"
      loading={loading}
      error={error}
      minHeight={400}
    >
      {tasksWithDaysUntil.length > 0 ? (
        <List sx={{ width: '100%', p: 0 }}>
          {tasksWithDaysUntil.map((task) => (
            <ListItem
              key={task.id}
              disablePadding
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '&:last-child': { borderBottom: 0 },
              }}
            >
              <ListItemButton
                onClick={() => onTaskToggle(task.id)}
                sx={{ py: 1.5 }}
                dense
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Checkbox
                    edge="start"
                    checked={task.completed}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="body2"
                        sx={{
                          textDecoration: task.completed ? 'line-through' : 'none',
                          color: task.completed ? 'text.disabled' : 'text.primary',
                          flexGrow: 1,
                        }}
                      >
                        {task.title}
                      </Typography>
                      <Chip
                        label={task.priority}
                        color={priorityColors[task.priority]}
                        size="small"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Stack>
                  }
                  secondary={
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: task.isOverdue ? 'error.main' : 'text.secondary',
                          fontWeight: task.isOverdue ? 600 : 400,
                        }}
                      >
                        {task.dueDateFormatted}
                        {task.isOverdue && ' (Overdue)'}
                        {!task.isOverdue &&
                          task.daysUntil === 0 &&
                          ' (Today)'}
                        {!task.isOverdue &&
                          task.daysUntil === 1 &&
                          ' (Tomorrow)'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        •
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {task.assignedTo}
                      </Typography>
                    </Stack>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 200,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No upcoming tasks
          </Typography>
        </Box>
      )}
    </DashboardWidgetContainer>
  );
};

export default UpcomingTasksWidget;
