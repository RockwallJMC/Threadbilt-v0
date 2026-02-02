import { alpha } from '@mui/material/styles';

const svelteGanttChart = (theme) => {
  const { vars, typography, direction, transitions, breakpoints, spacing, shape, mixins } = theme;

  return {
    '& .column-header-row': {
      height: `${mixins.gantt.headerRowHeight}px !important`,
    },
    '& .column-header-cell': {
      borderRight: direction === 'ltr' ? `1px !important` : `0px !important`,
      borderLeft: direction === 'rtl' ? `1px !important` : `0px !important`,
      borderTop: `0px !important`,
      borderColor: `${vars.palette.divider} !important`,
      borderStyle: 'solid !important',
      borderBottom: `1px solid ${vars.palette.divider} !important`,
      fontWeight: 'bold !important',
      wordSpacing: spacing(0.625),
      pointerEvents: 'none',
      '&.sticky': {
        justifyContent: 'flex-start !important',
        padding: `0px ${spacing(1)}`,
      },
    },
    '& .header-container .column-header-row:nth-of-type(2)': {
      color: `${vars.palette.text.disabled} !important`,
    },
    '& .header-container .column-header-row:nth-of-type(1)': {
      borderTop: `1px solid ${vars.palette.divider} !important`,

      '& .column-header-cell': {
        paddingLeft: direction === 'ltr' ? spacing(1.875) : 'unset',
        paddingRight: direction === 'rtl' ? spacing(1.875) : 'unset',
      },
    },
    '& .sg-table': {
      transition: transitions.create(['width'], {
        duration: 300,
        easing: 'ease-in-out',
      }),
      overflow: 'hidden',
    },
    '& .sg-table-cell': {
      padding: '0px !important',
      borderBottom: 'none !important',
    },
    '& .sg-table-body-cell': {
      backgroundColor: `${vars.palette.background.paper} !important`,
      width: `${mixins.gantt.tableBodyCellWidth.sm}px !important`,
      [breakpoints.down('sm')]: {
        width: `${mixins.gantt.tableBodyCellWidth.xs}px !important`,
      },
    },
    '& .sg-timeline': {
      marginLeft: 'unset !important',
      marginRight: 'unset !important',
    },
    '& .sg-table-scroller': {
      marginTop: '0px',
      height: '100% !important',
      overflowY: 'auto !important',
      '& .sg-table-rows': {
        height: 'auto !important',
        paddingTop: '0px !important',
      },
    },
    '& .sg-timeline-body': {
      paddingTop: '0px !important',
    },
    '& .sg-gantt': {
      borderBottom: `1px solid ${vars.palette.divider} !important`,
    },
    '& .sg-table-body': {
      paddingBottom: '0px !important',
      borderLeft:
        direction === 'rtl'
          ? `1px solid ${vars.palette.divider} !important`
          : `0px solid ${vars.palette.divider} !important`,

      borderRight:
        direction === 'ltr'
          ? `1px solid ${vars.palette.divider} !important`
          : `0px solid ${vars.palette.divider} !important`,
    },
    '& .sg-task': {
      transition: transitions.create(['all'], {
        duration: 200,
        easing: 'ease-in',
      }),
      borderRadius: `${shape.borderRadius}px !important`,
      color: vars.palette.primary.darker,
      backgroundColor: vars.palette.primary.lighter,
      fontSize: typography.subtitle2.fontSize,
      fontWeight: 500,
      opacity: '1 !important',
      display: 'inline-flex !important',
      alignItems: 'center !important',
      border: `1px solid ${vars.palette.neutral.contrastText} !important`,
      marginLeft: spacing(0.375),
    },
    '& .sg-task.ticket-task': {
      height: `${mixins.gantt.ticketTaskHeight}px !important`,
      borderRadius: '999px !important',
      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(
        theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
        0.98,
      )} 100%) !important`,
      border: `0.25px solid ${vars.palette.grey[400]} !important`,
      boxShadow:
        'inset 0 1px 0 rgba(255, 255, 255, 0.18), inset 0 1px 4px rgba(0, 0, 0, 0.15), 2px 6px 14px rgba(0, 0, 0, 0.16)',
      padding: '0 !important',
      alignItems: 'center !important',
      overflow: 'visible',
      transform: `translateY(${spacing(-0.5)}) !important`,
      marginBottom: '0 !important',
    },
    '& .sg-task.selected:not(.ticket-task)': {
      outline: 'none !important',
      boxShadow: 'none !important',
      border: `1px solid ${vars.palette.neutral.contrastText} !important`,
    },
    '& .sg-task.ticket-task.selected': {
      outline: 'none !important',
      border: `0.25px solid ${vars.palette.grey[400]} !important`,
      boxShadow:
        'inset 0 1px 0 rgba(255, 255, 255, 0.18), inset 0 1px 4px rgba(0, 0, 0, 0.15), 2px 6px 14px rgba(0, 0, 0, 0.16) !important',
      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(
        theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
        0.98,
      )} 100%) !important`,
      opacity: '1 !important',
      visibility: 'visible !important',
      zIndex: 2,
    },
    '& .sg-task.ticket-task.sg-task-selected': {
      outline: 'none !important',
      outlineOffset: '0 !important',
      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(
        theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
        0.98,
      )} 100%) !important`,
      opacity: '1 !important',
      visibility: 'visible !important',
      border: `0.25px solid ${vars.palette.grey[400]} !important`,
      boxShadow:
        'inset 0 1px 0 rgba(255, 255, 255, 0.18), inset 0 1px 4px rgba(0, 0, 0, 0.15), 2px 6px 14px rgba(0, 0, 0, 0.16) !important',
      zIndex: 2,
    },
    '& .sg-task-selected': {
      outline: 'none !important',
      outlineOffset: '0 !important',
      zIndex: 2,
      opacity: '1 !important',
      visibility: 'visible !important',
    },
    '& .sg-task.sg-task-selected': {
      display: 'inline-flex !important',
      opacity: '1 !important',
      visibility: 'visible !important',
    },
    '& .sg-task.ticket-task.sg-task-selected': {
      backgroundColor: `${vars.palette.background.elevation1} !important`,
      border: `0.25px solid ${vars.palette.grey[400]} !important`,
      boxShadow:
        'inset 0 1px 0 rgba(255, 255, 255, 0.18), inset 0 2px 10px rgba(0, 0, 0, 0.35), 2px 6px 14px rgba(0, 0, 0, 0.16) !important',
      opacity: '1 !important',
      visibility: 'visible !important',
    },
    '& .sg-task.ticket-task.moving': {
      outline: 'none !important',
      border: `0.25px solid ${vars.palette.grey[400]} !important`,
      boxShadow:
        'inset 0 1px 0 rgba(255, 255, 255, 0.18), inset 0 1px 4px rgba(0, 0, 0, 0.15), 2px 6px 14px rgba(0, 0, 0, 0.16) !important',
      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(
        theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
        0.98,
      )} 100%) !important`,
    },
    '& .sg-task.ticket-ghost': {
      height: `${mixins.gantt.ticketTaskHeight}px !important`,
      borderRadius: '999px !important',
      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(
        theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
        0.98,
      )} 100%) !important`,
      border: `0.25px solid ${vars.palette.grey[400]} !important`,
      boxShadow:
        'inset 0 1px 0 rgba(255, 255, 255, 0.18), inset 0 1px 4px rgba(0, 0, 0, 0.15), 2px 6px 14px rgba(0, 0, 0, 0.16)',
      padding: '0 !important',
      alignItems: 'center !important',
      opacity: 0.6,
      transform: `translateY(${spacing(-0.5)}) !important`,
      marginBottom: '0 !important',
    },
    '& .sg-task.ticket-ghost .sg-task-content': {
      color: `${vars.palette.text.secondary} !important`,
      fontWeight: 500,
    },
    '& .sg-task.ticket-task::before': {
      content: 'none',
    },
    '& .sg-task.ticket-task .sg-task-content': {
      height: '100% !important',
      lineHeight: '1',
      fontWeight: 500,
      color: vars.palette.text.primary,
      padding: '0 !important',
      display: 'flex !important',
      alignItems: 'center !important',
    },
    '& .sg-task.ticket-task .ticket-card-progress': {
      position: 'absolute',
      top: 0,
      left: 0,
      height: spacing(0.5),
      width: 'var(--ticket-progress, 0%)',
      background: `linear-gradient(90deg, ${alpha(theme.palette.success.light, 0.9)} 0%, ${
        theme.palette.success.main
      } 100%)`,
      borderTopLeftRadius: '999px',
      borderTopRightRadius: '999px',
      boxShadow: `0 1px 3px ${alpha(theme.palette.success.dark, 0.9)}`,
      zIndex: 0,
      pointerEvents: 'none',
    },
    '& .sg-task.ticket-task .ticket-card-body': {
      display: 'flex',
      alignItems: 'center',
      gap: spacing(1),
      minWidth: 0,
      width: '100%',
    },
    '& .sg-task.ticket-task .ticket-card-content': {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing(0.25),
      minWidth: 0,
      flex: 1,
    },
    '& .sg-task.ticket-task .ticket-card-avatar': {
      width: `${mixins.gantt.avatarSize}px`,
      height: `${mixins.gantt.avatarSize}px`,
      borderRadius: '999px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: typography.caption.fontSize,
      fontWeight: 800,
      backgroundColor: `${vars.palette.common.white}`,
      color: `${vars.palette.text.primary}`,
      border: `0.5px solid ${vars.palette.grey[500]}`,
      boxShadow:
        '0 0 0 1px rgba(255, 255, 255, 0.8), 0 0 5px rgba(255, 255, 255, 0.6), inset 0 3px 8px rgba(0, 0, 0, 0.45)',
      flexShrink: 0,
    },
    '& .sg-task.ticket-task .ticket-card-title': {
      fontSize: typography.caption.fontSize,
      fontWeight: 700,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      color: vars.palette.text.primary,
    },
    '& .sg-task.ticket-task .ticket-card-time': {
      fontSize: '9px',
      fontWeight: 600,
      color: vars.palette.text.secondary,
      whiteSpace: 'nowrap',
    },
    '& .sg-task-content': {
      width: '100%',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      display: 'inline-block !important',
      position: 'relative !important',
      height: '20px !important',
      userSelect: 'all !important',
      lineHeight: '18.2px',
      paddingLeft: direction === 'ltr' ? spacing(1) : 'unset',
      paddingRight: direction === 'rtl' ? spacing(1) : 'unset',
    },
    '& .sg-task.ticket-task .sg-task-content': {
      height: '100% !important',
      paddingLeft: '0 !important',
      paddingRight: '0 !important',
      display: 'flex !important',
      alignItems: 'center !important',
    },
    '& .sg-task .task-time, & .sg-task .task-duration': {
      display: 'none',
      fontSize: typography.caption.fontSize,
      lineHeight: 1.2,
      color: vars.palette.text.secondary,
    },
    '& .sg-task.moving .task-label': {
      fontWeight: 600,
    },
    '& .sg-task.moving .task-time, & .sg-task.moving .task-duration': {
      display: 'block',
    },
    '& .sg-task.moving .sg-task-content': {
      height: 'auto !important',
      whiteSpace: 'normal',
      display: 'flex !important',
      flexDirection: 'column',
      gap: spacing(0.25),
    },
    '& .sg-task.ticket-task .task-time, & .sg-task.ticket-task .task-duration': {
      display: 'none !important',
    },
    '& .sg-task.ticket-task.moving': {
      opacity: '0.6 !important',
    },
    '& .sg-task.ticket-task.moving .sg-task-content': {
      height: '100% !important',
      whiteSpace: 'nowrap',
      display: 'flex !important',
      flexDirection: 'row',
      gap: '0',
    },
    '& .sg-task.ticket-task-emergency': {
      borderColor: `${vars.palette.error.main} !important`,
      boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.18), inset 0 2px 10px rgba(0, 0, 0, 0.35), 2px 6px 14px ${alpha(
        theme.palette.error.main,
        0.9,
      )} !important`,
    },
    '& .sg-task.ticket-task-promised': {
      borderColor: `${vars.palette.warning.main} !important`,
      boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.18), inset 0 2px 10px rgba(0, 0, 0, 0.35), 2px 6px 14px ${alpha(
        theme.palette.warning.main,
        0.3,
      )} !important`,
    },
    '& .sg-task.ticket-task-part-order': {
      borderColor: `${vars.palette.info.main} !important`,
      boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.18), inset 0 2px 10px rgba(0, 0, 0, 0.35), 2px 6px 14px ${alpha(
        theme.palette.info.main,
        0.3,
      )} !important`,
    },
    '& .sg-task.ticket-task-complete': {
      borderColor: `${vars.palette.success.main} !important`,
      boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.18), inset 0 2px 10px rgba(0, 0, 0, 0.35), 2px 6px 14px ${alpha(
        theme.palette.success.main,
        0.3,
      )} !important`,
    },
    '& .sg-task.ticket-task-pending': {
      opacity: 0.85,
    },
    '& .sg-tree-expander': {
      minWidth: spacing(0.5),
      height: '100%',
      backgroundColor: vars.palette.primary.light,
    },
    '& .sg-row': {
      borderBottom: `1px solid ${vars.palette.divider} !important`,
    },
    '& .sg-row:last-of-type': {
      borderBottom: 'none !important',
    },
    '& .sg-timeline-rows .sg-row.tech-blue': {
      boxShadow: `inset 0 -1px 0 ${alpha(theme.palette.primary.main, 0.45)}`,
    },
    '& .sg-timeline-rows .sg-row.tech-orange': {
      boxShadow: `inset 0 -1px 0 ${alpha(theme.palette.warning.main, 0.45)}`,
    },
    '& .sg-timeline-rows .sg-row.tech-green': {
      boxShadow: `inset 0 -1px 0 ${alpha(theme.palette.success.main, 0.45)}`,
    },
    '& .sg-timeline-rows .sg-row.tech-purple': {
      boxShadow: `inset 0 -1px 0 ${alpha(theme.palette.secondary.main, 0.4)}`,
    },
    '& .sg-timeline-rows .sg-row.tech-red': {
      boxShadow: `inset 0 -1px 0 ${alpha(theme.palette.error.main, 0.45)}`,
    },
    '& .sg-timeline-rows .sg-row.tech-cyan': {
      boxShadow: `inset 0 -1px 0 ${alpha(theme.palette.info.main, 0.45)}`,
    },
    '& .sg-row.tech-cyan': {
      borderBottom: `1px solid ${vars.palette.divider} !important`,
    },
    '& .sg-table-row.tech-cyan .sg-cell': {
      borderBottom: `1px solid ${vars.palette.divider} !important`,
    },
    '& .sg-table-header': {
      paddingTop: spacing(2),
      paddingLeft: direction === 'ltr' ? spacing(1.875) : 'unset',
      paddingRight: direction === 'rtl' ? spacing(1.875) : 'unset',
      backgroundColor: 'transparent !important',
      borderTop: `1px solid ${vars.palette.divider} !important`,
      borderRight:
        direction === 'ltr'
          ? `1px solid ${vars.palette.divider} !important`
          : `0px solid ${vars.palette.divider} !important`,
      borderLeft:
        direction === 'rtl'
          ? `1px solid ${vars.palette.divider} !important`
          : `0px solid ${vars.palette.divider} !important`,

      borderBottom: `1px solid ${vars.palette.divider} !important`,
    },
    '& .sg-table-header-cell': {
      fontWeight: 'bold !important',
      display: 'inline !important',
    },
    '& .sg-header': {
      marginLeft: 'unset',
      backgroundColor: vars.palette.background.elevation1,
      color: vars.palette.text.secondary,
      pointerEvents: 'none',
      paddingRight: '0px !important',
    },
  };
};

export default svelteGanttChart;
