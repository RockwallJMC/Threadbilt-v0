'use client';

import { supabase } from 'lib/supabase/client';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

// ============================================================================
// FETCHERS - Query Supabase directly with RLS
// ============================================================================

/**
 * Fetcher function for full kanban board data (project + columns + tasks)
 *
 * @param {string} projectId - The project ID
 * @returns {Promise<Object>} Full kanban board data with nested columns and tasks
 */
const kanbanFetcher = async (projectId) => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Fetch project with all nested relationships
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_manager:user_profiles!project_manager_id(*),
      members:project_members(*, user:user_profiles!user_id(*)),
      columns:project_columns(
        *,
        tasks:project_tasks(
          *,
          assignee:user_profiles!assignee_id(*),
          label:project_labels!project_tasks_label_id_fkey(*)
        )
      ),
      labels:project_labels(*)
    `)
    .eq('id', projectId)
    .is('deleted_at', null)
    .single();

  if (error) {
    throw new Error(`Failed to fetch kanban board: ${error.message}`);
  }

  return data;
};

// ============================================================================
// READ HOOKS - useSWR for caching
// ============================================================================

/**
 * Hook to fetch full kanban board data for a project
 *
 * @param {string} projectId - The project ID
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with kanban board data
 *
 * @example
 * const { data: kanban, error, isLoading, mutate } = useProjectKanban('project_001');
 */
export const useProjectKanban = (projectId, config) => {
  return useSWR(
    projectId ? ['project-kanban', projectId] : null,
    () => kanbanFetcher(projectId),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );
};

// ============================================================================
// TASK MUTATION HOOKS - useSWRMutation for create/update/delete
// ============================================================================

/**
 * Create a new task in a project column
 *
 * @example
 * const { trigger: createTask, isMutating } = useCreateTask('project_001');
 * const newTask = await createTask({
 *   columnId: 'column_001',
 *   title: 'Design homepage',
 *   description: 'Create wireframes and mockups',
 *   priority: 'high',
 *   dueDate: '2025-03-01',
 *   assigneeId: 'user_001',
 *   sortOrder: 0
 * });
 */
export const useCreateTask = (projectId) => {
  return useSWRMutation(
    projectId ? ['create-task', projectId] : null,
    async (key, { arg }) => {
      const { columnId, title, description, priority, dueDate, assigneeId, labelId, sortOrder, coverImage } = arg;

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
          label_id: labelId || null,
          cover_image_url: coverImage || null,
          sort_order: sortOrder ?? 0,
          created_by: user.id,
        }])
        .select(`
          *,
          assignee:user_profiles!assignee_id(*),
          label:project_labels!project_tasks_label_id_fkey(*)
        `)
        .single();

      if (error) {
        throw new Error(`Failed to create task: ${error.message}`);
      }

      return data;
    },
    {
      populateCache: false,
      revalidate: true,
    }
  );
};

/**
 * Update an existing task
 *
 * @example
 * const { trigger: updateTask } = useUpdateTask('project_001');
 * await updateTask({
 *   taskId: 'task_001',
 *   updates: { title: 'Updated title', priority: 'high' }
 * });
 */
export const useUpdateTask = (projectId) => {
  return useSWRMutation(
    projectId ? ['update-task', projectId] : null,
    async (key, { arg }) => {
      const { taskId, updates } = arg;

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(authError?.message || 'Not authenticated');
      }

      const { data, error } = await supabase
        .from('project_tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', taskId)
        .select(`
          *,
          assignee:user_profiles!assignee_id(*),
          label:project_labels!project_tasks_label_id_fkey(*)
        `)
        .single();

      if (error) {
        throw new Error(`Failed to update task: ${error.message}`);
      }

      return data;
    },
    {
      populateCache: false,
      revalidate: true,
    }
  );
};

/**
 * Move a task to a different column and/or position
 *
 * @example
 * const { trigger: moveTask } = useMoveTask('project_001');
 * await moveTask({
 *   taskId: 'task_001',
 *   columnId: 'column_002',
 *   sortOrder: 3
 * });
 */
export const useMoveTask = (projectId) => {
  return useSWRMutation(
    projectId ? ['move-task', projectId] : null,
    async (key, { arg }) => {
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
        .select(`
          *,
          assignee:user_profiles!assignee_id(*),
          label:project_labels!project_tasks_label_id_fkey(*)
        `)
        .single();

      if (error) {
        throw new Error(`Failed to move task: ${error.message}`);
      }

      return data;
    },
    {
      populateCache: false,
      revalidate: true,
    }
  );
};

/**
 * Delete a task (hard delete)
 *
 * @example
 * const { trigger: deleteTask } = useDeleteTask('project_001');
 * await deleteTask({ taskId: 'task_001' });
 */
export const useDeleteTask = (projectId) => {
  return useSWRMutation(
    projectId ? ['delete-task', projectId] : null,
    async (key, { arg }) => {
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
    },
    {
      populateCache: false,
      revalidate: true,
    }
  );
};

/**
 * Batch update task positions (for drag-drop reordering within same column)
 *
 * @example
 * const { trigger: reorderTasks } = useReorderTasks('project_001');
 * await reorderTasks({
 *   tasks: [
 *     { id: 'task_001', column_id: 'col_001', sort_order: 0 },
 *     { id: 'task_002', column_id: 'col_001', sort_order: 1 },
 *   ]
 * });
 */
export const useReorderTasks = (projectId) => {
  return useSWRMutation(
    projectId ? ['reorder-tasks', projectId] : null,
    async (key, { arg }) => {
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
    },
    {
      populateCache: false,
      revalidate: true,
    }
  );
};

// ============================================================================
// COLUMN MUTATION HOOKS
// ============================================================================

/**
 * Create a new column in the project
 *
 * @example
 * const { trigger: createColumn } = useCreateColumn('project_001');
 * const newColumn = await createColumn({
 *   name: 'In Review',
 *   color: '#9b59b6',
 *   cardLimit: 10,
 *   sortOrder: 2
 * });
 */
export const useCreateColumn = (projectId) => {
  return useSWRMutation(
    projectId ? ['create-column', projectId] : null,
    async (key, { arg }) => {
      const { name, color, cardLimit, sortOrder } = arg;

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
    },
    {
      populateCache: false,
      revalidate: true,
    }
  );
};

/**
 * Update a column's properties
 *
 * @example
 * const { trigger: updateColumn } = useUpdateColumn('project_001');
 * await updateColumn({
 *   columnId: 'column_001',
 *   updates: { name: 'Completed', card_limit: 30 }
 * });
 */
export const useUpdateColumn = (projectId) => {
  return useSWRMutation(
    projectId ? ['update-column', projectId] : null,
    async (key, { arg }) => {
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
    },
    {
      populateCache: false,
      revalidate: true,
    }
  );
};

/**
 * Delete a column (will cascade delete all tasks in the column)
 *
 * @example
 * const { trigger: deleteColumn } = useDeleteColumn('project_001');
 * await deleteColumn({ columnId: 'column_001' });
 */
export const useDeleteColumn = (projectId) => {
  return useSWRMutation(
    projectId ? ['delete-column', projectId] : null,
    async (key, { arg }) => {
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
    },
    {
      populateCache: false,
      revalidate: true,
    }
  );
};

/**
 * Reorder columns (batch update sort_order)
 *
 * @example
 * const { trigger: reorderColumns } = useReorderColumns('project_001');
 * await reorderColumns({
 *   columns: [
 *     { id: 'col_001', sort_order: 0 },
 *     { id: 'col_002', sort_order: 1 },
 *     { id: 'col_003', sort_order: 2 }
 *   ]
 * });
 */
export const useReorderColumns = (projectId) => {
  return useSWRMutation(
    projectId ? ['reorder-columns', projectId] : null,
    async (key, { arg }) => {
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
    },
    {
      populateCache: false,
      revalidate: true,
    }
  );
};

// ============================================================================
// TASK ASSIGNEE MUTATION HOOKS
// ============================================================================

/**
 * Add an assignee to a task
 * Note: This assumes a project_task_assignees junction table exists
 * If using single assignee (assignee_id column), use useUpdateTask instead
 *
 * @example
 * const { trigger: addAssignee } = useAddTaskAssignee('project_001');
 * await addAssignee({
 *   taskId: 'task_001',
 *   userId: 'user_002'
 * });
 */
export const useAddTaskAssignee = (projectId) => {
  return useSWRMutation(
    projectId ? ['add-task-assignee', projectId] : null,
    async (key, { arg }) => {
      const { taskId, userId } = arg;

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(authError?.message || 'Not authenticated');
      }

      // Check if junction table exists, otherwise fall back to updating assignee_id
      const { data, error } = await supabase
        .from('project_task_assignees')
        .insert([{
          task_id: taskId,
          user_id: userId,
        }])
        .select(`
          *,
          user:user_profiles!user_id(*)
        `)
        .single();

      if (error) {
        // If table doesn't exist (42P01), fall back to single assignee update
        if (error.code === '42P01') {
          const { data: taskData, error: updateError } = await supabase
            .from('project_tasks')
            .update({ assignee_id: userId })
            .eq('id', taskId)
            .select(`
              *,
              assignee:user_profiles!assignee_id(*)
            `)
            .single();

          if (updateError) {
            throw new Error(`Failed to add assignee: ${updateError.message}`);
          }

          return taskData;
        }

        throw new Error(`Failed to add assignee: ${error.message}`);
      }

      return data;
    },
    {
      populateCache: false,
      revalidate: true,
    }
  );
};

/**
 * Remove an assignee from a task
 * Note: This assumes a project_task_assignees junction table exists
 * If using single assignee (assignee_id column), use useUpdateTask with assignee_id: null
 *
 * @example
 * const { trigger: removeAssignee } = useRemoveTaskAssignee('project_001');
 * await removeAssignee({
 *   taskId: 'task_001',
 *   userId: 'user_002'
 * });
 */
export const useRemoveTaskAssignee = (projectId) => {
  return useSWRMutation(
    projectId ? ['remove-task-assignee', projectId] : null,
    async (key, { arg }) => {
      const { taskId, userId } = arg;

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(authError?.message || 'Not authenticated');
      }

      // Check if junction table exists, otherwise fall back to clearing assignee_id
      const { error } = await supabase
        .from('project_task_assignees')
        .delete()
        .eq('task_id', taskId)
        .eq('user_id', userId);

      if (error) {
        // If table doesn't exist (42P01), fall back to clearing single assignee
        if (error.code === '42P01') {
          const { error: updateError } = await supabase
            .from('project_tasks')
            .update({ assignee_id: null })
            .eq('id', taskId)
            .eq('assignee_id', userId);

          if (updateError) {
            throw new Error(`Failed to remove assignee: ${updateError.message}`);
          }

          return { success: true };
        }

        throw new Error(`Failed to remove assignee: ${error.message}`);
      }

      return { success: true };
    },
    {
      populateCache: false,
      revalidate: true,
    }
  );
};

// ============================================================================
// LABEL MUTATION HOOKS
// ============================================================================

/**
 * Create a new label for the project
 *
 * @example
 * const { trigger: createLabel } = useCreateLabel('project_001');
 * const newLabel = await createLabel({
 *   name: 'Bug',
 *   color: '#e74c3c'
 * });
 */
export const useCreateLabel = (projectId) => {
  return useSWRMutation(
    projectId ? ['create-label', projectId] : null,
    async (key, { arg }) => {
      const { name, color } = arg;

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(authError?.message || 'Not authenticated');
      }

      const { data, error } = await supabase
        .from('project_labels')
        .insert([{
          project_id: projectId,
          name,
          color: color || '#3498db',
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create label: ${error.message}`);
      }

      return data;
    },
    {
      populateCache: false,
      revalidate: true,
    }
  );
};

