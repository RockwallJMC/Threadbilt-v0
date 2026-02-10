'use client';

import { useReducer, useCallback, useEffect, useMemo } from 'react';
import {
  useProjectKanban,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useMoveTask,
  useReorderTasks,
  useCreateColumn,
  useUpdateColumn,
  useDeleteColumn,
  useReorderColumns,
} from 'services/swr/api-hooks/useProjectKanbanApi';
import { transformKanbanResponse } from 'helpers/project-kanban-transformers';
import { ProjectKanbanContext } from './ProjectKanbanContext';
import {
  projectKanbanReducer,
  DRAG_START,
  DRAG_OVER,
  DRAG_END,
  SET_PROJECT,
  SET_COLUMNS,
  SET_TASKS,
  ADD_TASK,
  UPDATE_TASK,
  DELETE_TASK,
  ADD_COLUMN,
  UPDATE_COLUMN,
  DELETE_COLUMN,
  SET_ACTIVE_TASK,
  TOGGLE_TASK_DRAWER,
  TOGGLE_ADD_TASK_DIALOG,
  TOGGLE_ADD_COLUMN_DIALOG,
} from './ProjectKanbanReducer';

const initialState = {
  project: null,
  columns: [],
  tasks: [],
  draggedTask: null,
  draggedColumn: null,
  activeTask: null,
  taskDrawerOpen: false,
  addTaskDialogOpen: false,
  addTaskColumnId: null,
  addColumnDialogOpen: false,
};

