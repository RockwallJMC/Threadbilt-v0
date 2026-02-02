'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { customDateAdapter } from 'helpers/gantt-utils';
import { SvelteGantt, SvelteGanttDependencies, SvelteGanttTable } from 'svelte-gantt';

const SvelteGanttChart = ({ chartOptions, sx, containerRef, onInit, syncTasks = true }) => {
  const ganttContainerRef = useRef(null);
  const ganttInstanceRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(0);

  const derivedOptions = useMemo(() => {
    const rows = chartOptions?.rows ?? [];
    const rowCount = rows.length || 1;
    const baseRowHeight = chartOptions?.rowHeight ?? 56;
    const minRowHeight = 40;
    const targetHeight =
      containerHeight > 0 ? Math.floor(containerHeight / rowCount) : baseRowHeight;
    const rowHeight = Math.max(minRowHeight, Math.min(baseRowHeight, targetHeight));
    const basePadding = chartOptions?.rowPadding ?? 8;
    const scale = baseRowHeight > 0 ? rowHeight / baseRowHeight : 1;
    const rowPadding = Math.max(0, Math.round(basePadding * scale));

    return {
      ...chartOptions,
      rowHeight,
      rowPadding,
      rows: rows.map((row) => ({ ...row, height: rowHeight })),
    };
  }, [chartOptions, containerHeight]);

  useEffect(() => {
    let frameId = null;

    const container = ganttContainerRef.current;
    if (container?.offsetHeight) {
      setContainerHeight(container.offsetHeight);
      frameId = requestAnimationFrame(() => {
        ganttInstanceRef.current = new SvelteGantt({
          target: container,
          props: {
            dateAdapter: customDateAdapter,
            fitWidth: true,
            tableWidth: 166,
            rowHeight: 56,
            rowPadding: 8,
            classes: 'gantt-chart',
            columnStrokeColor: 'transparent',
            columnStrokeWidth: 0,
            headers: [
              { unit: 'day', format: 'ddd', sticky: true },
              { unit: 'hour', format: 'hh A' },
            ],
            minWidth: 1700,
            magnetUnit: 'minute',
            magnetOffset: 15,
            ganttTableModules: [SvelteGanttTable],
            ganttBodyModules: [SvelteGanttDependencies],
            useCanvasColumns: true,
            layout: 'overlap',
            ...derivedOptions,
          },
        });
        if (onInit) {
          onInit(ganttInstanceRef.current);
        }
      });
    }

    return () => {
      cancelAnimationFrame(frameId);
      ganttInstanceRef.current?.$destroy();
    };
  }, []);

  useEffect(() => {
    if (!ganttContainerRef.current) return undefined;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const nextHeight = Math.round(entry.contentRect.height);
      setContainerHeight(nextHeight);
    });
    observer.observe(ganttContainerRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const ganttInstance = ganttInstanceRef.current;
    if (!ganttInstance) return;
    if (!syncTasks) {
      const { tasks, ...restOptions } = derivedOptions;
      ganttInstance.$set(restOptions);
      return;
    }
    ganttInstance.$set(derivedOptions);
  }, [derivedOptions, syncTasks]);

  return (
    <Box
      ref={(node) => {
        ganttContainerRef.current = node;
        if (containerRef) {
          containerRef.current = node;
        }
      }}
      sx={{
        height: 1,
        boxShadow: 'inset 0 0 10px #C0C0C0',
        ...sx,
      }}
    />
  );
};

export default SvelteGanttChart;
