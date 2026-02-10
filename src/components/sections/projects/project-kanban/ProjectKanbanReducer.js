import { arrayMove } from '@dnd-kit/sortable';

// Action types
export const DRAG_START = 'DRAG_START';
export const DRAG_END = 'DRAG_END';
export const DRAG_OVER = 'DRAG_OVER';
export const SET_PROJECT = 'SET_PROJECT';
export const SET_COLUMNS = 'SET_COLUMNS';
export const SET_TASKS = 'SET_TASKS';
export const ADD_TASK = 'ADD_TASK';
export const UPDATE_TASK = 'UPDATE_TASK';
export const DELETE_TASK = 'DELETE_TASK';
export const MOVE_TASK = 'MOVE_TASK';
export const ADD_COLUMN = 'ADD_COLUMN';
export const UPDATE_COLUMN = 'UPDATE_COLUMN';
export const DELETE_COLUMN = 'DELETE_COLUMN';
export const SET_ACTIVE_TASK = 'SET_ACTIVE_TASK';
export const TOGGLE_TASK_DRAWER = 'TOGGLE_TASK_DRAWER';
export const TOGGLE_ADD_TASK_DIALOG = 'TOGGLE_ADD_TASK_DIALOG';
export const TOGGLE_ADD_COLUMN_DIALOG = 'TOGGLE_ADD_COLUMN_DIALOG';

/**
 * Find which column a task belongs to
 */
const findColumnByTaskId = (taskId, columns, tasks) => {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    return columns.find(c => c.id === task.column_id) || null;
  }
  return null;
};

/**
 * Find a column by ID
 */
const findColumnById = (columnId, columns) => {
  return columns.find(c => c.id === columnId) || null;
};

/**
 * Get tasks for a specific column, sorted by sort_order
 */
const getColumnTasks = (columnId, tasks) => {
  return tasks
    .filter(t => t.column_id === columnId)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
};

