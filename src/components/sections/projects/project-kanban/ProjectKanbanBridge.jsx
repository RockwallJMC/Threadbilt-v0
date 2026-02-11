'use client';

import { createContext, useState, useReducer, useCallback, useEffect, useMemo, useRef } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import {
  useProjectKanban,
  useMoveTask,
  useReorderTasks,
  useReorderColumns,
  useCreateTask,
  useCreateColumn,
} from 'services/swr/api-hooks/useProjectKanbanApi';
import { useProjectDrawings } from 'services/swr/api-hooks/useProjectDrawingsApi';
import { transformKanbanResponse } from 'helpers/project-kanban-transformers';
import { KanbanContext } from 'providers/KanbanProvider';

// Pinned swim lanes — always appear first in this order
const PINNED_LANES = [
  { id: '__proposals__', title: 'Proposals', compactMode: false, tasks: [], addLabel: 'Add New Proposal' },
  { id: '__drawings__', title: 'Drawings', compactMode: false, tasks: [], addLabel: 'Add New Drawing' },
];

/**
 * Ensure pinned lanes are always first in listItems (in order).
 * If a DB column with a matching name exists, use it; otherwise inject the static lane.
 */
const ensurePinnedLanesFirst = (listItems) => {
  const pinnedIds = new Set(PINNED_LANES.map((l) => l.id));
  const pinnedTitles = new Set(PINNED_LANES.map((l) => l.title.toLowerCase()));

  // Separate pinned from the rest
  const rest = listItems.filter(
    (l) => !pinnedIds.has(l.id) && !pinnedTitles.has(l.title?.toLowerCase()),
  );

  // For each pinned lane, use the DB version if it exists, otherwise the static default
  const pinned = PINNED_LANES.map((lane) => {
    const fromDb = listItems.find(
      (l) => l.title?.toLowerCase() === lane.title.toLowerCase() || l.id === lane.id,
    );
    return fromDb || lane;
  });

  return [...pinned, ...rest];
};

const PROPOSALS_LANE_ID = '__proposals__';

// Action types (same as KanbanReducer + extras for sync)
const SYNC_DATA = 'SYNC_DATA';
const DRAG_START = 'DRAG_START';
const DRAG_OVER = 'DRAG_OVER';
const DRAG_END = 'DRAG_END';
const TASK_DETAILS_OPEN = 'TASK_DETAILS_OPEN';
const TASK_DETAILS_CLOSE = 'TASK_DETAILS_CLOSE';
const ADD_NEW_TASK = 'ADD_NEW_TASK';
const ADD_NEW_LIST = 'ADD_NEW_LIST';
const TOGGLE_COMPACT_MODE = 'TOGGLE_COMPACT_MODE';
const UPDATE_LIST_TITLE = 'UPDATE_LIST_TITLE';
const UPDATE_BOARD_BACKGROUND = 'UPDATE_BOARD_BACKGROUND';

/**
 * Find which list a task or list ID belongs to
 */
const findTaskList = (id, listItems) => {
  if (!id) return null;

  const list = listItems.find((item) => item.id === id) ?? null;
  if (list) return list;

  const listId = listItems
    .flatMap((list) => list.tasks.map((task) => ({ taskId: task.id, listId: list.id })))
    .find((item) => item.taskId === id)?.listId;

  return listItems.find((list) => list.id === listId) ?? null;
};

/**
 * Project-specific kanban reducer
 * Same drag logic as KanbanReducer but uses state.kanbanBoard instead of static demo data
 */
