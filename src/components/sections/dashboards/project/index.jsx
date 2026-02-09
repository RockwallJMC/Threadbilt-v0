'use client';

import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import {
  deadlineMetrics,
  events,
  projectHours,
  projectsInfos,
  projectTimelineData,
  taskMetrics,
  upcomingMeetings,
} from 'data/project/dashboard';
import { recentProjects as staticRecentProjects } from 'data/projects/boards';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import {
  useRecentProjects,
  useUpdateLastViewed,
  useProjectTaskMetrics,
} from 'services/swr/api-hooks/useProjectApi';
import BoardsSlider from 'components/sections/projects/boards/boards-slider/BoardsSlider';
import Events from 'components/sections/dashboards/project/events/Events';
import HoursCompleted from 'components/sections/dashboards/project/hours-completed/HoursCompleted';
import ProductRoadmap from 'components/sections/dashboards/project/product-roadmap/ProductRoadmap';
import ProjectDeadlines from 'components/sections/dashboards/project/project-deadlines/ProjectDeadlines';
import ProjectTimeline from 'components/sections/dashboards/project/project-timeline/ProjectTimeline';
import ScheduleMeeting from 'components/sections/dashboards/project/schedule-meeting/ScheduleMeeting';
import TaskSummary from 'components/sections/dashboards/project/task-summary/TaskSummary';

const ProjectManagement = () => {
  const { up } = useBreakpoints();
  const upXl = up('xl');

  // Fetch recent projects from database
  const { data: recentProjectsData, isLoading: projectsLoading } = useRecentProjects(10);
  const { trigger: updateLastViewed } = useUpdateLastViewed();

  // Track selected project
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Fetch task metrics for selected project
  const { data: projectTaskMetrics } = useProjectTaskMetrics(selectedProjectId);

  // Auto-select first project when data loads
  useEffect(() => {
    if (!selectedProjectId && recentProjectsData?.boards?.length > 0) {
      setSelectedProjectId(recentProjectsData.boards[0].id);
    }
  }, [recentProjectsData, selectedProjectId]);

  // Handle project selection
  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
    updateLastViewed({ id: projectId });
  };

  // Use database data if available, fallback to static data
  const displayProjects = recentProjectsData || staticRecentProjects;

  // Use project-specific task metrics if available, fallback to static
  const displayTaskMetrics = projectTaskMetrics
    ? {
        todo: { amount: projectTaskMetrics.todoTasks, label: 'To Do' },
        progress: { amount: projectTaskMetrics.inProgressTasks, label: 'In Progress' },
        completed: { amount: projectTaskMetrics.completedTasks, label: 'Completed' },
        overdue: { amount: projectTaskMetrics.highPriorityTasks, label: 'High Priority' },
      }
    : taskMetrics;

  return (
    <Grid container>
      <Grid size={12}>
        <BoardsSlider
          boardList={displayProjects}
          size="small"
          showControls
          selectedId={selectedProjectId}
          onSelect={handleProjectSelect}
          isLoading={projectsLoading}
        />
      </Grid>

      <Grid container size={12}>
        {!upXl && (
          <Grid size={12}>
            <TaskSummary taskMetrics={displayTaskMetrics} />
          </Grid>
        )}

        <Grid container size={{ xs: 12, lg: 7, xl: 9 }}>
          {upXl && (
            <Grid size={12}>
              <TaskSummary taskMetrics={displayTaskMetrics} />
            </Grid>
          )}
          <Grid size={12}>
            <ProjectTimeline projectTimelineData={projectTimelineData} />
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 5, xl: 3 }}>
          <ProjectDeadlines deadlineMetrics={deadlineMetrics} />
        </Grid>

        <Grid size={{ xs: 12, lg: 7, xl: 9 }} order={{ sm: 1, lg: 0 }}>
          <ProductRoadmap projectInfos={projectsInfos} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 5, xl: 3 }}>
          <ScheduleMeeting upcomingMeetings={upcomingMeetings} />
        </Grid>
      </Grid>

      <Grid size={{ xs: 12, xl: 7 }}>
        <Events events={events} />
      </Grid>

      <Grid size={{ xs: 12, xl: 5 }}>
        <HoursCompleted projectHours={projectHours} />
      </Grid>
    </Grid>
  );
};

export default ProjectManagement;