export const projectKanbanReducer = (state, action) => {
  switch (action.type) {
    case SET_PROJECT: {
      return {
        ...state,
        project: action.payload,
      };
    }

    case SET_COLUMNS: {
      return {
        ...state,
        columns: action.payload.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
      };
    }

    case SET_TASKS: {
      return {
        ...state,
        tasks: action.payload,
      };
    }

    case DRAG_START: {
      const { type, item } = action.payload;
      if (type === 'task') {
        return { ...state, draggedTask: item };
      }
      if (type === 'column') {
        return { ...state, draggedColumn: item };
      }
      return state;
    }

    case DRAG_OVER: {
      const { activeId, overId, activeRect, overRect } = action.payload;

      // Find which column the active task is in
      const activeTask = state.tasks.find(t => t.id === activeId);
      if (!activeTask) return state;

      // Check if we're dragging over a column or a task
      const overColumn = state.columns.find(c => c.id === overId);
      const overTask = state.tasks.find(t => t.id === overId);

      if (!overColumn && !overTask) return state;

      const targetColumnId = overColumn ? overColumn.id : overTask?.column_id;
      if (!targetColumnId) return state;

      // If already in the same column and no position change needed, skip
      if (activeTask.column_id === targetColumnId && !overTask) {
        return state;
      }

      // Get tasks in target column
      const targetColumnTasks = getColumnTasks(targetColumnId, state.tasks);

      // Calculate new position
      let newIndex = 0;
      if (overTask) {
        const overIndex = targetColumnTasks.findIndex(t => t.id === overId);
        newIndex = overIndex >= 0
          ? overIndex + (activeRect && overRect && activeRect.top > overRect.top + overRect.height / 2 ? 1 : 0)
          : 0;
      }

      // Remove task from old position and add to new
      const updatedTasks = state.tasks.map(t => {
        if (t.id === activeId) {
          return { ...t, column_id: targetColumnId, sort_order: newIndex };
        }
        // Adjust sort orders in target column
        if (t.column_id === targetColumnId && t.id !== activeId) {
          const currentIndex = targetColumnTasks.findIndex(ct => ct.id === t.id);
          if (currentIndex >= newIndex) {
            return { ...t, sort_order: (t.sort_order || 0) + 1 };
          }
        }
        return t;
      });

      return {
        ...state,
        tasks: updatedTasks,
      };
    }

    case DRAG_END: {
      const { activeId, overId } = action.payload;

      // Handle column reordering
      if (state.draggedColumn) {
        const activeIndex = state.columns.findIndex(c => c.id === activeId);
        const overIndex = state.columns.findIndex(c => c.id === overId);

        if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
          const reorderedColumns = arrayMove(state.columns, activeIndex, overIndex)
            .map((col, index) => ({ ...col, sort_order: index }));

          return {
            ...state,
            columns: reorderedColumns,
            draggedColumn: null,
            draggedTask: null,
          };
        }
      }

      // Handle task reordering within same column
      if (state.draggedTask) {
        const activeTask = state.tasks.find(t => t.id === activeId);
        const overTask = state.tasks.find(t => t.id === overId);

        if (activeTask && overTask && activeTask.column_id === overTask.column_id) {
          const columnTasks = getColumnTasks(activeTask.column_id, state.tasks);
          const activeIndex = columnTasks.findIndex(t => t.id === activeId);
          const overIndex = columnTasks.findIndex(t => t.id === overId);

          if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
            const reorderedTasks = arrayMove(columnTasks, activeIndex, overIndex)
              .map((task, index) => ({ ...task, sort_order: index }));

            const updatedTasks = state.tasks.map(t => {
              const reordered = reorderedTasks.find(rt => rt.id === t.id);
              return reordered || t;
            });

            return {
              ...state,
              tasks: updatedTasks,
              draggedColumn: null,
              draggedTask: null,
            };
          }
        }
      }

      return {
        ...state,
        draggedColumn: null,
        draggedTask: null,
      };
    }

    case ADD_TASK: {
      const newTask = action.payload;
      return {
        ...state,
        tasks: [...state.tasks, newTask],
      };
    }

    case UPDATE_TASK: {
      const updatedTask = action.payload;
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === updatedTask.id ? updatedTask : t),
        activeTask: state.activeTask?.id === updatedTask.id ? updatedTask : state.activeTask,
      };
    }

    case DELETE_TASK: {
      const { taskId } = action.payload;
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== taskId),
        activeTask: state.activeTask?.id === taskId ? null : state.activeTask,
        taskDrawerOpen: state.activeTask?.id === taskId ? false : state.taskDrawerOpen,
      };
    }

    case MOVE_TASK: {
      const { taskId, columnId, sortOrder } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === taskId
            ? { ...t, column_id: columnId, sort_order: sortOrder }
            : t
        ),
      };
    }

    case ADD_COLUMN: {
      const newColumn = action.payload;
      return {
        ...state,
        columns: [...state.columns, newColumn].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
      };
    }

    case UPDATE_COLUMN: {
      const updatedColumn = action.payload;
      return {
        ...state,
        columns: state.columns.map(c => c.id === updatedColumn.id ? updatedColumn : c),
      };
    }

    case DELETE_COLUMN: {
      const { columnId } = action.payload;
      return {
        ...state,
        columns: state.columns.filter(c => c.id !== columnId),
        // Also remove tasks from deleted column
        tasks: state.tasks.filter(t => t.column_id !== columnId),
      };
    }

    case SET_ACTIVE_TASK: {
      return {
        ...state,
        activeTask: action.payload,
      };
    }

    case TOGGLE_TASK_DRAWER: {
      return {
        ...state,
        taskDrawerOpen: action.payload ?? !state.taskDrawerOpen,
        activeTask: action.payload === false ? null : state.activeTask,
      };
    }

    case TOGGLE_ADD_TASK_DIALOG: {
      return {
        ...state,
        addTaskDialogOpen: action.payload ?? !state.addTaskDialogOpen,
        addTaskColumnId: action.payload ? action.columnId : null,
      };
    }

    case TOGGLE_ADD_COLUMN_DIALOG: {
      return {
        ...state,
        addColumnDialogOpen: action.payload ?? !state.addColumnDialogOpen,
      };
    }

    default:
      return state;
  }
};
