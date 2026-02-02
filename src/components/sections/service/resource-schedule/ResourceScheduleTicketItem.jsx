'use client';

import { useCallback, useEffect, useRef } from 'react';
import { alpha } from '@mui/material/styles';
import { resourceScheduleTimelineData } from 'data/service/resourceSchedule';
import { getServicePropertyById, getServicePropertyIndex } from 'data/service/service-properties';
import dayjs from 'dayjs';
import { SvelteGanttExternal } from 'svelte-gantt';
import PipelineCard from 'components/sections/hiring/admin/pipeline/PipelineCard';

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

const ResourceScheduleTicketItem = ({
  pipeline,
  ganttInstance,
  onDropToGantt,
  snapMs,
  durationMs,
}) => {
  const itemRef = useRef(null);
  const externalRef = useRef(null);
  const pointerRef = useRef(null);
  const moveListenerRef = useRef(null);
  const upListenerRef = useRef(null);
  const lastSnapRef = useRef(null);
  const draggingRef = useRef(false);
  const rafRef = useRef(null);

  const updateGhostContent = useCallback(
    (snapped) => {
      if (!externalRef.current?.element || !durationMs) return;
      const timeNode = externalRef.current.element.querySelector('[data-ghost-time]');
      const durationNode = externalRef.current.element.querySelector('[data-ghost-duration]');
      if (snapped) {
        const start = dayjs(snapped).format('h:mm A');
        const end = dayjs(snapped + durationMs).format('h:mm A');
        if (timeNode) timeNode.textContent = `${start} – ${end}`;
      } else if (timeNode) {
        timeNode.textContent = 'Move onto schedule';
      }
      if (durationNode) {
        durationNode.textContent = `${Math.round(durationMs / 60000)} min`;
      }
    },
    [durationMs],
  );

  const updateFromPointer = useCallback(() => {
    if (!ganttInstance || !snapMs || !durationMs) return;
    if (!pointerRef.current) return;
    const rowContainer = ganttInstance.getRowContainer?.();
    if (!rowContainer) {
      updateGhostContent(null);
      return;
    }
    const rect = rowContainer.getBoundingClientRect();
    const x = pointerRef.current.clientX - rect.left + rowContainer.scrollLeft;
    const totalWidth = rowContainer.scrollWidth || rect.width;
    if (x < 0 || x > totalWidth) {
      updateGhostContent(null);
      return;
    }
    const dateAtPointer = ganttInstance.columnService?.getDateByPosition
      ? ganttInstance.columnService.getDateByPosition(x)
      : ganttInstance.utils.getDateByPosition(x);
    const snapped = ganttInstance.utils.roundTo
      ? ganttInstance.utils.roundTo(dateAtPointer)
      : Math.round(dateAtPointer / snapMs) * snapMs;
    lastSnapRef.current = snapped;
    updateGhostContent(snapped);
  }, [ganttInstance, snapMs, durationMs, updateGhostContent]);

  const handlePointerDown = useCallback(
    (event) => {
      pointerRef.current = { clientX: event.clientX, clientY: event.clientY };
      draggingRef.current = true;

      if (moveListenerRef.current || upListenerRef.current) return;

      const handlePointerMove = (moveEvent) => {
        pointerRef.current = { clientX: moveEvent.clientX, clientY: moveEvent.clientY };
        updateFromPointer();
      };

      const handlePointerUp = () => {
        lastSnapRef.current = null;
        draggingRef.current = false;
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        moveListenerRef.current = null;
        upListenerRef.current = null;
      };

      moveListenerRef.current = handlePointerMove;
      upListenerRef.current = handlePointerUp;
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('pointerup', handlePointerUp, { passive: true });
    },
    [updateFromPointer],
  );

  useEffect(() => {
    if (!itemRef.current || !ganttInstance) return undefined;

    externalRef.current?.draggable?.destroy?.();
    externalRef.current = new SvelteGanttExternal(itemRef.current, {
      gantt: ganttInstance,
      enabled: true,
      elementContent: () => {
        const element = document.createElement('div');
        const property = getServicePropertyById(pipeline?.id);
        const techIndex = getServicePropertyIndex(pipeline?.id);
        const techRow =
          resourceScheduleTimelineData[techIndex % resourceScheduleTimelineData.length];
        const techInitials = getInitials(techRow?.label);
        const progressValue = Math.min(100, Math.max(0, ((pipeline?.rating ?? 2) / 5) * 100));
        element.innerHTML = `
          <div
            class="ticket-card-progress"
            style="
              position:absolute;
              top:0;
              left:0;
              height:3px;
              width:${progressValue}%;
              background:var(--mui-palette-success-main, #16a34a);
              box-shadow:inset 0 2px 0 rgba(0,0,0,0.2);
            "
          ></div>
          <div style="display:flex; align-items:center; gap:6px;">
            <div
              style="
                width:26px;
                height:26px;
                border-radius:999px;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:11px;
                font-weight:800;
                background:#fff;
                border:0.5px solid rgba(107, 114, 128, 0.75);
                box-shadow:
                  0 0 0 1px rgba(255, 255, 255, 0.8),
                  0 0 5px rgba(255, 255, 255, 0.6),
                  inset 0 3px 8px rgba(0, 0, 0, 0.45);
              "
            >
              ${techInitials}
            </div>
            <div style="font-size:11px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${property?.name ?? 'New Task'}
            </div>
          </div>
        `;
        Object.assign(element.style, {
          position: 'absolute',
          padding: '5px 9px',
          borderRadius: '999px',
          background: 'var(--mui-palette-background-elevation1, #fff)',
          color: 'var(--mui-palette-text-primary, #0f172a)',
          fontSize: '11px',
          fontWeight: '600',
          pointerEvents: 'none',
          zIndex: '2000',
          boxShadow:
            'inset 0 1px 0 rgba(255, 255, 255, 0.18), inset 0 2px 10px rgba(0, 0, 0, 0.35), 2px 6px 14px rgba(0, 0, 0, 0.16)',
          border: '0.4px solid silver',
          opacity: '0.65',
          transform: 'translate(-50%, -50%)',
          whiteSpace: 'nowrap',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        });
        return element;
      },
      onsuccess: (row, date, gantt) => {
        onDropToGantt?.({
          row,
          date,
          gantt,
          pipeline,
          pointer: pointerRef.current,
        });
        lastSnapRef.current = null;
        draggingRef.current = false;
      },
      onfail: () => {
        lastSnapRef.current = null;
        draggingRef.current = false;
      },
    });

    return () => {
      externalRef.current?.draggable?.destroy?.();
      externalRef.current = null;
    };
  }, [ganttInstance, pipeline, onDropToGantt]);

  useEffect(
    () => () => {
      draggingRef.current = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (moveListenerRef.current) {
        window.removeEventListener('pointermove', moveListenerRef.current);
        moveListenerRef.current = null;
      }
      if (upListenerRef.current) {
        window.removeEventListener('pointerup', upListenerRef.current);
        upListenerRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    if (!ganttInstance) return undefined;
    let frameId = null;
    const tick = () => {
      if (draggingRef.current) {
        updateFromPointer();
        frameId = requestAnimationFrame(tick);
        rafRef.current = frameId;
        return;
      }
      rafRef.current = null;
    };
    frameId = requestAnimationFrame(tick);
    rafRef.current = frameId;
    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      rafRef.current = null;
    };
  }, [ganttInstance, updateFromPointer]);

  const propertyIndex = getServicePropertyIndex(pipeline?.id);
  const tech = resourceScheduleTimelineData[propertyIndex % resourceScheduleTimelineData.length];
  const techInitials = getInitials(tech?.label);

  return (
    <div
      ref={itemRef}
      onPointerDown={handlePointerDown}
      style={{
        cursor: 'grab',
        touchAction: 'pan-y',
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-start',
      }}
    >
      <PipelineCard
        pipeline={pipeline}
        forceCollapsed
        menuPlacement="none"
        detailsLayout="stackedAddress"
        collapsedAvatarLeft={8}
        collapsedContentAlign="avatarLeft"
        collapsedTitleGap={3}
        dividerSx={{ mb: 0, borderColor: 'divider' }}
        progressHeight={3}
        addressSx={{ m: 0, mt: 0 }}
        cityZipSx={{ mt: '3px', m: 0 }}
        avatarProps={{
          src: undefined,
          alt: tech?.label ?? 'Technician',
          children: techInitials,
        }}
        titleSx={{
          whiteSpace: 'normal',
          fontSize: '10px !important',
          lineHeight: '11px !important',
          display: '-webkit-box !important',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          height: 'auto !important',
          mt: 0,
        }}
        sx={{
          border: '0.4px solid',
          borderColor: 'silver',
          my: '4px',
          width: '200px',
          mx: 0,
          bgcolor: 'background.elevation1',
          pb: 0.5,
          boxShadow: (theme) =>
            [
              `inset 0 1px 0 ${alpha(
                theme.palette.common.white,
                theme.palette.mode === 'dark' ? 0.08 : 0.18,
              )}`,
              `inset 0 2px 10px ${alpha(
                theme.palette.grey[900],
                theme.palette.mode === 'dark' ? 0.65 : 0.35,
              )}`,
              `2px 6px 14px ${alpha(
                theme.palette.grey[900],
                theme.palette.mode === 'dark' ? 0.48 : 0.16,
              )}`,
            ].join(', '),
          transition: 'box-shadow 180ms ease, transform 180ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: (theme) =>
              [
                `inset 0 1px 0 ${alpha(
                  theme.palette.common.white,
                  theme.palette.mode === 'dark' ? 0.08 : 0.18,
                )}`,
                `inset 0 2px 10px ${alpha(
                  theme.palette.grey[900],
                  theme.palette.mode === 'dark' ? 0.65 : 0.35,
                )}`,
                `4px 10px 22px ${alpha(
                  theme.palette.grey[900],
                  theme.palette.mode === 'dark' ? 0.55 : 0.2,
                )}`,
              ].join(', '),
          },
        }}
        avatarSx={{
          border: '0.5px solid',
          borderColor: (theme) =>
            alpha(
              theme.palette.mode === 'dark' ? theme.palette.grey[200] : theme.palette.grey[500],
              0.75,
            ),
          bgcolor: (theme) => theme.palette.common.white,
          color: (theme) => theme.palette.getContrastText(theme.palette.common.white),
          fontSize: 13,
          fontWeight: 800,
          boxShadow: (theme) =>
            [
              `0 0 0 1px ${alpha(theme.palette.common.white, 0.8)}`,
              `0 0 5px ${alpha(
                theme.palette.common.white,
                theme.palette.mode === 'dark' ? 0.35 : 0.6,
              )}`,
              `inset 0 3px 8px ${alpha(
                theme.palette.common.black,
                theme.palette.mode === 'dark' ? 0.78 : 0.45,
              )}`,
            ].join(', '),
        }}
      />
    </div>
  );
};

export default ResourceScheduleTicketItem;
