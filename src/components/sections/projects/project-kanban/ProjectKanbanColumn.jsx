'use client';

import { useMemo } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import IconifyIcon from 'components/base/IconifyIcon';
import SimpleBar from 'components/base/SimpleBar';
import { useProjectKanbanContext } from './ProjectKanbanContext';
import ProjectKanbanTask from './ProjectKanbanTask';

const ProjectKanbanColumn = ({ column, tasks }) => {
  const { openAddTaskDialog, handleDeleteColumn, handleUpdateColumn } = useProjectKanbanContext();
  const [menuAnchor, setMenuAnchor] = useState(null);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: 'column', item: column },
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: column.id,
    data: { type: 'column', column },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleDelete = async () => {
    handleMenuClose();
    if (window.confirm(`Delete column "${column.name}"? All tasks in this column will be deleted.`)) {
      await handleDeleteColumn(column.id);
    }
  };

  return (
    <Paper
      ref={(node) => {
        setSortableRef(node);
        setDroppableRef(node);
      }}
      style={style}
      data-testid="kanban-column"
      sx={{
        minWidth: 300,
        maxWidth: 300,
        bgcolor: 'background.elevation1',
        borderRadius: 2,
        p: 2,
        height: 'fit-content',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Column Header */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ mb: 2, cursor: 'grab' }}
        data-testid="column-header"
        {...attributes}
        {...listeners}
      >
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: column.color || 'primary.main',
            flexShrink: 0,
          }}
        />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
          {column.name}
        </Typography>
        <Chip
          size="small"
          label={tasks.length}
          sx={{ height: 20, minWidth: 24 }}
        />
        <IconButton size="small" onClick={handleMenuOpen}>
          <IconifyIcon icon="material-symbols:more-vert" sx={{ fontSize: 18 }} />
        </IconButton>
      </Stack>

      {/* Column Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => { handleMenuClose(); openAddTaskDialog(column.id); }}>
          <IconifyIcon icon="material-symbols:add" sx={{ mr: 1 }} />
          Add Task
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <IconifyIcon icon="material-symbols:delete-outline" sx={{ mr: 1 }} />
          Delete Column
        </MenuItem>
      </Menu>

      {/* Tasks List */}
      <SimpleBar style={{ maxHeight: 'calc(100vh - 350px)', paddingRight: 8, flex: 1 }}>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <Box
              sx={{
                py: 4,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" color="text.disabled">
                No tasks
              </Typography>
            </Box>
          ) : (
            tasks.map((task) => (
              <ProjectKanbanTask key={task.id} task={task} />
            ))
          )}
        </SortableContext>
      </SimpleBar>

      {/* Add Task Button */}
      <Box
        onClick={() => openAddTaskDialog(column.id)}
        sx={{
          mt: 2,
          py: 1,
          px: 2,
          borderRadius: 1,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: 'action.hover',
            color: 'primary.main',
          },
        }}
      >
        <IconifyIcon icon="material-symbols:add" sx={{ mr: 0.5 }} />
        <Typography variant="body2">Add task</Typography>
      </Box>
    </Paper>
  );
};

export default ProjectKanbanColumn;
