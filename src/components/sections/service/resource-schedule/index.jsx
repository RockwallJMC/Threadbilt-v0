'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Drawer, Stack, Typography } from '@mui/material';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { alpha, useTheme } from '@mui/material/styles';
import { resourceScheduleTimelineData } from 'data/service/resourceSchedule';
import { getServicePropertyById } from 'data/service/service-properties';
import dayjs from 'dayjs';
import { generateTimeRanges } from 'helpers/gantt-utils';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import HiringProvider, { useHiringContext } from 'providers/HiringProvider';
import { Resizable } from 're-resizable';
import { REMOVE_ITEM } from 'reducers/HiringReducer';
import SimpleBar from 'components/base/SimpleBar';
import SvelteGanttChart from 'components/base/SvelteGanttChart';
import Mapbox from 'components/base/Mapbox';
import ResourceScheduleTicketList from 'components/sections/service/resource-schedule/ResourceScheduleTicketList';
import TicketPopover from 'components/sections/service/resource-schedule/TicketPopover';
import TicketDetail from 'components/sections/service/ticket-detail';

const ROW_HEIGHT = 52;
const HOUR_RANGE = 16;
const ANCHOR_HOUR = 5;
const SNAP_MINUTES = 15;
const SNAP_MS = SNAP_MINUTES * 60 * 1000;
const TASK_DURATION_MS = 60 * 60 * 1000;

const MOCK_SWIMLANES = [
  { id: 'emergency', label: 'Emergency', color: 'error.main' },
  { id: 'promised', label: 'Promised', color: 'warning.main' },
  { id: 'part-order', label: 'Part Order', color: 'info.main' },
  { id: 'pending', label: 'Pending', color: 'text.secondary' },
  { id: 'complete', label: 'Complete', color: 'success.main' },
];

const getInitials = (label) => {
  const parts = String(label ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }

  const single = parts[0] ?? '';
  return single.slice(0, 2).toUpperCase();
};

