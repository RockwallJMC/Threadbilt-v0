'use client';

import { supabase } from 'lib/supabase/client';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

/**
 * Fetcher function for all projects
 * @param {Object|null} filters - Optional filters { status, search, priority }
 * @returns {Promise<Array>} Array of project objects
 */
const projectsFetcher = async (filters = null) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  let query = supabase
    .from('projects')
    .select(`
      *,
      project_manager:user_profiles!project_manager_id(*),
      members:project_members(*, user:user_profiles(*))
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.priority) {
    query = query.eq('priority', filters.priority);
  }

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * Hook to fetch all projects
 * @param {Object|null} filters - Optional filters
 * @param {Object} config - SWR configuration
 */
export const useProjects = (filters = null, config) => {
  return useSWR(
    filters ? ['projects', filters] : 'projects',
    () => projectsFetcher(filters),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );
};

/**
 * Fetcher for recent projects sorted by last_viewed_at
 * @param {number} limit - Max number of projects to return
 */
const recentProjectsFetcher = async (limit = 10) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_manager:user_profiles!project_manager_id(*),
      members:project_members(*, user:user_profiles(*))
    `)
    .is('deleted_at', null)
    .order('last_viewed_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  // Transform for BoardsSlider compatibility
  return {
    id: 'recentProjects',
    title: 'Recent Projects',
    boards: (data || []).map(project => ({
      id: project.id,
      name: project.name,
      image: project.background_image || '/assets/images/kanban/boards/1.webp',
      lastViewAt: formatLastViewed(project.last_viewed_at),
      assignee: (project.members || []).map(m => ({
        name: m.user?.full_name || m.user?.email || 'User',
        avatar: m.user?.avatar_url,
      })),
      ...project, // Include all original fields
    })),
  };
};

/**
 * Format last viewed time for display
 */
const formatLastViewed = (dateStr) => {
  if (!dateStr) return 'Just now';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hrs ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

/**
 * Hook to fetch recent projects for dashboard
 * @param {number} limit - Max projects to return
 * @param {Object} config - SWR configuration
 */
export const useRecentProjects = (limit = 10, config) => {
  return useSWR(
    ['projects/recent', limit],
    () => recentProjectsFetcher(limit),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );
};

/**
 * Fetcher for a single project with all relations
 */
const projectFetcher = async (id) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_manager:user_profiles!project_manager_id(*),
      columns:project_columns(*),
      labels:project_labels(*),
      members:project_members(*, user:user_profiles!user_id(*)),
      tasks:project_tasks(*, assignee:user_profiles!assignee_id(*))
    `)
    .eq('id', id)
    .limit(1);

  if (error) {
    throw new Error(`Failed to fetch project ${id}: ${error.message}`);
  }

  return data?.[0] || null;
};

/**
 * Hook to fetch a single project
 */
export const useProject = (id, config) => {
  return useSWR(
    id ? ['project', id] : null,
    () => projectFetcher(id),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );
};

/**
 * Create project mutation - creates project with columns, labels, and members
 */
const createProjectMutation = async (url, { arg }) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Get user's active organization
  const { data: orgMember, error: orgError } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (orgError || !orgMember) {
    throw new Error('Could not determine organization');
  }

  const { columns, labels, members, ...projectData } = arg;

  // Insert project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert([{
      ...projectData,
      organization_id: orgMember.organization_id,
      created_by: user.id,
    }])
    .select()
    .single();

  if (projectError) {
    throw new Error(`Failed to create project: ${projectError.message}`);
  }

  // Insert columns if provided
  if (columns?.length > 0) {
    const columnsData = columns.map((col, index) => ({
      project_id: project.id,
      name: col.columnType || col.name,
      color: col.color,
      card_limit: col.cardLimit || col.card_limit || 20,
      sort_order: index,
    }));

    const { error: colError } = await supabase
      .from('project_columns')
      .insert(columnsData);

    if (colError) {
      console.error('Failed to create columns:', colError);
    }
  }

  // Insert labels if provided
  if (labels?.length > 0) {
    const labelsData = labels.map(label => ({
      project_id: project.id,
      name: label.label || label.name,
      color: label.color,
    }));

    const { error: labelError } = await supabase
      .from('project_labels')
      .insert(labelsData);

    if (labelError) {
      console.error('Failed to create labels:', labelError);
    }
  }

  // Insert members if provided (always add creator as admin)
  const memberIds = new Set([user.id]);
  const membersData = [{ project_id: project.id, user_id: user.id, role: 'admin' }];

  if (members?.length > 0) {
    members.forEach(m => {
      const userId = m.user_id || m.id;
      if (userId && !memberIds.has(userId)) {
        memberIds.add(userId);
        membersData.push({
          project_id: project.id,
          user_id: userId,
          role: m.role?.toLowerCase() || 'member',
        });
      }
    });
  }

  const { error: memberError } = await supabase
    .from('project_members')
    .insert(membersData);

  if (memberError) {
    console.error('Failed to create members:', memberError);
  }

  return project;
};

/**
 * Hook to create a new project
 */
export const useCreateProject = () => {
  return useSWRMutation('create-project', createProjectMutation);
};

/**
 * Update project mutation
 */
const updateProjectMutation = async (url, { arg }) => {
  const { id, updates } = arg;
    const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update project ${id}: ${error.message}`);
  }

  return data;
};

