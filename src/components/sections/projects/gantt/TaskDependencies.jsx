'use client';

import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Autocomplete,
  TextField,
  Button,
  Divider
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  AccountTree as DependencyIcon
} from '@mui/icons-material';
import { useState } from 'react';

const TaskDependencies = ({
  selectedTasks = [],
  allTasks = [],
  onDependencyChange
}) => {
  const [newDependency, setNewDependency] = useState(null);

  if (selectedTasks.length === 0) {
    return null;
  }

  const selectedTask = allTasks.find(task => task.id === selectedTasks[0]);
  
  if (!selectedTask) {
    return null;
  }

  const currentDependencies = selectedTask.dependencies || [];
  const availableTasks = allTasks.filter(task => 
    task.id !== selectedTask.id && 
    !currentDependencies.includes(task.id)
  );

  const handleAddDependency = () => {
    if (newDependency) {
      const updatedDependencies = [...currentDependencies, newDependency.id];
      onDependencyChange(selectedTask.id, updatedDependencies);
      setNewDependency(null);
    }
  };

  const handleRemoveDependency = (dependencyId) => {
    const updatedDependencies = currentDependencies.filter(id => id !== dependencyId);
    onDependencyChange(selectedTask.id, updatedDependencies);
  };

  const getDependencyTask = (dependencyId) => {
    return allTasks.find(task => task.id === dependencyId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'active':
        return 'primary';
      case 'pending':
        return 'default';
      case 'blocked':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Paper 
      sx={{ 
        position: 'absolute',
        bottom: 16,
        right: 16,
        width: 350,
        maxHeight: 400,
        overflow: 'auto',
        zIndex: 1000
      }}
      elevation={8}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <DependencyIcon color="primary" />
          <Typography variant="h6">Task Dependencies</Typography>
        </Box>
        
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Selected Task: {selectedTask.label}
        </Typography>
        
        <Chip 
          label={selectedTask.status} 
          color={getStatusColor(selectedTask.status)}
          size="small"
          sx={{ mb: 2 }}
        />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Dependencies ({currentDependencies.length})
        </Typography>

        <List dense>
          {currentDependencies.map(depId => {
            const depTask = getDependencyTask(depId);
            return depTask ? (
              <ListItem key={depId}>
                <ListItemText 
                  primary={depTask.label}
                  secondary={`Status: ${depTask.status}`}
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    size="small"
                    onClick={() => handleRemoveDependency(depId)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ) : null;
          })}
        </List>

        {availableTasks.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Add Dependency
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Autocomplete
                size="small"
                options={availableTasks}
                getOptionLabel={(option) => option.label}
                value={newDependency}
                onChange={(event, newValue) => setNewDependency(newValue)}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Select task" />
                )}
                sx={{ flex: 1 }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleAddDependency}
                disabled={!newDependency}
                startIcon={<AddIcon />}
              >
                Add
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default TaskDependencies;
