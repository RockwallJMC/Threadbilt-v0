'use client';

import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { useProjectKanbanContext } from './ProjectKanbanContext';

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const AddTaskDialog = () => {
  const {
    addTaskDialogOpen,
    addTaskColumnId,
    closeAddTaskDialog,
    handleAddTask,
    columns,
    project,
  } = useProjectKanbanContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState(addTaskColumnId || '');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(null);
  const [assigneeId, setAssigneeId] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens with new column
  const handleOpen = () => {
    if (addTaskColumnId && addTaskColumnId !== columnId) {
      setColumnId(addTaskColumnId);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setColumnId('');
    setPriority('medium');
    setDueDate(null);
    setAssigneeId('');
    closeAddTaskDialog();
  };

  const handleSubmit = async () => {
    if (!title.trim() || !columnId) return;

    setLoading(true);
    try {
      await handleAddTask({
        columnId,
        title: title.trim(),
        description: description.trim() || null,
        priority,
        dueDate: dueDate ? dueDate.format('YYYY-MM-DD') : null,
        assigneeId: assigneeId || null,
      });
      handleClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setLoading(false);
    }
  };

  const members = project?.members || [];

  return (
    <Dialog
      open={addTaskDialogOpen}
      onClose={handleClose}
      onTransitionEnter={handleOpen}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Add New Task</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Title */}
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            autoFocus
          />

          {/* Description */}
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />

          {/* Column Selection */}
          <FormControl fullWidth required>
            <InputLabel>Column</InputLabel>
            <Select
              value={columnId || addTaskColumnId || ''}
              onChange={(e) => setColumnId(e.target.value)}
              label="Column"
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

          {/* Priority */}
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

          {/* Due Date */}
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

          {/* Assignee */}
          {members.length > 0 && (
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
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!title.trim() || !columnId || loading}
        >
          {loading ? 'Creating...' : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTaskDialog;
