'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Grid from '@mui/material/Grid';
import { useSnackbar } from 'notistack';
import paths from 'routes/paths';
import {
  useRecentProjects,
  useUpdateLastViewed,
  useProjectTaskMetrics,
  useUpdateProject,
  useDeleteProject,
  useProjectGanttData,
  useProjectDeadlineMetrics,
  useProjectRoadmap,
  useProjectMeetings,
  useProjectEvents,
  useProjectHours,
} from 'services/swr/api-hooks/useProjectApi';
import {
  transformTasksToGanttFormat,
  transformTasksToDeadlineMetrics,
  transformProjectToRoadmapFormat,
  transformMeetingsToScheduleFormat,
  transformEventsToCalendarFormat,
  transformTimeEntriesToChartFormat,
} from 'helpers/project-data-transformers';
import BoardsSlider from 'components/sections/projects/boards/boards-slider/BoardsSlider';
import Events from 'components/sections/dashboards/project/events/Events';
import HoursCompleted from 'components/sections/dashboards/project/hours-completed/HoursCompleted';
import ProductRoadmap from 'components/sections/dashboards/project/product-roadmap/ProductRoadmap';
import ProjectDeadlines from 'components/sections/dashboards/project/project-deadlines/ProjectDeadlines';
import ProjectTimeline from 'components/sections/dashboards/project/project-timeline/ProjectTimeline';
import ScheduleMeeting from 'components/sections/dashboards/project/schedule-meeting/ScheduleMeeting';
import TaskSummary from 'components/sections/dashboards/project/task-summary/TaskSummary';

const ProjectManagement = () => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  // Fetch recent projects from database
  const { data: recentProjectsData, isLoading: projectsLoading, mutate: mutateProjects } = useRecentProjects(10);
  const { trigger: updateLastViewed } = useUpdateLastViewed();
  const { trigger: updateProject } = useUpdateProject();
  const { trigger: deleteProject } = useDeleteProject();

  // Track selected project
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Fetch task metrics for selected project
  const { data: projectTaskMetrics } = useProjectTaskMetrics(selectedProjectId);

  // Fetch data for dashboard widgets
  const { data: ganttRawData } = useProjectGanttData(selectedProjectId);
  const { data: deadlineRawData } = useProjectDeadlineMetrics(selectedProjectId);
  const { data: roadmapRawData } = useProjectRoadmap(selectedProjectId);
  const { data: meetingsRawData } = useProjectMeetings(selectedProjectId);
  const { data: eventsRawData } = useProjectEvents(selectedProjectId);
  const { data: hoursRawData } = useProjectHours(selectedProjectId);

  // Get selected project name for hours chart
  const selectedProjectName = useMemo(() => {
    if (!recentProjectsData?.boards || !selectedProjectId) return 'Project';
    const project = recentProjectsData.boards.find((p) => p.id === selectedProjectId);
    return project?.name || 'Project';
  }, [recentProjectsData, selectedProjectId]);

  // Transform data for widgets - no mock fallback, show blank if no data
  const displayGanttData = useMemo(() => {
    if (!ganttRawData?.tasks?.length) return [];
    return transformTasksToGanttFormat(ganttRawData.tasks, ganttRawData.columns);
  }, [ganttRawData]);

  const displayDeadlineMetrics = useMemo(() => {
    return transformTasksToDeadlineMetrics(deadlineRawData?.tasks || [], deadlineRawData?.columns || []);
  }, [deadlineRawData]);

  const displayRoadmapData = useMemo(() => {
    if (!roadmapRawData) return [];
    return transformProjectToRoadmapFormat(roadmapRawData, roadmapRawData.columns || []);
  }, [roadmapRawData]);

  const displayMeetingsData = useMemo(() => {
    if (!meetingsRawData?.length) return [];
    return transformMeetingsToScheduleFormat(meetingsRawData);
  }, [meetingsRawData]);

  const displayEventsData = useMemo(() => {
    if (!eventsRawData?.length) return [];
    return transformEventsToCalendarFormat(eventsRawData);
  }, [eventsRawData]);

  const displayHoursData = useMemo(() => {
    return transformTimeEntriesToChartFormat(hoursRawData || [], selectedProjectName);
  }, [hoursRawData, selectedProjectName]);

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

  // Handle project edit
  const handleProjectEdit = (projectId) => {
    router.push(`${paths.projectBoards}/${projectId}`);
  };

  // Handle project archive
  const handleProjectArchive = async (projectId) => {
    try {
      await updateProject({ id: projectId, updates: { status: 'archived' } });
      enqueueSnackbar('Project archived', { variant: 'success' });
      mutateProjects();
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to archive project', { variant: 'error' });
    }
  };

  // Handle project delete
  const handleProjectDelete = async (projectId) => {
    try {
      await deleteProject({ id: projectId });
      enqueueSnackbar('Project deleted', { variant: 'success' });
      mutateProjects();
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
      }
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to delete project', { variant: 'error' });
    }
  };

  // Use database data only - no static fallback
  const displayProjects = recentProjectsData || { boards: [], total: 0 };

  // Use project-specific task metrics - show zeros if no data
  const displayTaskMetrics = [
    {
      title: 'To Do',
      count: projectTaskMetrics?.todoTasks || 0,
      icon: { name: 'material-symbols:note-outline', color: 'primary' },
    },
    {
      title: 'In Progress',
      count: projectTaskMetrics?.inProgressTasks || 0,
      icon: { name: 'material-symbols:pending-outline', color: 'info' },
    },
    {
      title: 'Completed',
      count: projectTaskMetrics?.completedTasks || 0,
      icon: { name: 'material-symbols:check-box-outline', color: 'success' },
    },
  ];

  return (
    <Grid container>
      {/* Top section: Left column (BoardsSlider + TaskSummary + ProjectTimeline) + Right column (ProjectDeadlines) */}
      <Grid container size={12}>
        {/* Left column: stacked content */}
        <Grid container size={{ xs: 12, lg: 7, xl: 9 }}>
          <Grid size={12}>
            <BoardsSlider
              boardList={displayProjects}
              size="small"
              showControls
              selectedId={selectedProjectId}
              onSelect={handleProjectSelect}
              onViewBoard={handleProjectEdit}
              onEdit={handleProjectEdit}
              onArchive={handleProjectArchive}
              onDelete={handleProjectDelete}
              isLoading={projectsLoading}
            />
          </Grid>
          <Grid size={12}>
            <TaskSummary taskMetrics={displayTaskMetrics} />
          </Grid>
          <Grid size={12}>
            <ProjectTimeline projectTimelineData={displayGanttData} />
          </Grid>
        </Grid>

        {/* Right column: ProjectDeadlines spans full height */}
        <Grid size={{ xs: 12, sm: 6, lg: 5, xl: 3 }}>
          <ProjectDeadlines deadlineMetrics={displayDeadlineMetrics} />
        </Grid>
      </Grid>

      <Grid container size={12}>
        <Grid size={{ xs: 12, lg: 7, xl: 9 }}>
          <ProductRoadmap projectInfos={displayRoadmapData} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 5, xl: 3 }}>
          <ScheduleMeeting upcomingMeetings={displayMeetingsData} />
        </Grid>
      </Grid>

      <Grid size={{ xs: 12, xl: 7 }}>
        <Events events={displayEventsData} />
      </Grid>

      <Grid size={{ xs: 12, xl: 5 }}>
        <HoursCompleted projectHours={displayHoursData} />
      </Grid>
    </Grid>
  );
};

export default ProjectManagement;
