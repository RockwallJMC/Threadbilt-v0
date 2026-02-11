import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import AddNewTask from 'components/sections/kanban/kanban/task-card/AddNewTask';
import AddNewTaskForm from 'components/sections/kanban/kanban/task-card/AddNewTaskForm';
import SortableTaskItem from 'components/sections/kanban/kanban/task-card/SortableTaskItem';
import DrawingCard from 'components/sections/projects/project-kanban/DrawingCard';
import AddDrawingDialog from 'components/sections/projects/project-kanban/AddDrawingDialog';
import IconifyIcon from 'components/base/IconifyIcon';
import { useKanbanContext } from 'providers/KanbanProvider';

const AddNewDrawing = ({ listId }) => {
  const [isFormActive, setIsFormActive] = useState(false);
  const [drawingTitle, setDrawingTitle] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // We need projectId from the kanban board context
  // The kanban board data has project info - extract from context
  const { kanbanBoard, mutateDrawings } = useKanbanContext();
  const projectId = kanbanBoard?.id;

  const handleOpenDialog = () => {
    if (drawingTitle.trim()) {
      setDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDrawingTitle('');
    setIsFormActive(false);
  };

  const handleDrawingCreated = async () => {
    setDrawingTitle('');
    setIsFormActive(false);
    // Trigger revalidation of drawings
    if (mutateDrawings) {
      await mutateDrawings();
    }
  };

  if (!isFormActive) {
    return (
      <Box sx={{ p: 1, borderRadius: 4, bgcolor: 'background.elevation1' }}>
        <Button
          variant="text"
          color="neutral"
          onClick={() => setIsFormActive(true)}
          startIcon={
            <IconifyIcon icon="material-symbols:add-2-rounded" sx={{ fontSize: '20px !important' }} />
          }
          fullWidth
        >
          Add New Drawing
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: 3, borderRadius: 4, bgcolor: 'background.elevation1' }}>
        <TextField
          label="Enter drawing title"
          variant="filled"
          size="small"
          fullWidth
          value={drawingTitle}
          onChange={(e) => setDrawingTitle(e.target.value)}
          autoFocus
          sx={{ mb: 1 }}
        />
        <Stack spacing={1}>
          <Button
            variant="soft"
            fullWidth
            onClick={handleOpenDialog}
            disabled={!drawingTitle.trim()}
          >
            Add Drawing
          </Button>
          <Button
            variant="text"
            color="neutral"
            shape="square"
            onClick={() => { setIsFormActive(false); setDrawingTitle(''); }}
          >
            <IconifyIcon icon="material-symbols:close-rounded" fontSize={20} />
          </Button>
        </Stack>
      </Box>

      <AddDrawingDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        title={drawingTitle}
        projectId={projectId}
        onDrawingCreated={handleDrawingCreated}
      />
    </>
  );
};

const TaskItems = ({ listId, tasks, isAddNewTaskFormOpen, handleAddNewTaskFormClose, addLabel }) => {
  const isDrawingsLane = addLabel === 'Add New Drawing';

  if (isDrawingsLane) {
    return (
      <Stack direction="column" sx={{ gap: 2, p: 1, pb: 3 }}>
        {tasks.map((item) => (
          <DrawingCard key={item.id} drawing={item} />
        ))}
        <AddNewDrawing listId={listId} />
      </Stack>
    );
  }

  return (
    <Stack direction="column" sx={{ gap: 2, p: 1, pb: 3 }}>
      {isAddNewTaskFormOpen && (
        <AddNewTaskForm
          position="top"
          listId={listId}
          handleFormClose={handleAddNewTaskFormClose}
        />
      )}
      {tasks.map((item) => (
        <SortableTaskItem key={item.id} task={item} />
      ))}
      <AddNewTask listId={listId} addLabel={addLabel} />
    </Stack>
  );
};

export default TaskItems;