const projectBoardReducer = (state, action) => {
  switch (action.type) {
    case SYNC_DATA: {
      let listItems = ensurePinnedLanesFirst(action.payload.listItems);

      // Inject drawings into the Drawings lane after pinned lanes are resolved
      if (action.payload.drawings) {
        listItems = listItems.map((item) => {
          if (item.title?.toLowerCase() === 'drawings' || item.id === '__drawings__') {
            return { ...item, tasks: action.payload.drawings };
          }
          return item;
        });
      }

      return {
        ...state,
        kanbanBoard: action.payload.kanbanBoard,
        listItems,
      };
    }

    case DRAG_START: {
      if (action.payload.type === 'task')
        return { ...state, draggedTask: action.payload.item.task };
      if (action.payload.type === 'list')
        return { ...state, draggedList: action.payload.item.list };
      return state;
    }

    case DRAG_OVER: {
      const { activeId, overId, activeRect, overRect } = action.payload;
      const activeList = findTaskList(activeId, state.listItems);
      const overList = findTaskList(overId, state.listItems);

      if (!activeList || !overList || activeList.id === overList.id || !activeRect || !overRect) {
        return state;
      }

      const activeTasks = activeList.tasks;
      const overTasks = overList.tasks;
      const activeIndex = activeTasks.findIndex((task) => task.id === activeId);
      const overIndex = overTasks.findIndex((task) => task.id === overId);

      if (activeIndex === -1) return state;

      const newIndex =
        overIndex >= 0
          ? overIndex + (activeRect.top > overRect.top + overRect.height ? 1 : 0)
          : 0;

      return {
        ...state,
        listItems: state.listItems.map((list) => {
          if (list.id === activeList.id) {
            return { ...list, tasks: activeTasks.filter((item) => item.id !== activeId) };
          } else if (list.id === overList.id) {
            return {
              ...list,
              tasks: [
                ...overTasks.slice(0, newIndex),
                activeTasks[activeIndex],
                ...overTasks.slice(newIndex),
              ],
            };
          }
          return list;
        }),
      };
    }

    case DRAG_END: {
      const { activeId, overId } = action.payload;
      const activeList = findTaskList(activeId, state.listItems);
      const overList = findTaskList(overId, state.listItems);

      if (!activeList || !overList) return { ...state, draggedTask: null, draggedList: null };

      if (state.draggedTask && activeList.id === overList.id) {
        const activeIndex = activeList.tasks.findIndex((task) => task.id === activeId);
        const overIndex = activeList.tasks.findIndex((task) => task.id === overId);
        if (activeIndex !== overIndex) {
          const sortedTasks = arrayMove(activeList.tasks, activeIndex, overIndex);
          return {
            ...state,
            listItems: state.listItems.map((list) =>
              list.id === activeList.id ? { ...list, tasks: sortedTasks } : list,
            ),
            draggedTask: null,
            draggedList: null,
          };
        }
      } else if (activeList) {
        // Prevent dragging any pinned lane
        const pinnedIds = new Set(PINNED_LANES.map((l) => l.id));
        if (pinnedIds.has(activeId)) {
          return { ...state, draggedTask: null, draggedList: null };
        }
        const activeIndex = state.listItems.findIndex((list) => list.id === activeId);
        const overIndex = state.listItems.findIndex((list) => list.id === overId);
        if (activeIndex !== -1 && overIndex !== -1) {
          const moved = arrayMove(state.listItems, activeIndex, overIndex);
          return {
            ...state,
            listItems: ensurePinnedLanesFirst(moved),
            draggedTask: null,
            draggedList: null,
          };
        }
      }

      return { ...state, draggedTask: null, draggedList: null };
    }

    case ADD_NEW_TASK: {
      return {
        ...state,
        listItems: state.listItems.map((list) =>
          list.id === action.payload.listId
            ? {
                ...list,
                tasks:
                  action.payload.position === 'top'
                    ? [{ id: Date.now().toString(), title: action.payload.title }, ...list.tasks]
                    : [...list.tasks, { id: Date.now().toString(), title: action.payload.title }],
              }
            : list,
        ),
      };
    }

    case ADD_NEW_LIST: {
      const inserted = [
        ...state.listItems.slice(0, action.payload.columnNo - 1),
        { id: Date.now().toString(), title: action.payload.title, compactMode: false, tasks: [] },
        ...state.listItems.slice(action.payload.columnNo - 1),
      ];
      return {
        ...state,
        listItems: ensurePinnedLanesFirst(inserted),
      };
    }

    case TOGGLE_COMPACT_MODE: {
      return {
        ...state,
        listItems: state.listItems.map((item) =>
          item.id === action.payload.id ? { ...item, compactMode: !item.compactMode } : item,
        ),
      };
    }

    case UPDATE_LIST_TITLE: {
      return {
        ...state,
        listItems: state.listItems.map((item) =>
          item.id === action.payload.id ? { ...item, title: action.payload.title } : item,
        ),
      };
    }

    case UPDATE_BOARD_BACKGROUND: {
      return {
        ...state,
        kanbanBoard: {
          ...state.kanbanBoard,
          backgroundOption: action.payload,
        },
      };
    }

    case TASK_DETAILS_OPEN: {
      return {
        ...state,
        taskDetails: {
          ...action.payload,
          column: findTaskList(action.payload.id, state.listItems)?.title,
          board: state.kanbanBoard?.name || 'Project Board',
        },
      };
    }

    case TASK_DETAILS_CLOSE: {
      return { ...state, taskDetails: null };
    }

    default:
      return state;
  }
};

