'use client';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import IconifyIcon from 'components/base/IconifyIcon';
import { taskStatuses } from 'data/projects/dashboard';
import { users } from 'data/users';

// Mock tasks data
const mockTasks = [
  {
    id: 1,
    title: 'Design user interface mockups',
    description: 'Create wireframes and mockups for the main dashboard',
    status: 'To Do',
    priority: 'high',
    assignee: users[1],
    dueDate: '2024-02-15',
    labels: ['Design', 'UI/UX'],
  },
  {
    id: 2,
    title: 'Implement authentication system',
    description: 'Set up user login and registration functionality',
    status: 'In Progress',
    priority: 'high',
    assignee: users[3],
    dueDate: '2024-02-20',
    labels: ['Backend', 'Security'],
  },
  {
    id: 3,
    title: 'Write unit tests',
    description: 'Create comprehensive test coverage for core modules',
    status: 'To Do',
    priority: 'medium',
    assignee: users[7],
    dueDate: '2024-02-25',
    labels: ['Testing'],
  },
  {
    id: 4,
    title: 'Database optimization',
    description: 'Optimize database queries for better performance',
    status: 'Completed',
    priority: 'medium',
    assignee: users[9],
    dueDate: '2024-02-10',
    labels: ['Database', 'Performance'],
  },
  {
    id: 5,
    title: 'API documentation',
    description: 'Document all API endpoints and usage examples',
    status: 'Blocked',
    priority: 'low',
    assignee: users[5],
    dueDate: '2024-03-01',
    labels: ['Documentation'],
  },
];

const TaskCard = ({ task }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ mb: 2, cursor: 'pointer', '&:hover': { boxShadow: 2 } }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
            <Typography variant="body1" sx={{ fontWeight: 500, flex: 1 }}>
              {task.title}
            </Typography>
            <IconButton size="small">
              <IconifyIcon icon="material-symbols:more-vert" />
            </IconButton>
          </Stack>
          
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            {task.description}
          </Typography>
          
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {task.labels.map((label, index) => (
              <Chip
                key={index}
                label={label}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem', height: 20 }}
              />
            ))}
          </Stack>
          
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar src={task.assignee.avatar} sx={{ width: 24, height: 24 }}>
                {task.assignee.name.charAt(0)}
              </Avatar>
              <Chip
                label={task.priority}
                color={getPriorityColor(task.priority)}
                size="small"
                sx={{ textTransform: 'capitalize', fontSize: '0.75rem', height: 20 }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {new Date(task.dueDate).toLocaleDateString()}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

const KanbanColumn = ({ status, tasks }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do':
        return 'default';
      case 'In Progress':
        return 'primary';
      case 'Completed':
        return 'success';
      case 'Blocked':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ minWidth: 300, bgcolor: 'grey.50', borderRadius: 2, p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {status}
          </Typography>
          <Chip
            label={tasks.length}
            color={getStatusColor(status)}
            size="small"
            sx={{ minWidth: 24, height: 20 }}
          />
        </Stack>
        <IconButton size="small">
          <IconifyIcon icon="material-symbols:add" />
        </IconButton>
      </Stack>
      
      <Box sx={{ minHeight: 400 }}>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </Box>
    </Box>
  );
};

const ProjectTasksKanban = ({ projectId }) => {
  const [tasks] = useState(mockTasks);

  return (
    <Box sx={{ overflow: 'auto' }}>
      <Stack direction="row" spacing={3} sx={{ pb: 2 }}>
        {taskStatuses.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks.filter((task) => task.status === status)}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default ProjectTasksKanban;
