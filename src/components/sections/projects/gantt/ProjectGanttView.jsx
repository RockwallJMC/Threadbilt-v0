'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Toolbar,
  Button,
  IconButton,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FilterList as FilterIcon,
  ViewTimeline as TimelineIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';
import GanttChart from './GanttChart';
import GanttControls from './GanttControls';
import TaskDependencies from './TaskDependencies';

const ProjectGanttView = ({ project }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [viewMode, setViewMode] = useState('month');
  const [showDependencies, setShowDependencies] = useState(true);
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');

  // Transform project phases into Gantt tasks
  const ganttTasks = useMemo(() => {
    if (!project?.phases) return [];
    
    return project.phases.map((phase, index) => ({
      id: phase.id,
      resourceId: `phase-${phase.id}`,
      label: phase.name,
      from: new Date(phase.startDate),
      to: new Date(phase.endDate),
      progress: phase.progress / 100,
      classes: `gantt-task-${phase.status}`,
      enableDragging: true,
      enableResize: true,
      dependencies: index > 0 ? [project.phases[index - 1].id] : [],
      type: 'task',
      status: phase.status,
      // Additional properties for advanced features
      budget: phase.budget || 0,
      actualCost: phase.actualCost || 0,
      assignedTo: phase.assignedTo || [],
      milestones: phase.milestones || []
    }));
  }, [project]);

  // Filter tasks based on status
  const filteredTasks = useMemo(() => {
    if (filterStatus === 'all') return ganttTasks;
    return ganttTasks.filter(task => task.status === filterStatus);
  }, [ganttTasks, filterStatus]);

  const handleTaskUpdate = (task) => {
    // In a real app, this would update the backend
    console.log('Task updated:', task);
  };

  const handleDependencyChange = (taskId, dependencies) => {
    // In a real app, this would update task dependencies
    console.log('Dependencies updated:', taskId, dependencies);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Toolbar sx={{ borderBottom: 1, borderColor: 'divider', gap: 2 }}>
        <TimelineIcon color="primary" />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Project Timeline - {project?.name}
        </Typography>
        
        {!isMobile && (
          <>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>View</InputLabel>
              <Select
                value={viewMode}
                label="View"
                onChange={(e) => setViewMode(e.target.value)}
              >
                <MenuItem value="day">Day</MenuItem>
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="quarter">Quarter</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={filterStatus}
                label="Filter"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Tasks</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
              </Select>
            </FormControl>
          </>
        )}

        <GanttControls
          viewMode={viewMode}
          showDependencies={showDependencies}
          showCriticalPath={showCriticalPath}
          onViewModeChange={setViewMode}
          onToggleDependencies={setShowDependencies}
          onToggleCriticalPath={setShowCriticalPath}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          isMobile={isMobile}
        />
      </Toolbar>

      {/* Gantt Chart */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <GanttChart
          tasks={filteredTasks}
          viewMode={viewMode}
          showDependencies={showDependencies}
          showCriticalPath={showCriticalPath}
          zoomLevel={zoomLevel}
          onTaskUpdate={handleTaskUpdate}
          onTaskSelect={setSelectedTasks}
          isMobile={isMobile}
        />
      </Box>

      {/* Task Dependencies Panel */}
      {selectedTasks.length > 0 && !isMobile && (
        <TaskDependencies
          selectedTasks={selectedTasks}
          allTasks={ganttTasks}
          onDependencyChange={handleDependencyChange}
        />
      )}
    </Paper>
  );
};

export default ProjectGanttView;