/**
 * Hook to update a project
 */
export const useUpdateProject = () => {
  return useSWRMutation('update-project', updateProjectMutation, {
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });
};

/**
 * Delete project mutation (soft delete)
 */
const deleteProjectMutation = async (url, { arg }) => {
  const { id } = arg;
    const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to delete project ${id}: ${error.message}`);
  }

  return data;
};

/**
 * Hook to delete a project (soft delete)
 */
export const useDeleteProject = () => {
  return useSWRMutation('delete-project', deleteProjectMutation, {
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });
};

/**
 * Update last viewed timestamp for a project
 */
const updateLastViewedMutation = async (url, { arg }) => {
  const { id } = arg;
  
  const { error } = await supabase
    .from('projects')
    .update({ last_viewed_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Failed to update last viewed:', error);
  }

  return { id };
};

/**
 * Hook to update last viewed timestamp
 */
export const useUpdateLastViewed = () => {
  return useSWRMutation('update-last-viewed', updateLastViewedMutation);
};

// ========================================
// Dashboard Data Hooks
// ========================================

/**
 * Fetch task metrics for a project (counts by column)
 */
const projectTaskMetricsFetcher = async (projectId) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Get columns and tasks
  const { data: columns, error: colError } = await supabase
    .from('project_columns')
    .select('id, name, color, sort_order')
    .eq('project_id', projectId)
    .order('sort_order');

  if (colError) throw new Error(colError.message);

  const { data: tasks, error: taskError } = await supabase
    .from('project_tasks')
    .select('id, column_id, priority')
    .eq('project_id', projectId);

  if (taskError) throw new Error(taskError.message);

  // Calculate metrics
  const totalTasks = tasks?.length || 0;
  const completedColumn = columns?.find(c =>
    c.name.toLowerCase().includes('complete') || c.name.toLowerCase().includes('done')
  );
  const completedTasks = completedColumn
    ? tasks?.filter(t => t.column_id === completedColumn.id).length || 0
    : 0;

  const inProgressColumn = columns?.find(c =>
    c.name.toLowerCase().includes('progress') || c.name.toLowerCase().includes('doing')
  );
  const inProgressTasks = inProgressColumn
    ? tasks?.filter(t => t.column_id === inProgressColumn.id).length || 0
    : 0;

  const highPriorityTasks = tasks?.filter(t => t.priority === 'high').length || 0;

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks: totalTasks - completedTasks - inProgressTasks,
    highPriorityTasks,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    columns: columns?.map(col => ({
      ...col,
      taskCount: tasks?.filter(t => t.column_id === col.id).length || 0,
    })) || [],
  };
};

/**
 * Hook to fetch task metrics for a project
 */
export const useProjectTaskMetrics = (projectId, config) => {
  return useSWR(
    projectId ? ['project-task-metrics', projectId] : null,
    () => projectTaskMetricsFetcher(projectId),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );
};

/**
 * Fetch project timeline data (tasks with dates)
 */
const projectTimelineFetcher = async (projectId) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data: tasks, error } = await supabase
    .from('project_tasks')
    .select(`
      *,
      column:project_columns(name, color),
      assignee:user_profiles!assignee_id(*)
    `)
    .eq('project_id', projectId)
    .not('due_date', 'is', null)
    .order('due_date');

  if (error) throw new Error(error.message);

  return tasks || [];
};

/**
 * Hook to fetch project timeline
 */
export const useProjectTimeline = (projectId, config) => {
  return useSWR(
    projectId ? ['project-timeline', projectId] : null,
    () => projectTimelineFetcher(projectId),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );
};

/**
 * Fetch project deadlines (upcoming due dates)
 */
const projectDeadlinesFetcher = async (projectId) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const today = new Date().toISOString().split('T')[0];

  const { data: tasks, error } = await supabase
    .from('project_tasks')
    .select(`
      id, title, due_date, priority,
      column:project_columns(name),
      assignee:user_profiles!assignee_id(full_name, avatar_url)
    `)
    .eq('project_id', projectId)
    .gte('due_date', today)
    .order('due_date')
    .limit(10);

  if (error) throw new Error(error.message);

  return tasks || [];
};

/**
 * Hook to fetch project deadlines
 */
export const useProjectDeadlines = (projectId, config) => {
  return useSWR(
    projectId ? ['project-deadlines', projectId] : null,
    () => projectDeadlinesFetcher(projectId),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );
};

// ========================================
// Enhanced Dashboard Hooks with Transformers
// ========================================

/**
 * Fetch all tasks and columns for Gantt chart transformation
 */
const projectGanttFetcher = async (projectId) => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Fetch columns
  const { data: columns, error: colError } = await supabase
    .from('project_columns')
    .select('id, name, color, sort_order')
    .eq('project_id', projectId)
    .order('sort_order');

  if (colError) throw new Error(colError.message);

  // Fetch all tasks (not just those with due dates)
  const { data: tasks, error: taskError } = await supabase
    .from('project_tasks')
    .select(`
      id, title, column_id, due_date, created_at, updated_at,
      assignee:user_profiles!assignee_id(full_name, avatar_url)
    `)
    .eq('project_id', projectId)
    .order('sort_order');

  if (taskError) throw new Error(taskError.message);

  return { tasks: tasks || [], columns: columns || [] };
};

/**
 * Hook to fetch project data formatted for Gantt chart
 */
export const useProjectGanttData = (projectId, config) => {
  return useSWR(
    projectId ? ['project-gantt', projectId] : null,
    () => projectGanttFetcher(projectId),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );
};

/**
 * Fetch tasks with completion data for deadline metrics
 */
const projectDeadlineMetricsFetcher = async (projectId) => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Fetch columns
  const { data: columns, error: colError } = await supabase
    .from('project_columns')
    .select('id, name')
    .eq('project_id', projectId);

  if (colError) throw new Error(colError.message);

  // Fetch all tasks with dates
  const { data: tasks, error: taskError } = await supabase
    .from('project_tasks')
    .select('id, column_id, due_date, updated_at')
    .eq('project_id', projectId)
    .not('due_date', 'is', null);

  if (taskError) throw new Error(taskError.message);

  return { tasks: tasks || [], columns: columns || [] };
};

/**
 * Hook to fetch deadline metrics data
 */
export const useProjectDeadlineMetrics = (projectId, config) => {
  return useSWR(
    projectId ? ['project-deadline-metrics', projectId] : null,
    () => projectDeadlineMetricsFetcher(projectId),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );
};

/**
 * Fetch project with tasks and members for roadmap view
 */
const projectRoadmapFetcher = async (projectId) => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Fetch project with nested data
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`
      id, name,
      columns:project_columns(id, name, sort_order),
      tasks:project_tasks(
        id, title, column_id, due_date, priority,
        assignee:user_profiles!assignee_id(id, full_name, email, avatar_url)
      ),
      members:project_members(
        user_id, role,
        user:user_profiles(id, full_name, email, avatar_url)
      )
    `)
    .eq('id', projectId)
    .single();

  if (projectError) throw new Error(projectError.message);

  return project;
};

/**
 * Hook to fetch project roadmap data
 */
export const useProjectRoadmap = (projectId, config) => {
  return useSWR(
    projectId ? ['project-roadmap', projectId] : null,
    () => projectRoadmapFetcher(projectId),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );
};

// ========================================
// Phase 2/3 Hooks (require new database tables)
// ========================================

/**
 * Fetch project meetings with attendees
 * Note: Requires project_meetings and project_meeting_attendees tables
 */
const projectMeetingsFetcher = async (projectId) => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data: meetings, error } = await supabase
    .from('project_meetings')
    .select(`
      id, title, description, start_time, end_time, meeting_link, location,
      attendees:project_meeting_attendees(
        user_id, rsvp_status,
        user:user_profiles(id, full_name, email, avatar_url)
      )
    `)
    .eq('project_id', projectId)
    .gte('start_time', new Date().toISOString())
    .order('start_time')
    .limit(10);

  if (error) {
    // Table might not exist yet - return empty array
    if (error.code === '42P01') return [];
    throw new Error(error.message);
  }

  return meetings || [];
};

/**
 * Hook to fetch project meetings
 */
export const useProjectMeetings = (projectId, config) => {
  return useSWR(
    projectId ? ['project-meetings', projectId] : null,
    () => projectMeetingsFetcher(projectId),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );
};

/**
 * Fetch project events with members
 * Note: Requires project_events and project_event_members tables
 */
const projectEventsFetcher = async (projectId) => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const today = new Date().toISOString().split('T')[0];

  const { data: events, error } = await supabase
    .from('project_events')
    .select(`
      id, title, all_day_event, category, start_date, start_time,
      end_date, end_time, event_type, virtual_link, physical_location,
      notification_minutes, color,
      members:project_event_members(
        user_id,
        user:user_profiles(id, full_name, email, avatar_url)
      )
    `)
    .eq('project_id', projectId)
    .gte('start_date', today)
    .order('start_date')
    .limit(20);

  if (error) {
    // Table might not exist yet - return empty array
    if (error.code === '42P01') return [];
    throw new Error(error.message);
  }

  return events || [];
};

/**
 * Hook to fetch project events
 */
export const useProjectEvents = (projectId, config) => {
  return useSWR(
    projectId ? ['project-events', projectId] : null,
    () => projectEventsFetcher(projectId),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );
};

/**
 * Fetch time entries for hours chart
 * Note: Requires time_entries table
 */
const projectHoursFetcher = async (projectId) => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Get entries for last 9 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 9);

  const { data: entries, error } = await supabase
    .from('time_entries')
    .select('id, hours, date, user_id, description')
    .eq('project_id', projectId)
    .gte('date', ninetyDaysAgo.toISOString().split('T')[0])
    .order('date');

  if (error) {
    // Table might not exist yet - return empty array
    if (error.code === '42P01') return [];
    throw new Error(error.message);
  }

  return entries || [];
};

/**
 * Hook to fetch project hours/time entries
 */
export const useProjectHours = (projectId, config) => {
  return useSWR(
    projectId ? ['project-hours', projectId] : null,
    () => projectHoursFetcher(projectId),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );
};

// ========================================
// Project Kanban Task Mutations
// ========================================

/**
 * Create a new task in a project
 */
const createTaskMutation = async (url, { arg }) => {
  const { projectId, columnId, title, description, priority, dueDate, assigneeId, sortOrder } = arg;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('project_tasks')
    .insert([{
      project_id: projectId,
      column_id: columnId,
      title,
      description: description || null,
      priority: priority || 'medium',
      due_date: dueDate || null,
      assignee_id: assigneeId || null,
      sort_order: sortOrder ?? 0,
      created_by: user.id,
    }])
    .select(`*, assignee:user_profiles!assignee_id(*)`)
    .single();

  if (error) {
    throw new Error(`Failed to create task: ${error.message}`);
  }

  return data;
};

/**
 * Hook to create a new task
 */
export const useCreateProjectTask = (projectId) => {
  return useSWRMutation(
    projectId ? ['create-project-task', projectId] : null,
    createTaskMutation
  );
};

/**
 * Update an existing task
 */
const updateTaskMutation = async (url, { arg }) => {
  const { taskId, updates } = arg;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('project_tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select(`*, assignee:user_profiles!assignee_id(*)`)
    .single();

  if (error) {
    throw new Error(`Failed to update task: ${error.message}`);
  }

  return data;
};

/**
 * Hook to update a task
 */
export const useUpdateProjectTask = (projectId) => {
  return useSWRMutation(
    projectId ? ['update-project-task', projectId] : null,
    updateTaskMutation
  );
};

/**
 * Delete a task
 */
const deleteTaskMutation = async (url, { arg }) => {
  const { taskId } = arg;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { error } = await supabase
    .from('project_tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    throw new Error(`Failed to delete task: ${error.message}`);
  }

  return { taskId };
};

/**
 * Hook to delete a task
 */
export const useDeleteProjectTask = (projectId) => {
  return useSWRMutation(
    projectId ? ['delete-project-task', projectId] : null,
    deleteTaskMutation
  );
};

/**
 * Move a task to a different column and/or position
 */
const moveTaskMutation = async (url, { arg }) => {
  const { taskId, columnId, sortOrder } = arg;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('project_tasks')
    .update({
      column_id: columnId,
      sort_order: sortOrder,
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId)
    .select(`*, assignee:user_profiles!assignee_id(*)`)
    .single();

  if (error) {
    throw new Error(`Failed to move task: ${error.message}`);
  }

  return data;
};

/**
 * Hook to move a task
 */
export const useMoveProjectTask = (projectId) => {
  return useSWRMutation(
    projectId ? ['move-project-task', projectId] : null,
    moveTaskMutation
  );
};

/**
 * Batch update task positions (for drag-drop reordering)
 */
const reorderTasksMutation = async (url, { arg }) => {
  const { tasks } = arg; // Array of { id, column_id, sort_order }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Update each task's position
  const updates = tasks.map(task =>
    supabase
      .from('project_tasks')
      .update({ column_id: task.column_id, sort_order: task.sort_order })
      .eq('id', task.id)
  );

  const results = await Promise.all(updates);
  const errors = results.filter(r => r.error);

  if (errors.length > 0) {
    throw new Error(`Failed to reorder tasks: ${errors[0].error.message}`);
  }

  return { success: true };
};

/**
 * Hook to reorder tasks
 */
export const useReorderProjectTasks = (projectId) => {
  return useSWRMutation(
    projectId ? ['reorder-project-tasks', projectId] : null,
    reorderTasksMutation
  );
};

// ========================================
// Project Kanban Column Mutations
// ========================================

/**
 * Create a new column in a project
 */
const createColumnMutation = async (url, { arg }) => {
  const { projectId, name, color, cardLimit, sortOrder } = arg;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('project_columns')
    .insert([{
      project_id: projectId,
      name,
      color: color || '#3498db',
      card_limit: cardLimit || 20,
      sort_order: sortOrder ?? 0,
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create column: ${error.message}`);
  }

  return data;
};