/**
 * Update a label's properties
 *
 * @example
 * const { trigger: updateLabel } = useUpdateLabel('project_001');
 * await updateLabel({
 *   labelId: 'label_001',
 *   updates: { name: 'Critical Bug', color: '#c0392b' }
 * });
 */
export const useUpdateLabel = (projectId) => {
  return useSWRMutation(
    projectId ? ['update-label', projectId] : null,
    async (key, { arg }) => {
      const { labelId, updates } = arg;

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(authError?.message || 'Not authenticated');
      }

      const { data, error } = await supabase
        .from('project_labels')
        .update(updates)
        .eq('id', labelId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update label: ${error.message}`);
      }

      return data;
    },
    {
      populateCache: false,
      revalidate: true,
    }
  );
};

/**
 * Delete a label
 *
 * @example
 * const { trigger: deleteLabel } = useDeleteLabel('project_001');
 * await deleteLabel({ labelId: 'label_001' });
 */
export const useDeleteLabel = (projectId) => {
  return useSWRMutation(
    projectId ? ['delete-label', projectId] : null,
    async (key, { arg }) => {
      const { labelId } = arg;

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(authError?.message || 'Not authenticated');
      }

      const { error } = await supabase
        .from('project_labels')
        .delete()
        .eq('id', labelId);

      if (error) {
        throw new Error(`Failed to delete label: ${error.message}`);
      }

      return { labelId };
    },
    {
      populateCache: false,
      revalidate: true,
    }
  );
};
