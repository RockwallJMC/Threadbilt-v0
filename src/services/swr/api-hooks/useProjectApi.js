'use client';

import createClient from 'lib/supabase/client';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

/**
 * Fetcher function for all projects
 * @param {Object|null} filters - Optional filters { status, search, priority }
 * @returns {Promise<Array>} Array of project objects
 */
const projectsFetcher = async (filters = null) => {
  const supabase = createClient();
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
  const supabase = createClient();
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
  const supabase = createClient();
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
      members:project_members(*, user:user_profiles(*)),
      tasks:project_tasks(*, assignee:user_profiles(*))
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch project ${id}: ${error.message}`);
  }

  return data;
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
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Get user's organization
  const { data: orgMember, error: orgError } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

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
  return useSWRMutation('create-project', createProjectMutation, {
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });
};

/**
 * Update project mutation
 */
const updateProjectMutation = async (url, { arg }) => {
  const { id, updates } = arg;
  const supabase = createClient();
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
  const supabase = createClient();
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
  const supabase = createClient();

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
  const supabase = createClient();
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
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data: tasks, error } = await supabase
    .from('project_tasks')
    .select(`
      *,
      column:project_columns(name, color),
      assignee:user_profiles(*)
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
  const supabase = createClient();
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
      assignee:user_profiles(full_name, avatar_url)
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