/**
 * Hook to create a new column
 */
export const useCreateProjectColumn = (projectId) => {
  return useSWRMutation(
    projectId ? ['create-project-column', projectId] : null,
    createColumnMutation
  );
};

/**
 * Update a column
 */
const updateColumnMutation = async (url, { arg }) => {
  const { columnId, updates } = arg;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('project_columns')
    .update(updates)
    .eq('id', columnId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update column: ${error.message}`);
  }

  return data;
};

/**
 * Hook to update a column
 */
export const useUpdateProjectColumn = (projectId) => {
  return useSWRMutation(
    projectId ? ['update-project-column', projectId] : null,
    updateColumnMutation
  );
};

/**
 * Delete a column
 */
const deleteColumnMutation = async (url, { arg }) => {
  const { columnId } = arg;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { error } = await supabase
    .from('project_columns')
    .delete()
    .eq('id', columnId);

  if (error) {
    throw new Error(`Failed to delete column: ${error.message}`);
  }

  return { columnId };
};

/**
 * Hook to delete a column
 */
export const useDeleteProjectColumn = (projectId) => {
  return useSWRMutation(
    projectId ? ['delete-project-column', projectId] : null,
    deleteColumnMutation
  );
};

/**
 * Reorder columns
 */
const reorderColumnsMutation = async (url, { arg }) => {
  const { columns } = arg; // Array of { id, sort_order }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const updates = columns.map(col =>
    supabase
      .from('project_columns')
      .update({ sort_order: col.sort_order })
      .eq('id', col.id)
  );

  const results = await Promise.all(updates);
  const errors = results.filter(r => r.error);

  if (errors.length > 0) {
    throw new Error(`Failed to reorder columns: ${errors[0].error.message}`);
  }

  return { success: true };
};

/**
 * Hook to reorder columns
 */
export const useReorderProjectColumns = (projectId) => {
  return useSWRMutation(
    projectId ? ['reorder-project-columns', projectId] : null,
    reorderColumnsMutation
  );
};

// ========================================
// Seed Functions (Development Only)
// ========================================

/**
 * Seed columns and tasks for a project (if none exist)
 * Call this to populate sample data for testing
 */
const seedProjectData = async ({ projectId }) => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Check if project already has columns
  const { data: existingCols } = await supabase
    .from('project_columns')
    .select('id')
    .eq('project_id', projectId)
    .limit(1);

  if (existingCols?.length > 0) {
    return { message: 'Project already has columns - skipping seed' };
  }

  // Create columns
  const columnDefs = [
    { name: 'To Do', color: '#3498db', sort_order: 0 },
    { name: 'In Progress', color: '#f39c12', sort_order: 1 },
    { name: 'Review', color: '#9b59b6', sort_order: 2 },
    { name: 'Done', color: '#27ae60', sort_order: 3 },
  ];

  const columnsToInsert = columnDefs.map((col) => ({
    project_id: projectId,
    ...col,
  }));

  const { data: insertedCols, error: colError } = await supabase
    .from('project_columns')
    .insert(columnsToInsert)
    .select('id, name');

  if (colError) {
    throw new Error(`Failed to create columns: ${colError.message}`);
  }

  // Create column lookup
  const colLookup = {};
  insertedCols.forEach((col) => {
    colLookup[col.name] = col.id;
  });

  // Create sample tasks
  const taskDefs = [
    { title: 'Research phase', column: 'To Do', daysOffset: 7 },
    { title: 'Gather requirements', column: 'To Do', daysOffset: 5 },
    { title: 'Design mockups', column: 'In Progress', daysOffset: 10 },
    { title: 'Implement core features', column: 'In Progress', daysOffset: 14 },
    { title: 'Code review', column: 'Review', daysOffset: 3 },
    { title: 'Write documentation', column: 'Review', daysOffset: 4 },
    { title: 'Deploy to staging', column: 'Done', daysOffset: -2 },
    { title: 'QA testing complete', column: 'Done', daysOffset: -5 },
  ];

  const now = new Date();
  const tasksToInsert = taskDefs.map((task, index) => {
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + task.daysOffset);

    const createdDate = new Date(now);
    createdDate.setDate(createdDate.getDate() - (8 - index));

    return {
      project_id: projectId,
      column_id: colLookup[task.column],
      title: task.title,
      sort_order: index,
      due_date: dueDate.toISOString().split('T')[0],
      created_at: createdDate.toISOString(),
    };
  });

  const { data: insertedTasks, error: taskError } = await supabase
    .from('project_tasks')
    .insert(tasksToInsert)
    .select('id');

  if (taskError) {
    throw new Error(`Failed to create tasks: ${taskError.message}`);
  }

  return {
    message: 'Seed complete',
    columnsCreated: insertedCols.length,
    tasksCreated: insertedTasks.length,
  };
};

/**
 * Hook to seed project data (development only)
 */
export const useSeedProjectData = () => {
  return useSWRMutation('seed-project', (_, { arg }) => seedProjectData(arg));
};