const initialState = {
  kanbanBoard: {
    backgroundOption: { type: 'color', background: { src: '', height: 0, width: 0 } },
    assignee: [],
  },
  listItems: [],
  draggedList: null,
  draggedTask: null,
  taskDetails: null,
};

/**
 * Bridge provider that maps Supabase project data into KanbanContext
 * so the template-aurora kanban components work with real project data.
 */
const ProjectKanbanBridge = ({ project, children }) => {
  const projectId = project?.id;

  // Fetch Supabase data
  const { data: rawData, mutate, isLoading, error } = useProjectKanban(projectId);
  const kanbanData = useMemo(
    () => (rawData ? transformKanbanResponse(rawData) : null),
    [rawData],
  );
  const { data: drawings, mutate: mutateDrawings } = useProjectDrawings(projectId);

  // Mutation hooks for persistence
  const { trigger: moveTaskApi } = useMoveTask(projectId);
  const { trigger: reorderTasksApi } = useReorderTasks(projectId);
  const { trigger: reorderColumnsApi } = useReorderColumns(projectId);
  const { trigger: createTaskApi } = useCreateTask(projectId);
  const { trigger: createColumnApi } = useCreateColumn(projectId);

  // File sidebar open/close state
  const [fileSidebarOpen, setFileSidebarOpen] = useState(false);
  const toggleFileSidebar = useCallback(() => setFileSidebarOpen((prev) => !prev), []);

  // Reducer for local UI state
  const [state, dispatch] = useReducer(projectBoardReducer, initialState);

  // Track whether we've synced at least once
  const hasSynced = useRef(false);

  // Sync from SWR whenever data changes
  useEffect(() => {
    if (kanbanData) {
      dispatch({
        type: SYNC_DATA,
        payload: {
          kanbanBoard: {
            ...kanbanData,
            backgroundOption: kanbanData.backgroundOption || {
              type: 'color',
              background: { src: '', height: 0, width: 0 },
            },
          },
          listItems: kanbanData.listItems || [],
          drawings: drawings || [],
        },
      });
      hasSynced.current = true;
    }
  }, [kanbanData, drawings]);

  // Drag handlers
  const handleDragStart = useCallback((event) => {
    dispatch({
      type: DRAG_START,
      payload: { type: event.active.data.current?.type, item: event.active.data.current },
    });
  }, []);

  const handleDragOver = useCallback(
    (() => {
      let timeoutId;
      return (event) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          dispatch({
            type: DRAG_OVER,
            payload: {
              activeId: event.active.id,
              overId: event.over?.id,
              activeRect: event.active.rect.current.translated,
              overRect: event.over?.rect,
            },
          });
        }, 16);
      };
    })(),
    [],
  );

  const handleDragEnd = useCallback(
    async (event) => {
      const { active, over } = event;

      if (!over) {
        dispatch({ type: DRAG_END, payload: { activeId: active.id, overId: null } });
        return;
      }

      // Apply optimistic update via reducer
      dispatch({
        type: DRAG_END,
        payload: { activeId: active.id, overId: over.id },
      });

      // Persist to Supabase
      try {
        if (state.draggedTask) {
          // Find which list the task ended up in after the reducer update
          // We need to compute this from the post-drag state
          const postDragListItems = (() => {
            const activeList = findTaskList(active.id, state.listItems);
            const overList = findTaskList(over.id, state.listItems);
            if (!activeList || !overList) return state.listItems;

            if (activeList.id === overList.id) {
              const activeIndex = activeList.tasks.findIndex((t) => t.id === active.id);
              const overIndex = activeList.tasks.findIndex((t) => t.id === over.id);
              const sorted = arrayMove(activeList.tasks, activeIndex, overIndex);
              return state.listItems.map((l) =>
                l.id === activeList.id ? { ...l, tasks: sorted } : l,
              );
            }
            return state.listItems;
          })();

          // Build task position updates for the affected list
          const targetList = findTaskList(over.id, postDragListItems) || findTaskList(active.id, postDragListItems);
          if (targetList) {
            const taskUpdates = targetList.tasks.map((task, index) => ({
              id: task.id,
              column_id: targetList.id,
              sort_order: index,
            }));
            await reorderTasksApi({ tasks: taskUpdates });
          }
        }

        if (state.draggedList) {
          // Persist column reordering
          const activeIndex = state.listItems.findIndex((l) => l.id === active.id);
          const overIndex = state.listItems.findIndex((l) => l.id === over.id);
          if (activeIndex !== -1 && overIndex !== -1) {
            const reordered = arrayMove(state.listItems, activeIndex, overIndex);
            const columnUpdates = reordered.map((col, index) => ({
              id: col.id,
              sort_order: index,
            }));
            await reorderColumnsApi({ columns: columnUpdates });
          }
        }

        // Revalidate from server
        await mutate();
      } catch (err) {
        console.error('Failed to persist drag:', err);
        // Revalidate to restore server state on error
        await mutate();
      }
    },
    [state.listItems, state.draggedTask, state.draggedList, reorderTasksApi, reorderColumnsApi, mutate],
  );

  // Wrapped dispatch that persists mutations to Supabase
  const kanbanDispatch = useCallback(
    async (action) => {
      // Always apply to local state first
      dispatch(action);

      // Persist specific actions to Supabase
      switch (action.type) {
        case ADD_NEW_TASK: {
          try {
            await createTaskApi({
              columnId: action.payload.listId,
              title: action.payload.title,
              sortOrder: action.payload.position === 'top' ? 0 : undefined,
            });
            await mutate();
          } catch (err) {
            console.error('Failed to create task:', err);
            await mutate();
          }
          break;
        }
        case ADD_NEW_LIST: {
          try {
            await createColumnApi({
              name: action.payload.title,
              sortOrder: action.payload.columnNo - 1,
            });
            await mutate();
          } catch (err) {
            console.error('Failed to create column:', err);
            await mutate();
          }
          break;
        }
        default:
          break;
      }
    },
    [createTaskApi, createColumnApi, mutate],
  );

  const contextValue = useMemo(
    () => ({
      ...state,
      handleDragStart,
      handleDragOver,
      handleDragEnd,
      kanbanDispatch,
      // File sidebar
      fileSidebarOpen,
      toggleFileSidebar,
      // Expose loading/error for the page wrapper
      isLoading,
      error,
      // Drawings mutate function for revalidation
      mutateDrawings,
    }),
    [state, handleDragStart, handleDragOver, handleDragEnd, kanbanDispatch, fileSidebarOpen, toggleFileSidebar, isLoading, error, mutateDrawings],
  );

  return <KanbanContext value={contextValue}>{children}</KanbanContext>;
};

export default ProjectKanbanBridge;