const ProjectKanbanProvider = ({ project, children }) => {
  const projectId = project?.id;
  const [state, dispatch] = useReducer(projectKanbanReducer, initialState);

  // Fetch kanban data using new SWR hook
  const { data: rawKanbanData, mutate, isLoading, error } = useProjectKanban(projectId);

  // Transform API data to UI format
  const kanbanData = useMemo(() =>
    rawKanbanData ? transformKanbanResponse(rawKanbanData) : null,
    [rawKanbanData]
  );

  // Mutation hooks
  const { trigger: createTaskApi } = useCreateTask(projectId);
  const { trigger: updateTaskApi } = useUpdateTask(projectId);
  const { trigger: deleteTaskApi } = useDeleteTask(projectId);
  const { trigger: moveTaskApi } = useMoveTask(projectId);
  const { trigger: reorderTasksApi } = useReorderTasks(projectId);
  const { trigger: createColumnApi } = useCreateColumn(projectId);
  const { trigger: updateColumnApi } = useUpdateColumn(projectId);
  const { trigger: deleteColumnApi } = useDeleteColumn(projectId);
  const { trigger: reorderColumnsApi } = useReorderColumns(projectId);

  // Initialize state from transformed kanban data
  useEffect(() => {
    if (kanbanData) {
      dispatch({ type: SET_PROJECT, payload: kanbanData });
      dispatch({
        type: SET_COLUMNS,
        payload: kanbanData.listItems || [],
      });

      // Flatten all tasks from columns
      // Ensure tasks have snake_case DB field names for reducer compatibility
      const allTasks = (kanbanData.listItems || []).flatMap(col =>
        (col.tasks || []).map(task => ({
          ...task,
          column_id: task.columnId || col.id,
          sort_order: task.sortOrder ?? 0,
        }))
      );
      dispatch({
        type: SET_TASKS,
        payload: allTasks,
      });
    }
  }, [kanbanData]);

  // Drag handlers
  const handleDragStart = useCallback((event) => {
    dispatch({
      type: DRAG_START,
      payload: {
        type: event.active.data.current?.type,
        item: event.active.data.current?.item,
      },
    });
  }, []);

  const handleDragOver = useCallback(
    (() => {
      let timeoutId;
      return (event) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (event.over) {
            dispatch({
              type: DRAG_OVER,
              payload: {
                activeId: event.active.id,
                overId: event.over?.id,
                activeRect: event.active.rect.current.translated,
                overRect: event.over?.rect,
              },
            });
          }
        }, 16);
      };
    })(),
    []
  );

  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event;

    if (!over) {
      dispatch({ type: DRAG_END, payload: { activeId: active.id, overId: null } });
      return;
    }

    dispatch({
      type: DRAG_END,
      payload: { activeId: active.id, overId: over.id },
    });

    // Persist changes to database
    const activeTask = state.tasks.find(t => t.id === active.id);
    if (activeTask && state.draggedTask) {
      const updatedTask = state.tasks.find(t => t.id === active.id);
      if (updatedTask) {
        try {
          await moveTaskApi({
            taskId: active.id,
            columnId: updatedTask.column_id,
            sortOrder: updatedTask.sort_order,
          });
          // Revalidate kanban data
          await mutate();
        } catch (error) {
          console.error('Failed to move task:', error);
        }
      }
    }

    // Handle column reordering
    if (state.draggedColumn) {
      const columnsToUpdate = state.columns.map((col, index) => ({
        id: col.id,
        sort_order: index,
      }));
      try {
        await reorderColumnsApi({ columns: columnsToUpdate });
        await mutate();
      } catch (error) {
        console.error('Failed to reorder columns:', error);
      }
    }
  }, [state.tasks, state.columns, state.draggedTask, state.draggedColumn, moveTaskApi, reorderColumnsApi, mutate]);

  // Task actions
  const handleAddTask = useCallback(async (taskData) => {
    try {
      const newTask = await createTaskApi({
        columnId: taskData.columnId,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        assigneeId: taskData.assigneeId,
        labelId: taskData.labelId,
        coverImage: taskData.coverImage,
        sortOrder: state.tasks.filter(t => t.column_id === taskData.columnId).length,
      });

      dispatch({ type: ADD_TASK, payload: newTask });
      dispatch({ type: TOGGLE_ADD_TASK_DIALOG, payload: false });
      await mutate();
      return newTask;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }, [createTaskApi, state.tasks, mutate]);

  const handleUpdateTask = useCallback(async (taskId, updates) => {
    try {
      const updatedTask = await updateTaskApi({ taskId, updates });
      dispatch({ type: UPDATE_TASK, payload: updatedTask });
      await mutate();
      return updatedTask;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  }, [updateTaskApi, mutate]);

  const handleDeleteTask = useCallback(async (taskId) => {
    try {
      await deleteTaskApi({ taskId });
      dispatch({ type: DELETE_TASK, payload: { taskId } });
      await mutate();
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  }, [deleteTaskApi, mutate]);

  // Column actions
  const handleAddColumn = useCallback(async (columnData) => {
    try {
      const newColumn = await createColumnApi({
        name: columnData.name,
        color: columnData.color,
        cardLimit: columnData.cardLimit,
        sortOrder: state.columns.length,
      });

      dispatch({ type: ADD_COLUMN, payload: newColumn });
      dispatch({ type: TOGGLE_ADD_COLUMN_DIALOG, payload: false });
      await mutate();
      return newColumn;
    } catch (error) {
      console.error('Failed to create column:', error);
      throw error;
    }
  }, [createColumnApi, state.columns.length, mutate]);

  const handleUpdateColumn = useCallback(async (columnId, updates) => {
    try {
      const updatedColumn = await updateColumnApi({ columnId, updates });
      dispatch({ type: UPDATE_COLUMN, payload: updatedColumn });
      await mutate();
      return updatedColumn;
    } catch (error) {
      console.error('Failed to update column:', error);
      throw error;
    }
  }, [updateColumnApi, mutate]);

  const handleDeleteColumn = useCallback(async (columnId) => {
    try {
      await deleteColumnApi({ columnId });
      dispatch({ type: DELETE_COLUMN, payload: { columnId } });
      await mutate();
    } catch (error) {
      console.error('Failed to delete column:', error);
      throw error;
    }
  }, [deleteColumnApi, mutate]);

  // UI actions
  const openTaskDetails = useCallback((task) => {
    dispatch({ type: SET_ACTIVE_TASK, payload: task });
    dispatch({ type: TOGGLE_TASK_DRAWER, payload: true });
  }, []);

  const closeTaskDetails = useCallback(() => {
    dispatch({ type: TOGGLE_TASK_DRAWER, payload: false });
  }, []);

  const openAddTaskDialog = useCallback((columnId) => {
    dispatch({ type: TOGGLE_ADD_TASK_DIALOG, payload: true, columnId });
  }, []);

  const closeAddTaskDialog = useCallback(() => {
    dispatch({ type: TOGGLE_ADD_TASK_DIALOG, payload: false });
  }, []);

  const openAddColumnDialog = useCallback(() => {
    dispatch({ type: TOGGLE_ADD_COLUMN_DIALOG, payload: true });
  }, []);

  const closeAddColumnDialog = useCallback(() => {
    dispatch({ type: TOGGLE_ADD_COLUMN_DIALOG, payload: false });
  }, []);

  const contextValue = {
    // State
    ...state,

    // Loading & error states
    isLoading,
    error,

    // Drag handlers
    handleDragStart,
    handleDragOver,
    handleDragEnd,

    // Task actions
    handleAddTask,
    handleUpdateTask,
    handleDeleteTask,

    // Column actions
    handleAddColumn,
    handleUpdateColumn,
    handleDeleteColumn,

    // UI actions
    openTaskDetails,
    closeTaskDetails,
    openAddTaskDialog,
    closeAddTaskDialog,
    openAddColumnDialog,
    closeAddColumnDialog,

    // Dispatch for custom actions
    dispatch,
  };

  return (
    <ProjectKanbanContext value={contextValue}>
      {children}
    </ProjectKanbanContext>
  );
};

export default ProjectKanbanProvider;
