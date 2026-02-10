/**
 * Project Kanban Data Transformers
 *
 * Transform database records from Supabase into the shapes expected by KanbanProvider and UI components.
 * These functions bridge the gap between raw DB data and UI component requirements.
 */

/**
 * Transform database kanban response to UI format expected by KanbanProvider
 *
 * Converts Supabase project data with nested columns/tasks into the format
 * used by the Kanban board UI components.
 *
 * @param {Object} dbData - Raw project data from Supabase with nested columns and tasks
 * @returns {Object|null} Formatted kanban board data for UI
 *
 * @example
 * const { data: dbData } = await supabase.from('projects').select('...').single();
 * const kanbanData = transformKanbanResponse(dbData);
 * // kanbanData = {
 * //   id: 'project_001',
 * //   name: 'Website Redesign',
 * //   backgroundOption: { type: 'color', background: { src: '#667eea' } },
 * //   assignee: [{ name: 'John Doe', avatar: 'https://...' }],
 * //   listItems: [{ id: 'col_001', title: 'To Do', tasks: [...] }]
 * // }
 */
export function transformKanbanResponse(dbData) {
  if (!dbData) return null;

  // Determine background type and value
  const backgroundOption = {
    type: dbData.background_image ? 'image' : 'color',
    background: {
      src: dbData.background_image ||
           dbData.background_color ||
           'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  };

  // Transform project members to assignee format
  const assignee = (dbData.members || []).map(m => ({
    id: m.user_id,
    name: m.user?.full_name || m.user?.email || 'Unknown',
    avatar: m.user?.avatar_url,
    role: m.role,
  }));

  // Transform columns and nested tasks
  const listItems = (dbData.columns || [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(col => ({
      id: col.id,
      title: col.name,
      color: col.color,
      cardLimit: col.card_limit,
      compactMode: false,
      tasks: (col.tasks || [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(task => transformTask(task))
    }));

  return {
    id: dbData.id,
    name: dbData.name,
    description: dbData.description,
    backgroundOption,
    assignee,
    listItems,
    labels: dbData.labels || [],
    projectManager: dbData.project_manager ? {
      id: dbData.project_manager.id,
      name: dbData.project_manager.full_name || dbData.project_manager.email,
      avatar: dbData.project_manager.avatar_url,
    } : null,
  };
}

/**
 * Transform a single task from DB to UI format
 *
 * Converts raw database task record into format expected by KanbanCard component.
 *
 * @param {Object} task - Raw task data from database
 * @returns {Object} Formatted task for KanbanCard
 *
 * @example
 * const uiTask = transformTask(dbTask);
 * // uiTask = {
 * //   id: 'task_001',
 * //   title: 'Design homepage',
 * //   label: 'Design',
 * //   labelColor: '#9b59b6',
 * //   progress: { total: 4, completed: 2, showBar: true },
 * //   assignee: [{ name: 'Jane', avatar: '...' }]
 * // }
 */
export function transformTask(task) {
  // Handle subtasks - check if they exist as a separate table or JSON field
  const subtasks = task.subtasks || [];
  const completedCount = subtasks.filter(s => s.checked).length;
  const totalCount = subtasks.length;

  // Build assignee array (handles single or multiple assignees)
  const assignee = [];

  // Single assignee (assignee_id column)
  if (task.assignee) {
    assignee.push({
      id: task.assignee.id,
      name: task.assignee.full_name || task.assignee.email || 'Unknown',
      avatar: task.assignee.avatar_url,
    });
  }

  // Multiple assignees (if project_task_assignees junction table exists)
  if (task.assignees && Array.isArray(task.assignees)) {
    task.assignees.forEach(a => {
      if (a.user) {
        assignee.push({
          id: a.user.id,
          name: a.user.full_name || a.user.email || 'Unknown',
          avatar: a.user.avatar_url,
        });
      }
    });
  }

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    label: task.label?.name,
    labelColor: task.label?.color,
    coverImage: task.cover_image_url,
    dueDate: task.due_date,
    priority: task.priority,
    completed: task.completed,
    attachmentCount: task.attachment_count || 0,
    assignee,
    progress: totalCount > 0 ? {
      total: totalCount,
      completed: completedCount,
      showBar: true,
      showData: true
    } : null,
    subtasks: subtasks.map(s => ({
      id: s.id,
      title: s.title,
      checked: s.checked,
      position: s.position || s.sort_order,
    })),
    // Preserve original DB fields for mutations
    columnId: task.column_id,
    sortOrder: task.sort_order,
  };
}

/**
 * Transform UI task data back to DB format for updates
 *
 * Converts task data from KanbanCard component back to database schema.
 * Use this when updating tasks via mutations.
 *
 * @param {Object} uiTask - Task data from UI component
 * @returns {Object} Database-compatible task update object
 *
 * @example
 * const updates = transformTaskForUpdate(uiTask);
 * await updateTask({ taskId: uiTask.id, updates });
 */
export function transformTaskForUpdate(uiTask) {
  const updates = {
    title: uiTask.title,
    description: uiTask.description,
    priority: uiTask.priority,
    due_date: uiTask.dueDate,
    completed: uiTask.completed,
    cover_image_url: uiTask.coverImage,
  };

  // Only include label_id if it exists
  if (uiTask.labelId !== undefined) {
    updates.label_id = uiTask.labelId;
  }

  // Only include assignee_id if using single assignee model
  if (uiTask.assigneeId !== undefined) {
    updates.assignee_id = uiTask.assigneeId;
  }

  return updates;
}

/**
 * Transform column data from UI to DB format
 *
 * @param {Object} uiColumn - Column data from UI
 * @returns {Object} Database-compatible column object
 */
export function transformColumnForUpdate(uiColumn) {
  return {
    name: uiColumn.title,
    color: uiColumn.color,
    card_limit: uiColumn.cardLimit,
    sort_order: uiColumn.sortOrder,
  };
}

/**
 * Calculate kanban board statistics
 *
 * Generates summary statistics for dashboard KPI cards.
 *
 * @param {Object} kanbanData - Transformed kanban data from transformKanbanResponse
 * @returns {Object} Board statistics
 *
 * @example
 * const stats = calculateKanbanStats(kanbanData);
 * // stats = {
 * //   totalTasks: 24,
 * //   completedTasks: 8,
 * //   inProgressTasks: 10,
 * //   todoTasks: 6,
 * //   completionRate: 33
 * // }
 */
export function calculateKanbanStats(kanbanData) {
  if (!kanbanData || !kanbanData.listItems) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      todoTasks: 0,
      completionRate: 0,
    };
  }

  let totalTasks = 0;
  let completedTasks = 0;
  let inProgressTasks = 0;

  kanbanData.listItems.forEach(column => {
    const tasks = column.tasks || [];
    totalTasks += tasks.length;

    const columnName = column.title.toLowerCase();

    if (columnName.includes('done') || columnName.includes('complete')) {
      completedTasks += tasks.length;
    } else if (columnName.includes('progress') || columnName.includes('doing')) {
      inProgressTasks += tasks.length;
    }
  });

  const todoTasks = totalTasks - completedTasks - inProgressTasks;
  const completionRate = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    completionRate,
  };
}

/**
 * Group tasks by assignee
 *
 * Creates a map of tasks grouped by their assignee for workload views.
 *
 * @param {Object} kanbanData - Transformed kanban data
 * @returns {Object} Tasks grouped by assignee
 *
 * @example
 * const tasksByUser = groupTasksByAssignee(kanbanData);
 * // tasksByUser = {
 * //   'user_001': [task1, task2, ...],
 * //   'user_002': [task3, task4, ...],
 * //   'unassigned': [task5, ...]
 * // }
 */
export function groupTasksByAssignee(kanbanData) {
  if (!kanbanData || !kanbanData.listItems) {
    return { unassigned: [] };
  }

  const tasksByUser = {};

  kanbanData.listItems.forEach(column => {
    (column.tasks || []).forEach(task => {
      if (task.assignee && task.assignee.length > 0) {
        task.assignee.forEach(user => {
          if (!tasksByUser[user.id]) {
            tasksByUser[user.id] = {
              user,
              tasks: [],
            };
          }
          tasksByUser[user.id].tasks.push({
            ...task,
            columnTitle: column.title,
            columnColor: column.color,
          });
        });
      } else {
        if (!tasksByUser.unassigned) {
          tasksByUser.unassigned = {
            user: { id: 'unassigned', name: 'Unassigned', avatar: null },
            tasks: [],
          };
        }
        tasksByUser.unassigned.tasks.push({
          ...task,
          columnTitle: column.title,
          columnColor: column.color,
        });
      }
    });
  });

  return tasksByUser;
}

/**
 * Group tasks by priority
 *
 * @param {Object} kanbanData - Transformed kanban data
 * @returns {Object} Tasks grouped by priority (high, medium, low)
 */
export function groupTasksByPriority(kanbanData) {
  if (!kanbanData || !kanbanData.listItems) {
    return { high: [], medium: [], low: [] };
  }

  const tasksByPriority = {
    high: [],
    medium: [],
    low: [],
  };

  kanbanData.listItems.forEach(column => {
    (column.tasks || []).forEach(task => {
      const priority = task.priority || 'medium';
      if (tasksByPriority[priority]) {
        tasksByPriority[priority].push({
          ...task,
          columnTitle: column.title,
          columnColor: column.color,
        });
      }
    });
  });

  return tasksByPriority;
}

/**
 * Get upcoming deadlines from kanban board
 *
 * Finds all tasks with due dates in the next N days, sorted by date.
 *
 * @param {Object} kanbanData - Transformed kanban data
 * @param {number} daysAhead - Number of days to look ahead (default: 7)
 * @returns {Array} Tasks with upcoming deadlines
 *
 * @example
 * const upcomingTasks = getUpcomingDeadlines(kanbanData, 7);
 * // upcomingTasks = [
 * //   { task: {...}, daysUntilDue: 2, columnTitle: 'In Progress' },
 * //   { task: {...}, daysUntilDue: 5, columnTitle: 'To Do' }
 * // ]
 */
export function getUpcomingDeadlines(kanbanData, daysAhead = 7) {
  if (!kanbanData || !kanbanData.listItems) {
    return [];
  }

  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const upcomingTasks = [];

  kanbanData.listItems.forEach(column => {
    (column.tasks || []).forEach(task => {
      if (!task.dueDate) return;

      const dueDate = new Date(task.dueDate);

      if (dueDate >= now && dueDate <= futureDate) {
        const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

        upcomingTasks.push({
          task,
          daysUntilDue,
          columnTitle: column.title,
          columnColor: column.color,
        });
      }
    });
  });

  // Sort by days until due (ascending)
  return upcomingTasks.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}

/**
 * Get overdue tasks from kanban board
 *
 * @param {Object} kanbanData - Transformed kanban data
 * @returns {Array} Overdue tasks
 */
export function getOverdueTasks(kanbanData) {
  if (!kanbanData || !kanbanData.listItems) {
    return [];
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start of today

  const overdueTasks = [];

  // Skip completed columns
  const completedColumnNames = ['done', 'complete', 'completed', 'finished'];

  kanbanData.listItems.forEach(column => {
    const isCompletedColumn = completedColumnNames.some(name =>
      column.title.toLowerCase().includes(name)
    );

    if (isCompletedColumn) return;

    (column.tasks || []).forEach(task => {
      if (!task.dueDate) return;

      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < now) {
        const daysOverdue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));

        overdueTasks.push({
          task,
          daysOverdue,
          columnTitle: column.title,
          columnColor: column.color,
        });
      }
    });
  });

  // Sort by days overdue (descending - most overdue first)
  return overdueTasks.sort((a, b) => b.daysOverdue - a.daysOverdue);
}

/**
 * Transform kanban data for export (CSV, JSON, etc.)
 *
 * Flattens nested structure for export formats.
 *
 * @param {Object} kanbanData - Transformed kanban data
 * @returns {Array} Flattened task records for export
 */
export function transformKanbanForExport(kanbanData) {
  if (!kanbanData || !kanbanData.listItems) {
    return [];
  }

  const exportData = [];

  kanbanData.listItems.forEach(column => {
    (column.tasks || []).forEach(task => {
      exportData.push({
        projectId: kanbanData.id,
        projectName: kanbanData.name,
        columnId: column.id,
        columnName: column.title,
        taskId: task.id,
        taskTitle: task.title,
        taskDescription: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        completed: task.completed,
        label: task.label,
        assignees: task.assignee.map(a => a.name).join(', '),
        subtasksTotal: task.progress?.total || 0,
        subtasksCompleted: task.progress?.completed || 0,
        attachmentCount: task.attachmentCount || 0,
      });
    });
  });

  return exportData;
}
