'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Button } from '@mui/material';
import dayjs from 'dayjs';
import {
  generateTimeRanges,
  getFromToDates,
  transformProjectTimelineData,
} from 'helpers/gantt-utils';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import SvelteGanttChart from 'components/base/SvelteGanttChart';

const ProjectTimelineChart = ({
  projectTimelineData,
  hourRange,
  tableHeaderTitle = 'All Projects',
}) => {
  const { down } = useBreakpoints();

  const isSmallScreen = down('sm');
  const collapsedWidth = isSmallScreen ? 60 : 180;
  const expandedWidth = isSmallScreen ? 270 : 236;

  const [tableWidth, setTableWidth] = useState(expandedWidth);

  const ganttData = useMemo(
    () => transformProjectTimelineData(projectTimelineData),
    [projectTimelineData],
  );

  const { from: dataFrom, to: dataTo } = getFromToDates(ganttData.tasks);

  const { from, to } = useMemo(() => {
    if (!hourRange) {
      return { from: dataFrom, to: dataTo };
    }

    const dayStart = dayjs(dataFrom).startOf('day').add(5, 'hour');
    return { from: dayStart.valueOf(), to: dayStart.add(hourRange, 'hour').valueOf() };
  }, [dataFrom, dataTo, hourRange]);

  const timeRanges = useMemo(() => generateTimeRanges(from, to), [from, to]);

  const toggleTableWidth = () => {
    setTableWidth((prevWidth) => (prevWidth === collapsedWidth ? expandedWidth : collapsedWidth));
  };

  useEffect(() => {
    setTableWidth(expandedWidth);
  }, [isSmallScreen, expandedWidth]);

  const options = useMemo(() => {
    const fromDate = dayjs(from);
    const toDate = dayjs(to);
    const numMonths = toDate.diff(fromDate, 'month') + 1;
    const minWidth = hourRange ? Math.max(800, hourRange * 60) : 1700 * numMonths;

    return {
      rows: ganttData.rows.map((row) => ({
        ...row,
        height: 56,
      })),
      tableWidth,
      tasks: ganttData.tasks,
      timeRanges,
      from,
      to,
      minWidth,
      tableHeaders: [{ title: tableHeaderTitle, property: 'label', width: 140, type: 'tree' }],
    };
  }, [ganttData, tableWidth, from, to, hourRange, tableHeaderTitle]);

  return (
    <Box sx={{ width: 1, height: 420, position: 'relative' }}>
      <Button
        color="neutral"
        shape="circle"
        variant="soft"
        sx={({ transitions }) => ({
          position: 'absolute',
          left: `${tableWidth - 14}px`,
          top: 16,
          zIndex: 2,
          transition: transitions.create('left', {
            duration: 300,
            easing: 'ease-in-out',
          }),
          minWidth: 24,
          height: 24,
        })}
        onClick={toggleTableWidth}
      >
        {tableWidth === collapsedWidth ? (
          <IconifyIcon flipOnRTL icon="material-symbols:chevron-right-rounded" />
        ) : (
          <IconifyIcon flipOnRTL icon="material-symbols:chevron-left-rounded" />
        )}
      </Button>
      <SvelteGanttChart chartOptions={options} />
    </Box>
  );
};

export default ProjectTimelineChart;
