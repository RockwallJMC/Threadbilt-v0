'use client';

import { useMemo } from 'react';
import { Box, useTheme } from '@mui/material';
import SvelteGanttChart from 'components/base/SvelteGanttChart';

const GanttChart = ({
  tasks = [],
  viewMode = 'month',
  showDependencies = true,
  showCriticalPath = false,
  zoomLevel = 1,
  onTaskUpdate,
  onTaskSelect,
  isMobile = false
}) => {
  const theme = useTheme();

  // Generate time ranges based on view mode
  const getTimeRange = () => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    switch (viewMode) {
      case 'day':
        start.setDate(now.getDate() - 30);
        end.setDate(now.getDate() + 30);
        break;
      case 'week':
        start.setDate(now.getDate() - 90);
        end.setDate(now.getDate() + 90);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 6);
        end.setMonth(now.getMonth() + 6);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 12);
        end.setMonth(now.getMonth() + 12);
        break;
      default:
        start.setMonth(now.getMonth() - 6);
        end.setMonth(now.getMonth() + 6);
    }

    return { start, end };
  };

  // Configure headers based on view mode
  const getHeaders = () => {
    switch (viewMode) {
      case 'day':
        return [
          { unit: 'month', format: 'MMMM YYYY', sticky: true },
          { unit: 'day', format: 'DD' }
        ];
      case 'week':
        return [
          { unit: 'month', format: 'MMMM YYYY', sticky: true },
          { unit: 'week', format: 'w' }
        ];
      case 'month':
        return [
          { unit: 'year', format: 'YYYY', sticky: true },
          { unit: 'month', format: 'MMM' }
        ];
      case 'quarter':
        return [
          { unit: 'year', format: 'YYYY', sticky: true },
          { unit: 'quarter', format: '[Q]Q' }
        ];
      default:
        return [
          { unit: 'month', format: 'MMMM', sticky: true },
          { unit: 'day', format: 'DD d' }
        ];
    }
  };

  const chartOptions = useMemo(() => {
    const { start, end } = getTimeRange();
    
    return {
      rows: tasks,
      tasks: tasks,
      dependencies: showDependencies ? tasks.flatMap(task => 
        (task.dependencies || []).map(depId => ({
          id: `${depId}-${task.id}`,
          fromId: depId,
          toId: task.id,
          stroke: showCriticalPath ? theme.palette.error.main : theme.palette.primary.main,
          strokeWidth: showCriticalPath ? 3 : 2,
          arrowSize: 8
        }))
      ) : [],
      timeRanges: [{
        id: 'current',
        from: start,
        to: end,
        classes: 'time-range-current'
      }],
      from: start,
      to: end,
      headers: getHeaders(),
      fitWidth: !isMobile,
      minWidth: isMobile ? 800 : 1200,
      tableWidth: isMobile ? 120 : 200,
      rowHeight: isMobile ? 40 : 52,
      rowPadding: isMobile ? 4 : 6,
      columnWidth: Math.floor(60 * zoomLevel),
      magnetUnit: viewMode === 'day' ? 'hour' : 'day',
      magnetOffset: 0,
      onTaskButtonClick: onTaskSelect,
      onTaskChanged: onTaskUpdate,
      classes: `gantt-${theme.palette.mode} ${isMobile ? 'gantt-mobile' : ''}`
    };
  }, [tasks, viewMode, showDependencies, showCriticalPath, zoomLevel, theme, isMobile, onTaskUpdate, onTaskSelect]);

  return (
    <Box sx={{ height: '100%', width: '100%', overflow: 'auto' }}>
      <SvelteGanttChart chartOptions={chartOptions} />
    </Box>
  );
};

export default GanttChart;
