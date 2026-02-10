/**
 * Project Dashboard Data Transformers
 *
 * Transform database records from Supabase into the shapes expected by dashboard components.
 * These functions bridge the gap between raw DB data and UI component requirements.
 */

import dayjs from 'dayjs';

/**
 * Determine task status based on column name
 * @param {string} columnName - The name of the column/stage
 * @returns {'ongoing' | 'due' | 'complete'}
 */
const getTaskStatusFromColumn = (columnName) => {
  const lowerName = (columnName || '').toLowerCase();
  if (lowerName.includes('done') || lowerName.includes('complete')) {
    return 'complete';
  }
  if (lowerName.includes('review') || lowerName.includes('blocked')) {
    return 'due';
  }
  return 'ongoing';
};

/**
 * Determine task state based on due date and completion status
 * @param {string|null} dueDate - Task due date
 * @param {boolean} isCompleted - Whether task is in completed column
 * @returns {'Done' | 'On Track' | 'Delayed' | 'Overdue'}
 */
const getTaskState = (dueDate, isCompleted) => {
  if (isCompleted) return 'Done';
  if (!dueDate) return 'On Track';

  const due = dayjs(dueDate);
  const today = dayjs();
  const daysUntilDue = due.diff(today, 'day');

  if (daysUntilDue < 0) return 'Overdue';
  if (daysUntilDue <= 3) return 'Delayed';
  return 'On Track';
};

/**
 * Transform raw project tasks into Gantt chart format
 *
 * Expected output shape:
 * [{
 *   id: number,
 *   label: string,
 *   status: 'ongoing' | 'due' | 'complete',
 *   tasks: [{
 *     id: number,
 *     label: string,
 *     amountDone: 0-100,
 *     startDate: timestamp,
 *     endDate: timestamp
 *   }]
 * }]
 *
 * @param {Array} tasks - Raw tasks from useProjectTimeline hook
 * @param {Array} columns - Project columns for status grouping
 * @returns {Array} Formatted timeline data for Gantt chart
 */
export const transformTasksToGanttFormat = (tasks, columns = []) => {
  if (!tasks || tasks.length === 0) return [];

  // Group tasks by column
  const columnMap = new Map();
  columns.forEach((col) => {
    columnMap.set(col.id, {
      id: col.id,
      name: col.name,
      color: col.color,
      sortOrder: col.sort_order,
    });
  });

  // Group tasks by their column
  const tasksByColumn = {};
  tasks.forEach((task) => {
    const colId = task.column_id;
    if (!tasksByColumn[colId]) {
      tasksByColumn[colId] = [];
    }
    tasksByColumn[colId].push(task);
  });

  // Transform into Gantt format
  const ganttData = Object.entries(tasksByColumn).map(([colId, colTasks]) => {
    const column = columnMap.get(colId) || { name: 'Unknown', sortOrder: 99 };
    const status = getTaskStatusFromColumn(column.name);

    return {
      id: colId,
      label: column.name,
      status,
      sortOrder: column.sortOrder,
      tasks: colTasks.map((task) => {
        const startDate = task.created_at
          ? new Date(task.created_at).getTime()
          : Date.now();
        const endDate = task.due_date
          ? new Date(task.due_date).getTime()
          : startDate + 7 * 24 * 60 * 60 * 1000; // Default 1 week

        // Calculate completion percentage based on column
        const isCompleted = status === 'complete';
        const amountDone = isCompleted ? 100 : status === 'due' ? 50 : 0;

        return {
          id: task.id,
          label: task.title,
          amountDone,
          startDate,
          endDate,
        };
      }),
    };
  });

  // Sort by column sort order
  return ganttData.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
};

/**
 * Transform tasks into deadline metrics (before/on/after completion)
 *
 * Expected output shape:
 * [
 *   { id: 1, completed: 'before', count: 3, prevCompleteCount: 3 },
 *   { id: 2, completed: 'on', count: 14, prevCompleteCount: 17 },
 *   { id: 3, completed: 'after', count: 6, prevCompleteCount: 5 }
 * ]
 *
 * @param {Array} tasks - Tasks with completion data
 * @param {Array} columns - Project columns to identify completed status
 * @returns {Array} Deadline metrics
 */