const ResourceScheduleBoard = () => {
  const theme = useTheme();
  const { topbarHeight } = useNavContext();
  const { up } = useBreakpoints();
  const upMd = up('md');
  const upSm = up('sm');
  const upLg = up('lg');
  const [ganttInstance, setGanttInstance] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeLane, setActiveLane] = useState(0);
  const [ganttTasks, setGanttTasks] = useState([]);
  const leftPanelRef = useRef(null);
  const ganttContainerRef = useRef(null);
  const drawerWidth = 600;
  const effectiveDrawerWidth = detailOpen ? drawerWidth : 0;
  const listMinWidth = upSm ? 225 : 180;
  const [leftPaneWidth, setLeftPaneWidth] = useState(upSm ? 225 : 180);

  useEffect(() => {
    if (detailOpen) {
      setLeftPaneWidth((prev) => Math.max(prev, drawerWidth + listMinWidth));
    } else {
      setLeftPaneWidth(listMinWidth);
    }
  }, [detailOpen, drawerWidth, listMinWidth]);
  const {
    admin: {
      pipeline: { hiringDispatch },
    },
  } = useHiringContext();

  const baseRows = useMemo(
    () =>
      resourceScheduleTimelineData.map((row) => ({
        id: row.id,
        label: row.label,
        classes: row.rowClass ? [row.rowClass] : [],
      })),
    [],
  );

  const rowTaskClassById = useMemo(
    () =>
      new Map(
        resourceScheduleTimelineData.map((row) => [row.id, row.taskClass ? [row.taskClass] : []]),
      ),
    [],
  );

  const baseTasks = useMemo(
    () =>
      resourceScheduleTimelineData.flatMap((row) =>
        row.tasks.map((task) => ({
          id: task.id,
          label: task.label,
          from: task.startDate,
          to: task.endDate,
          resourceId: row.id,
          amountDone: task.amountDone ?? 0,
          classes: row.taskClass ? ['ticket-task', row.taskClass] : ['ticket-task'],
        })),
      ),
    [],
  );

  const allTasks = useMemo(() => [...baseTasks, ...ganttTasks], [baseTasks, ganttTasks]);

  const rowLabelById = useMemo(
    () => new Map(resourceScheduleTimelineData.map((row) => [row.id, row.label])),
    [],
  );

  const swimLanes = useMemo(() => {
    let ticketCounter = 0;
    return MOCK_SWIMLANES.map((lane) => {
      const items = [];
      const count = Math.floor(Math.random() * (15 - 7 + 1)) + 7;
      for (let i = 0; i < count; i += 1) {
        items.push({
          id: `ticket-${ticketCounter}-${Date.now()}-${i}`,
          rating: (ticketCounter % 5) + 1,
          appliedDate: new Date().toISOString(),
        });
        ticketCounter = (ticketCounter + 1) % 20;
      }
      return { ...lane, items };
    });
  }, []);

  const { from, to } = useMemo(() => {
    const fallbackDay = dayjs().startOf('day').add(ANCHOR_HOUR, 'hour');
    if (!allTasks.length) {
      return { from: fallbackDay.valueOf(), to: fallbackDay.add(HOUR_RANGE, 'hour').valueOf() };
    }

    const earliest = Math.min(...allTasks.map((task) => task.from));
    const dayStart = dayjs(earliest).startOf('day').add(ANCHOR_HOUR, 'hour');
    return { from: dayStart.valueOf(), to: dayStart.add(HOUR_RANGE, 'hour').valueOf() };
  }, [allTasks]);

  const timeRanges = useMemo(() => generateTimeRanges(from, to), [from, to]);

  const handleDropToGantt = useCallback(
    ({ row, date, gantt, pipeline, pointer }) => {
      if (!row || !pipeline || !gantt) return;
      const { name: propertyName } = getServicePropertyById(pipeline.id);
      let dropDate = date;
      if (pointer) {
        const rowContainer = gantt.getRowContainer?.();
        if (rowContainer) {
          const rect = rowContainer.getBoundingClientRect();
          const x = pointer.clientX - rect.left + rowContainer.scrollLeft;
          dropDate = gantt.utils.getDateByPosition(x);
        }
      }
      const snappedStart = gantt.utils.roundTo
        ? gantt.utils.roundTo(dropDate)
        : Math.round(dropDate / SNAP_MS) * SNAP_MS;
      const safeStart = Math.min(Math.max(snappedStart, from), to - TASK_DURATION_MS);
      const endTime = safeStart + TASK_DURATION_MS;

      const activeLaneData = swimLanes[activeLane] ?? swimLanes[0];
      const statusClass = activeLaneData ? `ticket-task-${activeLaneData.id}` : '';
      const statusColor = activeLaneData?.color ?? 'text.secondary';

      const newTask = {
        id: `ticket-${pipeline.id}-${Date.now()}`,
        label: propertyName,
        from: safeStart,
        to: endTime,
        resourceId: row.model.id,
        classes: ['ticket-task', statusClass, ...(rowTaskClassById.get(row.model.id) ?? [])],
        amountDone: Math.min(100, Math.max(0, ((pipeline?.rating ?? 2) / 5) * 100)),
        statusClass,
        statusColor: `var(--mui-palette-${statusColor.replace('.', '-')})`,
        status: activeLaneData?.label,
        pipelineData: pipeline,
      };

      setGanttTasks((prev) => [...prev, newTask]);

      if (gantt.$set) {
        gantt.$set({ layout: 'overlap' });
      }
      gantt.updateTasks([newTask]);
      gantt.updateLayoutSync?.(true);
      hiringDispatch({ type: REMOVE_ITEM, payload: { itemId: pipeline.id } });
    },
    [from, to, hiringDispatch, swimLanes, activeLane, rowTaskClassById],
  );

  const renderTaskContent = useCallback(
    (task) => {
      if (!task) return '';
      const safeLabel = String(task.label ?? '')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const rowLabel = rowLabelById.get(task.resourceId);
      const safeInitials = getInitials(rowLabel ?? task.label ?? '')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const progressValue = Math.min(100, Math.max(0, Number(task.amountDone ?? 0)));

      const startTime = dayjs(task.from).format('h:mm A');
      const endTime = dayjs(task.to).format('h:mm A');
      const timeRange = `${startTime} – ${endTime}`;

      const statusColor = task.statusColor || 'var(--mui-palette-text-secondary)';

      return `
      <div class="ticket-card ${task.statusClass || ''}" style="--ticket-progress:${progressValue}%; --status-color:${statusColor};">
        <div class="ticket-card-progress"></div>
        <div class="ticket-card-body">
          <div class="ticket-card-avatar">${safeInitials}</div>
          <div class="ticket-card-content">
            <div class="ticket-card-title">${safeLabel}</div>
            <div class="ticket-card-time">${timeRange}</div>
          </div>
        </div>
      </div>
    `;
    },
    [rowLabelById],
  );

  const handleTaskClick = useCallback(
    (taskId, anchorElement) => {
      if (!taskId) return;

      // Get task from our state instead of ganttInstance to preserve all custom properties
      const task = allTasks.find((t) => t.id === taskId);
      if (!task) {
        console.log('Task not found:', taskId);
        return;
      }

      console.log('Task clicked:', task);
      console.log('Has pipelineData:', !!task.pipelineData);

      setSelectedTask(task);
      setSelectedTaskId(taskId);
      setDetailOpen(true); // Open drawer directly
      console.log('Drawer should open now');
      // setPopoverAnchor(anchorElement); // Commented out - use popover if needed
    },
    [allTasks],
  );

  const handleClosePopover = useCallback(() => {
    setPopoverAnchor(null);
  }, []);

  const handleOpenDrawer = useCallback(() => {
    setDetailOpen(true);
  }, []);

  const taskElementHook = useCallback((node) => {
    if (!node) return undefined;
    return undefined;
  }, []);

  // Listen for task clicks using Svelte Gantt's API
  useEffect(() => {
    if (!ganttInstance?.api?.tasks?.on) return undefined;

    const handleTaskSelected = (taskArray) => {
      console.log('Task selected via Gantt API:', taskArray);
      // The Gantt API returns an array of selected tasks
      if (Array.isArray(taskArray) && taskArray.length > 0) {
        const taskData = taskArray[0];
        const taskId = taskData?.model?.id;
        console.log('Extracted task ID:', taskId);
        if (taskId) {
          handleTaskClick(taskId);
        }
      }
    };

    // Try to listen for task selection events
    const unsubscribe = ganttInstance.api.tasks.on?.select?.(handleTaskSelected);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [ganttInstance, handleTaskClick]);

  // Fallback: DOM-based click listener
  useEffect(() => {
    const container = ganttContainerRef.current;
    if (!container) return undefined;

    const handleClick = (event) => {
      console.log('Click detected in gantt container');
      const taskElement = event.target.closest('.sg-task');
      if (!taskElement) {
        console.log('Not a task element');
        return;
      }

      console.log('Task element found:', taskElement);

      // Try to find the task ID from the element
      // Svelte Gantt might store it as a data attribute or class
      const classes = Array.from(taskElement.classList);
      console.log('Task classes:', classes);

      // Try to find task from ganttInstance
      if (ganttInstance?.api?.tasks?.entities) {
        const tasks = Array.from(ganttInstance.api.tasks.entities.values());
        console.log('All tasks:', tasks);

        // Try to match by checking if the click is within the task element bounds
        // For now, just click the first task as a test
        if (tasks.length > 0 && tasks[0].id) {
          console.log('Clicking first task as test:', tasks[0].id);
          handleTaskClick(tasks[0].id);
        }
      }
    };

    container.addEventListener('click', handleClick);
    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, [ganttContainerRef, ganttInstance, handleTaskClick]);

  const updateTaskTime = useCallback(
    (model) => {
      if (!model) return;
      const node = document.querySelector(`[data-task-id="${model.id}"]`);
      if (!node) return;

      // Update avatar initials based on the current row (resourceId)
      const avatarNode = node.querySelector('.ticket-card-avatar');
      if (avatarNode) {
        const rowLabel = rowLabelById.get(model.resourceId);
        const safeInitials = getInitials(rowLabel ?? model.label ?? '');
        avatarNode.textContent = safeInitials;
      }

      const timeNode = node.querySelector('.task-time');
      const durationNode = node.querySelector('.task-duration');
      const start = dayjs(model.from).format('h:mm A');
      const end = dayjs(model.to).format('h:mm A');
      if (timeNode) timeNode.textContent = `${start} – ${end}`;
      if (durationNode) {
        const minutes = Math.round((model.to - model.from) / 60000);
        durationNode.textContent = `${minutes} min`;
      }
    },
    [rowLabelById],
  );

  const updateTaskClasses = useCallback(
    (model, fullTask) => {
      if (!model?.id || !model.resourceId) return;
      if (!fullTask) return;

      const rowClasses = rowTaskClassById.get(model.resourceId) ?? [];
      const statusClass = fullTask.statusClass || '';

      // Update with all preserved properties
      ganttInstance?.updateTasks?.([
        {
          id: model.id,
          from: model.from,
          to: model.to,
          resourceId: model.resourceId,
          classes: ['ticket-task', statusClass, ...rowClasses].filter(Boolean),
          label: fullTask.label,
          amountDone: fullTask.amountDone,
          statusClass: fullTask.statusClass,
          statusColor: fullTask.statusColor,
          status: fullTask.status,
          pipelineData: fullTask.pipelineData,
        },
      ]);
    },
    [ganttInstance, rowTaskClassById],
  );

  useEffect(() => {
    if (!ganttInstance?.api?.tasks?.on?.move) return undefined;
    const removeMove = ganttInstance.api.tasks.on.move((params) => {
      const model = params?.[0];
      updateTaskTime(model);
    });
    const removeMoveEnd = ganttInstance.api.tasks.on.moveEnd((params) => {
      const model = params?.[0];
      if (!model) return;

      // Find the current task from state before updating
      setGanttTasks((prev) => {
        const currentTask = prev.find((t) => t.id === model.id);
        const updatedTasks = prev.map((task) =>
          task.id === model.id
            ? {
                ...task,
                from: model.from,
                to: model.to,
                resourceId: model.resourceId,
              }
            : task,
        );

        // Update visual elements with the full task data
        if (currentTask) {
          const updatedTask = {
            ...currentTask,
            from: model.from,
            to: model.to,
            resourceId: model.resourceId,
          };
          updateTaskTime(model);
          updateTaskClasses(model, updatedTask);
        }

        return updatedTasks;
      });
    });
    return () => {
      removeMove?.();
      removeMoveEnd?.();
    };
  }, [ganttInstance, updateTaskClasses, updateTaskTime]);

  return (
    <Box
      sx={{
        width: 1,
        height: ({ mixins }) =>
          mixins.contentHeight(topbarHeight, upMd ? mixins.footer.sm : mixins.footer.xs),
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'stretch',
        minWidth: 0,
        gap: 3,
        px: { xs: 2, md: 3 },
        py: 2,
      }}
    >
      <Resizable
        size={{ width: leftPaneWidth, height: '100%' }}
        minWidth={effectiveDrawerWidth + listMinWidth}
        maxWidth="50%"
        enable={{ right: true }}
        handleStyles={{
          right: {
            width: '10px',
            right: '-5px',
            cursor: 'col-resize',
            zIndex: 100,
          },
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transition: 'width 300ms ease',
        }}
        onResizeStop={(_event, _direction, _ref, delta) => {
          setLeftPaneWidth((prev) =>
            Math.max(prev + delta.width, effectiveDrawerWidth + listMinWidth),
          );
        }}
      >
        <Box
          ref={leftPanelRef}
          sx={{
            width: 1,
            height: 1,
            display: 'flex',
            flexDirection: 'row',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Drawer
            anchor="left"
            open={detailOpen}
            variant="persistent"
            onClose={() => setDetailOpen(false)}
            ModalProps={{
              container: leftPanelRef.current,
              disablePortal: true,
              keepMounted: true,
            }}
            sx={{
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                position: 'relative',
                width: effectiveDrawerWidth,
                height: '100%',
                borderRadius: 2,
                m: 1,
                boxShadow: 6,
                overflow: 'hidden',
                bgcolor: 'background.paper',
                transition: 'width 300ms ease, opacity 300ms ease',
                opacity: detailOpen ? 1 : 0,
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6 }}>Ticket Detail</Box>
              <Box
                component="button"
                type="button"
                onClick={() => setDetailOpen(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 700,
                }}
              >
                Close
              </Box>
            </Box>
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
                overflow: 'auto',
              }}
            >
              {selectedTask?.pipelineData?.id ? (
                <TicketDetail ticketId={selectedTask.pipelineData.id} isInDrawer />
              ) : (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6">Task Selected</Typography>
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Task ID: {selectedTask?.id}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Label: {selectedTask?.label}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: 'warning.main' }}>
                    {selectedTask
                      ? 'This is a demo task. Drop a ticket from the left panel to see full details.'
                      : 'No task selected'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Drawer>
          <Box
            sx={{
              flex: '1 1 auto',
              minWidth: listMinWidth,
              height: '100%',
              pl: '112px',
              boxSizing: 'border-box',
            }}
          >
            <Tabs
              value={activeLane}
              onChange={(_event, value) => setActiveLane(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 36,
                px: 0,
                '& .MuiTabs-flexContainer': {
                  justifyContent: 'flex-start',
                },
                '& .MuiTabs-scroller': {
                  maxWidth: listMinWidth,
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                },
                '& .MuiTabs-scrollButtons': {
                  width: 24,
                },
              }}
            >
              {swimLanes.map((lane) => (
                <Tab
                  key={lane.id}
                  label={lane.label}
                  sx={{
                    minHeight: 36,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    color: lane.color,
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    minWidth: Math.floor(listMinWidth / 3),
                    px: 0.75,
                  }}
                />
              ))}
            </Tabs>
            <SimpleBar
              sx={{
                width: 1,
                height: 1,
                overflowX: 'auto',
                pr: { xs: 0.5, md: 1 },
              }}
            >
              <Stack sx={{ height: 1, gap: 0.6, minWidth: listMinWidth }}>
                <ResourceScheduleTicketList
                  ganttInstance={ganttInstance}
                  onDropToGantt={handleDropToGantt}
                  snapMs={SNAP_MS}
                  durationMs={TASK_DURATION_MS}
                  lanes={swimLanes}
                  activeLane={activeLane}
                />
              </Stack>
            </SimpleBar>
          </Box>
        </Box>
      </Resizable>
      <Box
        sx={{
          flex: '1 1 0%',
          minWidth: 0,
          height: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        <Resizable
          defaultSize={{ width: '100%', height: '40%' }}
          minHeight="20%"
          maxHeight="80%"
          enable={{ bottom: true }}
          style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
          handleStyles={{
            bottom: {
              height: '10px',
              bottom: '-5px',
              cursor: 'row-resize',
              zIndex: 100,
            },
          }}
        >
          <SvelteGanttChart
            containerRef={ganttContainerRef}
            sx={{
              '& .sg-table-body-cell': {
                backgroundColor: `${theme.palette.background.elevation1} !important`,
              },
            }}
            chartOptions={{
              rows: baseRows.map((row) => ({ ...row, height: ROW_HEIGHT })),
              tasks: allTasks,
              timeRanges,
              from,
              to,
              tableWidth: 220,
              minWidth: Math.max(800, HOUR_RANGE * 80),
              tableHeaders: [{ title: 'Technicians', property: 'label', width: 140, type: 'tree' }],
              layout: 'overlap',
              columnUnit: 'minute',
              columnOffset: SNAP_MINUTES,
              magnetUnit: 'minute',
              magnetOffset: SNAP_MINUTES,
              taskContent: renderTaskContent,
              taskElementHook,
            }}
            onInit={(instance) => {
              setGanttInstance(instance);
            }}
            syncTasks={false}
          />
        </Resizable>
        <Mapbox
          sx={{
            flex: '1 1 auto',
            minHeight: 0,
            mt: 1,
            height: '100%',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.elevation1',
          }}
          options={{
            center: [-97.3331, 32.7767], // DFW metro center [longitude, latitude]
            zoom: 11, // Shows full metro area
            scrollZoom: false, // Prevent scroll zoom conflicts with page scroll
          }}
        />
      </Box>
      <TicketPopover
        anchorEl={popoverAnchor}
        open={Boolean(popoverAnchor)}
        onClose={handleClosePopover}
        task={selectedTask}
        onOpenDrawer={handleOpenDrawer}
      />
    </Box>
  );
};

const ResourceSchedule = () => (
  <HiringProvider>
    <ResourceScheduleBoard />
  </HiringProvider>
);

export default ResourceSchedule;
