'use client';

import { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import IconifyIcon from 'components/base/IconifyIcon';
import { useProjectKanbanContext } from './ProjectKanbanContext';

const priorities = [
  { value: 'low', label: 'Low', color: 'success' },
  { value: 'medium', label: 'Medium', color: 'warning' },
  { value: 'high', label: 'High', color: 'error' },
];

const ProjectTaskDetails = () => {
  const {
    taskDrawerOpen,
    activeTask,
    closeTaskDetails,
    handleUpdateTask,
    handleDeleteTask,
    columns,
    project,
  } = useProjectKanbanContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(null);
  const [assigneeId, setAssigneeId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync state with active task
  useEffect(() => {
    if (activeTask) {
      setTitle(activeTask.title || '');
      setDescription(activeTask.description || '');
      setColumnId(activeTask.column_id || '');
      setPriority(activeTask.priority || 'medium');
      setDueDate(activeTask.due_date ? dayjs(activeTask.due_date) : null);
      setAssigneeId(activeTask.assignee_id || '');
      setIsEditing(false);
    }
  }, [activeTask]);

  const handleClose = () => {
    setIsEditing(false);
    closeTaskDetails();
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      await handleUpdateTask(activeTask.id, {
        title: title.trim(),
        description: description.trim() || null,
        column_id: columnId,
        priority,
        due_date: dueDate ? dueDate.format('YYYY-MM-DD') : null,
        assignee_id: assigneeId || null,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await handleDeleteTask(activeTask.id);
        handleClose();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const members = project?.members || [];
  const currentColumn = columns.find(c => c.id === columnId);

  if (!activeTask) return null;

  return (
    <Drawer
      anchor="right"
      open={taskDrawerOpen}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 480, md: 560 }, p: 0 },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Typography variant="h6">Task Details</Typography>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={() => setIsEditing(!isEditing)} size="small">
            <IconifyIcon
              icon={isEditing ? 'material-symbols:close' : 'material-symbols:edit'}
            />
          </IconButton>
          <IconButton onClick={handleClose} size="small">
            <IconifyIcon icon="material-symbols:close" />
          </IconButton>
        </Stack>
      </Stack>

      {/* Content */}
      <Box sx={{ p: 3, overflow: 'auto', flex: 1 }}>
        <Stack spacing={3}>
          {/* Title */}
          {isEditing ? (
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
            />
          ) : (
            <Typography variant="h6">{activeTask.title}</Typography>
          )}

          {/* Status/Column */}
          {isEditing ? (
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                label="Status"
              >
                {columns.map((col) => (
                  <MenuItem key={col.id} value={col.id}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: col.color || 'primary.main',
                        }}
                      />
                      <span>{col.name}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: currentColumn?.color || 'primary.main',
                  }}
                />
                <Typography variant="body2">{currentColumn?.name || 'Unknown'}</Typography>
              </Stack>
            </Box>
          )}

          {/* Description */}
          {isEditing ? (
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={4}
            />
          ) : (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                {activeTask.description || 'No description'}
              </Typography>
            </Box>
          )}

          <Divider />

          {/* Priority */}
          {isEditing ? (
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                label="Priority"
              >
                {priorities.map((p) => (
                  <MenuItem key={p.value} value={p.value}>
                    {p.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Priority
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  size="small"
                  label={priorities.find(p => p.value === activeTask.priority)?.label || 'Medium'}
                  color={priorities.find(p => p.value === activeTask.priority)?.color || 'warning'}
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>
            </Box>
          )}

          {/* Due Date */}
          {isEditing ? (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Due Date"
                value={dueDate}
                onChange={setDueDate}
                slotProps={{
                  textField: { fullWidth: true },
                }}
              />
            </LocalizationProvider>
          ) : (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Due Date
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {activeTask.due_date
                  ? dayjs(activeTask.due_date).format('MMM D, YYYY')
                  : 'No due date'}
              </Typography>
            </Box>
          )}

          {/* Assignee */}
          {isEditing ? (
            <FormControl fullWidth>
              <InputLabel>Assignee</InputLabel>
              <Select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                label="Assignee"
              >
                <MenuItem value="">
                  <em>Unassigned</em>
                </MenuItem>
                {members.map((member) => (
                  <MenuItem key={member.user_id} value={member.user_id}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar
                        src={member.user?.avatar_url}
                        alt={member.user?.full_name}
                        sx={{ width: 24, height: 24 }}
                      />
                      <span>{member.user?.full_name || member.user?.email}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Assignee
              </Typography>
              {activeTask.assignee ? (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                  <Avatar
                    src={activeTask.assignee.avatar_url}
                    alt={activeTask.assignee.full_name}
                    sx={{ width: 24, height: 24 }}
                  />
                  <Typography variant="body2">
                    {activeTask.assignee.full_name || activeTask.assignee.email}
                  </Typography>
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Unassigned
                </Typography>
              )}
            </Box>
          )}

          <Divider />

          {/* Metadata */}
          <Box>
            <Typography variant="caption" color="text.secondary">
              Created
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {activeTask.created_at
                ? dayjs(activeTask.created_at).format('MMM D, YYYY h:mm A')
                : 'Unknown'}
            </Typography>
          </Box>

          {activeTask.updated_at && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {dayjs(activeTask.updated_at).format('MMM D, YYYY h:mm A')}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      {/* Footer Actions */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}
      >
        {isEditing ? (
          <>
            <Button
              variant="outlined"
              onClick={() => setIsEditing(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!title.trim() || loading}
              fullWidth
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              color="error"
              startIcon={<IconifyIcon icon="material-symbols:delete-outline" />}
              onClick={handleDelete}
              fullWidth
            >
              Delete
            </Button>
            <Button
              variant="contained"
              startIcon={<IconifyIcon icon="material-symbols:edit" />}
              onClick={() => setIsEditing(true)}
              fullWidth
            >
              Edit
            </Button>
          </>
        )}
      </Stack>
    </Drawer>
  );
};

export default ProjectTaskDetails;