export const transformTasksToDeadlineMetrics = (tasks, columns = []) => {
  if (!tasks || tasks.length === 0) {
    return [
      { id: 1, completed: 'before', count: 0, prevCompleteCount: 0 },
      { id: 2, completed: 'on', count: 0, prevCompleteCount: 0 },
      { id: 3, completed: 'after', count: 0, prevCompleteCount: 0 },
    ];
  }

  // Find completed column(s)
  const completedColumnIds = columns
    .filter((col) => {
      const name = (col.name || '').toLowerCase();
      return name.includes('done') || name.includes('complete');
    })
    .map((col) => col.id);

  let before = 0;
  let onTime = 0;
  let after = 0;

  tasks.forEach((task) => {
    // Only count tasks that have a due date and are completed
    if (!task.due_date) return;

    const isCompleted = completedColumnIds.includes(task.column_id);
    if (!isCompleted) return;

    const dueDate = dayjs(task.due_date).startOf('day');
    const completedDate = task.updated_at
      ? dayjs(task.updated_at).startOf('day')
      : dayjs().startOf('day');

    const daysDiff = completedDate.diff(dueDate, 'day');

    if (daysDiff < 0) {
      before++;
    } else if (daysDiff === 0) {
      onTime++;
    } else {
      after++;
    }
  });

  return [
    { id: 1, completed: 'before', count: before, prevCompleteCount: before },
    { id: 2, completed: 'on', count: onTime, prevCompleteCount: onTime },
    { id: 3, completed: 'after', count: after, prevCompleteCount: after },
  ];
};

/**
 * Transform project data into roadmap format with task progress
 *
 * Expected output shape:
 * [{
 *   id: string,
 *   name: string,
 *   color: 'primary' | 'warning' | etc,
 *   tasks: [{
 *     id: string,
 *     name: string,
 *     eta: 'YYYY-MM-DD',
 *     lead: { name, avatar },
 *     members: [{ name, avatar }],
 *     progress: 0-100,
 *     state: 'Done' | 'On Track' | 'Delayed' | 'Overdue'
 *   }]
 * }]
 *
 * @param {Object} project - Project with tasks and members
 * @param {Array} columns - Project columns for status checking
 * @returns {Array} Roadmap data
 */
export const transformProjectToRoadmapFormat = (project, columns = []) => {
  if (!project) return [];

  const tasks = project.tasks || [];
  const members = project.members || [];

  // Find completed column(s)
  const completedColumnIds = columns
    .filter((col) => {
      const name = (col.name || '').toLowerCase();
      return name.includes('done') || name.includes('complete');
    })
    .map((col) => col.id);

  // Create member lookup
  const memberMap = new Map();
  members.forEach((m) => {
    if (m.user) {
      memberMap.set(m.user_id, {
        id: m.user_id,
        name: m.user.full_name || m.user.email || 'Unknown',
        avatar: m.user.avatar_url,
      });
    }
  });

  // Transform tasks
  const roadmapTasks = tasks.map((task) => {
    const isCompleted = completedColumnIds.includes(task.column_id);
    const state = getTaskState(task.due_date, isCompleted);

    // Get assignee as lead
    const lead = task.assignee
      ? {
          name: task.assignee.full_name || task.assignee.email || 'Unknown',
          avatar: task.assignee.avatar_url,
        }
      : { name: 'Unassigned', avatar: null };

    // Get project members as task members
    const taskMembers = Array.from(memberMap.values()).slice(0, 5);

    // Calculate progress
    let progress = 0;
    if (isCompleted) {
      progress = 100;
    } else if (state === 'Overdue') {
      progress = 75;
    } else if (state === 'Delayed') {
      progress = 50;
    } else {
      progress = 25;
    }

    return {
      id: task.id,
      name: task.title,
      eta: task.due_date || dayjs().add(7, 'day').format('YYYY-MM-DD'),
      lead,
      members: taskMembers,
      progress,
      state,
    };
  });

  return [
    {
      id: project.id,
      name: project.name,
      color: 'primary',
      tasks: roadmapTasks,
    },
  ];
};

/**
 * Transform meetings data to schedule format
 *
 * Expected output shape:
 * [{
 *   id: string,
 *   title: string,
 *   date: 'DD Month, YYYY',
 *   time: 'h:mm A',
 *   status: { label: string, active?: boolean },
 *   joinMeetLink?: string,
 *   attendants: [{ name, avatar }]
 * }]
 *
 * @param {Array} meetings - Raw meetings from database
 * @returns {Array} Formatted meetings for ScheduleMeeting component
 */
