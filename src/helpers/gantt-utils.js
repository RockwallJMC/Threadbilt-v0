import dayjs from 'dayjs';

const statusPriority = {
  ongoing: 1,
  due: 2,
  complete: 3,
};

const getStatusPriority = (status) => statusPriority[status] ?? 99;

export const transformProjectTimelineData = (timelineData) => {
  const sortedProjects = timelineData.sort(
    (a, b) => getStatusPriority(a.status) - getStatusPriority(b.status),
  );

  const hasStatusGroups = sortedProjects.some((project) => Boolean(project.status));

  const groupedProjects = sortedProjects.reduce((acc, project) => {
    const groupKey = hasStatusGroups ? project.status : '__all__';
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(project);
    return acc;
  }, {});

  const transformedRows = sortedProjects.map((project) => {
    const groupKey = hasStatusGroups ? project.status : '__all__';
    const group = groupedProjects[groupKey];

    const isFirst = hasStatusGroups && group[0].id === project.id;
    const isLast = hasStatusGroups && group[group.length - 1].id === project.id;

    const rowClass = project.rowClass || project.status;

    return {
      id: project.id,
      label: project.label,
      classes: [
        rowClass,
        ...(isFirst ? ['task-divider-start'] : []),
        ...(isLast ? ['task-divider-end'] : []),
      ],
    };
  });

  const transformedTasks = sortedProjects.flatMap((project) => {
    const taskClass = project.taskClass || project.rowClass || project.status;
    return project.tasks.map((task) => ({
      ...task,
      id: task.id,
      from: task.startDate,
      to: task.endDate,
      resourceId: project.id,
      classes: [taskClass],
    }));
  });

  return {
    rows: transformedRows,
    tasks: transformedTasks,
  };
};

export const getFromToDates = (tasks) => {
  const { earliestStartDate, latestEndDate } = tasks.reduce(
    (acc, task) => ({
      earliestStartDate: Math.min(acc.earliestStartDate, task.startDate),
      latestEndDate: Math.max(acc.latestEndDate, task.endDate),
    }),
    { earliestStartDate: tasks[0].startDate, latestEndDate: tasks[0].endDate },
  );

  return {
    from: dayjs(earliestStartDate).startOf('month').valueOf(),
    to: dayjs(latestEndDate).endOf('month').valueOf(),
  };
};

export const customDateAdapter = {
  format(date, format) {
    if (format === 'DD d') {
      const day = dayjs(date);
      const dayNumber = day.format('DD');
      const dayLetter = day.day();

      const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

      return `${dayNumber} ${dayLetters[dayLetter]}`;
    }

    if (format === 'hh A') {
      const hour = dayjs(date).format('hh');
      const meridiem = dayjs(date).format('A').charAt(0);

      return `${hour} ${meridiem}`;
    }

    return dayjs(date).format(format);
  },

  roundTo(date, unit, offset) {
    const ms = dayjs(date).valueOf();

    if (unit === 'minute') {
      const step = offset * 60 * 1000;
      return Math.round(ms / step) * step;
    }

    if (unit === 'hour') {
      const step = offset * 60 * 60 * 1000;
      return Math.round(ms / step) * step;
    }

    if (unit === 'day') {
      const step = offset * 24 * 60 * 60 * 1000;
      return Math.round(ms / step) * step;
    }

    const base = dayjs(date).startOf(unit);
    const diff = dayjs(date).diff(base, unit, true);
    const rounded = Math.round(diff / offset) * offset;
    return base.add(rounded, unit).valueOf();
  },
};

export const generateTimeRanges = (from, to) => {
  const timeRanges = [];
  let current = dayjs(from).startOf('week');

  if (current.day() !== 0) {
    current = current.add(7 - current.day(), 'day');
  }

  let id = 1;

  while (current.valueOf() <= to) {
    const sundayStart = current.startOf('day').valueOf();
    const sundayEnd = current.endOf('day').valueOf();

    timeRanges.push({
      id: id++,
      from: sundayStart,
      to: sundayEnd,
      resizable: false,
    });

    current = current.add(7, 'day');
  }

  return timeRanges;
};