export const transformMeetingsToScheduleFormat = (meetings) => {
  if (!meetings || meetings.length === 0) return [];

  const now = dayjs();

  return meetings.map((meeting) => {
    const startTime = dayjs(meeting.start_time);
    const endTime = meeting.end_time ? dayjs(meeting.end_time) : startTime.add(1, 'hour');

    // Calculate status
    let status = { label: startTime.format('MMM D') };
    const diffMinutes = startTime.diff(now, 'minute');

    if (diffMinutes <= 0 && now.isBefore(endTime)) {
      status = { label: 'Now', active: true };
    } else if (diffMinutes > 0 && diffMinutes <= 60) {
      status = { label: `${diffMinutes} min` };
    } else if (diffMinutes > 60 && diffMinutes <= 1440) {
      status = { label: `${Math.ceil(diffMinutes / 60)} hrs` };
    } else if (diffMinutes > 1440) {
      status = { label: `${Math.ceil(diffMinutes / 1440)} days` };
    }

    // Format attendees
    const attendants = (meeting.attendees || []).map((a) => ({
      id: a.user_id,
      name: a.user?.full_name || a.user?.email || 'Unknown',
      avatar: a.user?.avatar_url,
    }));

    return {
      id: meeting.id,
      title: meeting.title,
      date: startTime.format('DD MMMM, YYYY'),
      time: startTime.format('h:mm A'),
      status,
      joinMeetLink: meeting.meeting_link || '#!',
      attendants,
    };
  });
};

/**
 * Transform events data to calendar format
 *
 * Expected output shape:
 * [{
 *   id: string,
 *   title: string,
 *   allDayEvent: boolean,
 *   category: 'important' | 'upcoming' | 'my_events',
 *   startDate: 'YYYY-MM-DD',
 *   startTime: 'h:mm a',
 *   endDate: 'YYYY-MM-DD',
 *   endTime: 'h:mm a',
 *   members: [{ name, avatar }],
 *   eventType: 'physical' | 'online' | 'hybrid',
 *   virtualLink: string,
 *   physical: string,
 *   notificationMinutesBefore: number,
 *   color: string
 * }]
 *
 * @param {Array} events - Raw events from database
 * @returns {Array} Formatted events for Events component
 */
export const transformEventsToCalendarFormat = (events) => {
  if (!events || events.length === 0) return [];

  return events.map((event) => {
    // Format members
    const members = (event.members || []).map((m) => ({
      id: m.user_id,
      name: m.user?.full_name || m.user?.email || 'Unknown',
      avatar: m.user?.avatar_url,
    }));

    return {
      id: event.id,
      title: event.title,
      allDayEvent: event.all_day_event || false,
      category: event.category || 'upcoming',
      startDate: event.start_date,
      startTime: event.start_time
        ? dayjs(`2000-01-01 ${event.start_time}`).format('h:mm a')
        : '9:00 am',
      endDate: event.end_date || event.start_date,
      endTime: event.end_time
        ? dayjs(`2000-01-01 ${event.end_time}`).format('h:mm a')
        : '5:00 pm',
      members,
      eventType: event.event_type || 'physical',
      virtualLink: event.virtual_link || '#!',
      physical: event.physical_location || '',
      notificationMinutesBefore: event.notification_minutes || 15,
      color: event.color || 'primary',
    };
  });
};

/**
 * Transform time entries into hours chart format
 *
 * Expected output shape:
 * {
 *   [projectName]: [hours1, hours2, ...hours9]  // Last 9 days
 * }
 *
 * @param {Array} entries - Time entries from database
 * @param {string} projectName - Name of the current project
 * @returns {Object} Hours data keyed by project name
 */
export const transformTimeEntriesToChartFormat = (entries, projectName = 'Project') => {
  if (!entries || entries.length === 0) {
    // Return 9 zero values if no entries
    return { [projectName]: [0, 0, 0, 0, 0, 0, 0, 0, 0] };
  }

  // Group entries by date for the last 9 days
  const today = dayjs().startOf('day');
  const hoursByDay = {};

  // Initialize last 9 days with 0
  for (let i = 8; i >= 0; i--) {
    const dateKey = today.subtract(i, 'day').format('YYYY-MM-DD');
    hoursByDay[dateKey] = 0;
  }

  // Sum hours for each day
  entries.forEach((entry) => {
    const dateKey = dayjs(entry.date).format('YYYY-MM-DD');
    if (hoursByDay[dateKey] !== undefined) {
      hoursByDay[dateKey] += parseFloat(entry.hours) || 0;
    }
  });

  // Convert to array in chronological order
  const hoursArray = Object.values(hoursByDay).map((h) => Math.round(h * 10) / 10);

  return { [projectName]: hoursArray };
};
