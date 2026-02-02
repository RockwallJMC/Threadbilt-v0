import { alpha } from '@mui/material/styles';
import { cssVarRgba } from 'lib/utils';

const projectTimelineChart = (theme) => {
  const { vars } = theme;

  return {
    '& .sg-task.ongoing': {
      backgroundColor: vars.palette.chBlue[100],
      color: `${vars.palette.primary.darker} !important`,
    },
    '& .sg-task.complete': {
      backgroundColor: vars.palette.chGreen[100],
      color: `${vars.palette.success.darker} !important`,
    },
    '& .sg-task.due': {
      backgroundColor: vars.palette.chOrange[100],
      color: `${vars.palette.warning.darker} !important`,
    },
    '& .sg-task.tech-blue': {
      backgroundColor: vars.palette.chBlue[100],
      color: `${vars.palette.primary.darker} !important`,
    },
    '& .sg-task.tech-orange': {
      backgroundColor: vars.palette.chOrange[100],
      color: `${vars.palette.warning.darker} !important`,
    },
    '& .sg-task.tech-green': {
      backgroundColor: vars.palette.chGreen[100],
      color: `${vars.palette.success.darker} !important`,
    },
    '& .sg-task.tech-purple': {
      backgroundColor: `${cssVarRgba(vars.palette.secondary.lightChannel, 0.22)} !important`,
      color: `${vars.palette.secondary.darker} !important`,
    },
    '& .sg-task.tech-red': {
      backgroundColor: `${cssVarRgba(vars.palette.error.lightChannel, 0.2)} !important`,
      color: `${vars.palette.error.darker} !important`,
    },
    '& .sg-task.tech-cyan': {
      backgroundColor: `${cssVarRgba(vars.palette.info.lightChannel, 0.22)} !important`,
      color: `${vars.palette.info.darker} !important`,
    },
    '& .sg-cell-inner': {
      paddingLeft: theme.direction === 'ltr' ? '24px !important' : 'unset',
      paddingRight: theme.direction === 'rtl' ? '24px !important' : 'unset',
      whiteSpace: 'pre-line',
      fontWeight: 400,
      color: vars.palette.text.secondary,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box !important',
      WebkitLineClamp: '2',
      WebkitBoxOrient: 'vertical',
      position: 'relative',
      zIndex: 1,
    },
    '& .sg-foreground': {
      '& .sg-task-background': {
        border: `1px solid ${cssVarRgba(vars.palette.grey['500Channel'], 0.5)} !important`,
        boxShadow: `${`inset 0 1px 0 ${cssVarRgba(
          vars.palette.common.whiteChannel,
          theme.palette.mode === 'dark' ? 0.14 : 0.32,
        )}`}, ${`0 1px 3px ${cssVarRgba(
          vars.palette.grey['950Channel'],
          theme.palette.mode === 'dark' ? 0.55 : 0.3,
        )}`} !important`,
      },
      '& .sg-time-range': {
        width: '1px !important',
        backgroundImage: 'none !important',
        backgroundColor: vars.palette.divider,
        transform: 'scaleY(0.94)',
      },
      '& .due .sg-task-background': {
        borderRadius: '4px !important',
        backgroundColor: `${cssVarRgba(vars.palette.warning.lightChannel, 0.15)} !important`,
      },
      '& .complete .sg-task-background': {
        borderRadius: '4px !important',
        backgroundColor: `${vars.palette.chGreen[100]} !important`,
      },
      '& .ongoing .sg-task-background': {
        borderRadius: '4px !important',
        backgroundColor: `${vars.palette.chBlue[100]} !important`,
      },
      '& .tech-blue .sg-task-background': {
        borderRadius: '4px !important',
        backgroundColor: `${vars.palette.chBlue[100]} !important`,
      },
      '& .tech-orange .sg-task-background': {
        borderRadius: '4px !important',
        backgroundColor: `${cssVarRgba(vars.palette.warning.lightChannel, 0.15)} !important`,
      },
      '& .tech-green .sg-task-background': {
        borderRadius: '4px !important',
        backgroundColor: `${vars.palette.chGreen[100]} !important`,
      },
      '& .tech-purple .sg-task-background': {
        borderRadius: '4px !important',
        backgroundColor: `${cssVarRgba(vars.palette.secondary.lightChannel, 0.22)} !important`,
      },
      '& .tech-red .sg-task-background': {
        borderRadius: '4px !important',
        backgroundColor: `${cssVarRgba(vars.palette.error.lightChannel, 0.2)} !important`,
      },
      '& .tech-cyan .sg-task-background': {
        borderRadius: '4px !important',
        backgroundColor: `${cssVarRgba(vars.palette.info.lightChannel, 0.22)} !important`,
      },
    },
    '& .sg-table-rows': {
      '& .sg-table-row': {
        position: 'relative',
        overflow: 'hidden',
        '&:after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          backgroundImage: 'none',
          backgroundRepeat: 'no-repeat',
        },
        '&:before': {
          content: '""',
          position: 'absolute',
          left: theme.direction === 'ltr' ? 0 : 'unset',
          right: theme.direction === 'rtl' ? 0 : 'unset',
          height: '100%',
          width: '4px',
          backgroundColor: vars.palette.divider,
        },
        '&.task-divider-end:before': {
          top: 0,
          height: '86%',
        },
        '&.task-divider-start:before': {
          bottom: 0,
          height: '86%',
        },
        '&.task-divider-end.task-divider-start:before': {
          height: '80%',
          top: '50%',
          transform: 'translateY(-50%)',
        },
      },
      '& .complete': {
        '&:before': {
          backgroundColor: vars.palette.success.main,
        },
      },
      '& .due': {
        '&:before': {
          backgroundColor: vars.palette.warning.main,
        },
      },
      '& .ongoing': {
        '&:before': {
          backgroundColor: vars.palette.primary.main,
        },
      },
      '& .tech-blue': {
        boxShadow: [
          `inset 0 1px 2px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === 'dark' ? 0.32 : 0.22,
          )}`,
          `inset 0 -1px 2px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === 'dark' ? 0.32 : 0.22,
          )}`,
        ].join(', '),
        '&:after': {
          backgroundImage:
            theme.direction === 'rtl'
              ? `${`linear-gradient(180deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(0deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(270deg, ${alpha(
                  theme.palette.primary.main,
                  theme.palette.mode === 'dark' ? 0.34 : 0.24,
                )} 0%, ${alpha(
                  theme.palette.primary.main,
                  theme.palette.mode === 'dark' ? 0.2 : 0.14,
                )} 36%, ${alpha(theme.palette.primary.main, 0)} 88%)`}`
              : `${`linear-gradient(180deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(0deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(90deg, ${alpha(
                  theme.palette.primary.main,
                  theme.palette.mode === 'dark' ? 0.34 : 0.24,
                )} 0%, ${alpha(
                  theme.palette.primary.main,
                  theme.palette.mode === 'dark' ? 0.2 : 0.14,
                )} 36%, ${alpha(theme.palette.primary.main, 0)} 88%)`}`,
        },
        '&:before': {
          backgroundColor: vars.palette.primary.main,
        },
      },
      '& .tech-orange': {
        boxShadow: [
          `inset 0 1px 2px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === 'dark' ? 0.32 : 0.22,
          )}`,
          `inset 0 -1px 2px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === 'dark' ? 0.32 : 0.22,
          )}`,
        ].join(', '),
        '&:after': {
          backgroundImage:
            theme.direction === 'rtl'
              ? `${`linear-gradient(180deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(0deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(270deg, ${alpha(
                  theme.palette.warning.main,
                  theme.palette.mode === 'dark' ? 0.34 : 0.24,
                )} 0%, ${alpha(
                  theme.palette.warning.main,
                  theme.palette.mode === 'dark' ? 0.2 : 0.14,
                )} 36%, ${alpha(theme.palette.warning.main, 0)} 88%)`}`
              : `${`linear-gradient(180deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(0deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(90deg, ${alpha(
                  theme.palette.warning.main,
                  theme.palette.mode === 'dark' ? 0.34 : 0.24,
                )} 0%, ${alpha(
                  theme.palette.warning.main,
                  theme.palette.mode === 'dark' ? 0.2 : 0.14,
                )} 36%, ${alpha(theme.palette.warning.main, 0)} 88%)`}`,
        },
        '&:before': {
          backgroundColor: vars.palette.warning.main,
        },
      },
      '& .tech-green': {
        boxShadow: [
          `inset 0 1px 2px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === 'dark' ? 0.32 : 0.22,
          )}`,
          `inset 0 -1px 2px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === 'dark' ? 0.32 : 0.22,
          )}`,
        ].join(', '),
        '&:after': {
          backgroundImage:
            theme.direction === 'rtl'
              ? `${`linear-gradient(180deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(0deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(270deg, ${alpha(
                  theme.palette.success.main,
                  theme.palette.mode === 'dark' ? 0.34 : 0.24,
                )} 0%, ${alpha(
                  theme.palette.success.main,
                  theme.palette.mode === 'dark' ? 0.2 : 0.14,
                )} 36%, ${alpha(theme.palette.success.main, 0)} 88%)`}`
              : `${`linear-gradient(180deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(0deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(90deg, ${alpha(
                  theme.palette.success.main,
                  theme.palette.mode === 'dark' ? 0.34 : 0.24,
                )} 0%, ${alpha(
                  theme.palette.success.main,
                  theme.palette.mode === 'dark' ? 0.2 : 0.14,
                )} 36%, ${alpha(theme.palette.success.main, 0)} 88%)`}`,
        },
        '&:before': {
          backgroundColor: vars.palette.success.main,
        },
      },
      '& .tech-purple': {
        boxShadow: [
          `inset 0 1px 2px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === 'dark' ? 0.32 : 0.22,
          )}`,
          `inset 0 -1px 2px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === 'dark' ? 0.32 : 0.22,
          )}`,
        ].join(', '),
        '&:after': {
          backgroundImage:
            theme.direction === 'rtl'
              ? `${`linear-gradient(180deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(0deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(270deg, ${alpha(
                  theme.palette.secondary.main,
                  theme.palette.mode === 'dark' ? 0.28 : 0.2,
                )} 0%, ${alpha(
                  theme.palette.secondary.main,
                  theme.palette.mode === 'dark' ? 0.17 : 0.12,
                )} 36%, ${alpha(theme.palette.secondary.main, 0)} 88%)`}`
              : `${`linear-gradient(180deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(0deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(90deg, ${alpha(
                  theme.palette.secondary.main,
                  theme.palette.mode === 'dark' ? 0.28 : 0.2,
                )} 0%, ${alpha(
                  theme.palette.secondary.main,
                  theme.palette.mode === 'dark' ? 0.17 : 0.12,
                )} 36%, ${alpha(theme.palette.secondary.main, 0)} 88%)`}`,
        },
        '&:before': {
          backgroundColor: vars.palette.secondary.main,
        },
      },
      '& .tech-red': {
        boxShadow: [
          `inset 0 1px 2px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === 'dark' ? 0.32 : 0.22,
          )}`,
          `inset 0 -1px 2px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === 'dark' ? 0.32 : 0.22,
          )}`,
        ].join(', '),
        '&:after': {
          backgroundImage:
            theme.direction === 'rtl'
              ? `${`linear-gradient(180deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(0deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(270deg, ${alpha(
                  theme.palette.error.main,
                  theme.palette.mode === 'dark' ? 0.28 : 0.2,
                )} 0%, ${alpha(
                  theme.palette.error.main,
                  theme.palette.mode === 'dark' ? 0.17 : 0.12,
                )} 36%, ${alpha(theme.palette.error.main, 0)} 88%)`}`
              : `${`linear-gradient(180deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(0deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(90deg, ${alpha(
                  theme.palette.error.main,
                  theme.palette.mode === 'dark' ? 0.28 : 0.2,
                )} 0%, ${alpha(
                  theme.palette.error.main,
                  theme.palette.mode === 'dark' ? 0.17 : 0.12,
                )} 36%, ${alpha(theme.palette.error.main, 0)} 88%)`}`,
        },
        '&:before': {
          backgroundColor: vars.palette.error.main,
        },
      },
      '& .tech-cyan': {
        boxShadow: [
          `inset 0 1px 2px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === 'dark' ? 0.32 : 0.22,
          )}`,
          `inset 0 -1px 2px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === 'dark' ? 0.32 : 0.22,
          )}`,
        ].join(', '),
        '&:after': {
          backgroundImage:
            theme.direction === 'rtl'
              ? `${`linear-gradient(180deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(0deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(270deg, ${alpha(
                  theme.palette.info.main,
                  theme.palette.mode === 'dark' ? 0.28 : 0.2,
                )} 0%, ${alpha(
                  theme.palette.info.main,
                  theme.palette.mode === 'dark' ? 0.17 : 0.12,
                )} 36%, ${alpha(theme.palette.info.main, 0)} 88%)`}`
              : `${`linear-gradient(180deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(0deg, ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.28,
                )} 0%, ${alpha(theme.palette.common.black, 0)} 6px)`}, ${`linear-gradient(90deg, ${alpha(
                  theme.palette.info.main,
                  theme.palette.mode === 'dark' ? 0.28 : 0.2,
                )} 0%, ${alpha(
                  theme.palette.info.main,
                  theme.palette.mode === 'dark' ? 0.17 : 0.12,
                )} 36%, ${alpha(theme.palette.info.main, 0)} 88%)`}`,
        },
        '&:before': {
          backgroundColor: vars.palette.info.main,
        },
      },

      '& .sg-table-row.tech-blue .sg-cell, & .sg-table-row.tech-orange .sg-cell, & .sg-table-row.tech-green .sg-cell, & .sg-table-row.tech-purple .sg-cell, & .sg-table-row.tech-red .sg-cell, & .sg-table-row.tech-cyan .sg-cell':
        {
          boxShadow: [
            `inset 0 1px 2px ${alpha(
              theme.palette.common.black,
              theme.palette.mode === 'dark' ? 0.34 : 0.24,
            )}`,
            `inset 0 -1px 2px ${alpha(
              theme.palette.common.black,
              theme.palette.mode === 'dark' ? 0.34 : 0.24,
            )}`,
          ].join(', '),
        },
    },

    '& .sg-timeline-rows .sg-row.tech-blue, & .sg-timeline-rows .sg-row.tech-orange, & .sg-timeline-rows .sg-row.tech-green, & .sg-timeline-rows .sg-row.tech-purple, & .sg-timeline-rows .sg-row.tech-red, & .sg-timeline-rows .sg-row.tech-cyan':
      {
        boxShadow: [
          `inset 0 1px 2px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === 'dark' ? 0.34 : 0.24,
          )}`,
          `inset 0 -1px 2px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === 'dark' ? 0.34 : 0.24,
          )}`,
        ].join(', '),
      },

    '& .sg-table-rows .sg-table-row.tech-blue .sg-cell-inner, & .sg-table-rows .sg-table-row.tech-orange .sg-cell-inner, & .sg-table-rows .sg-table-row.tech-green .sg-cell-inner, & .sg-table-rows .sg-table-row.tech-purple .sg-cell-inner, & .sg-table-rows .sg-table-row.tech-red .sg-cell-inner, & .sg-table-rows .sg-table-row.tech-cyan .sg-cell-inner':
      {
        display: 'flex !important',
        alignItems: 'center',
        gap: 8,
        WebkitLineClamp: 'unset',
        WebkitBoxOrient: 'unset',
      },
    '& .sg-table-rows .sg-table-row.tech-blue .sg-cell-inner:before, & .sg-table-rows .sg-table-row.tech-orange .sg-cell-inner:before, & .sg-table-rows .sg-table-row.tech-green .sg-cell-inner:before, & .sg-table-rows .sg-table-row.tech-purple .sg-cell-inner:before, & .sg-table-rows .sg-table-row.tech-red .sg-cell-inner:before, & .sg-table-rows .sg-table-row.tech-cyan .sg-cell-inner:before':
      {
        border: `1px solid ${cssVarRgba(vars.palette.grey['300Channel'], 0.7)}`,
        boxShadow: `inset 0 2px 4px ${cssVarRgba(
          vars.palette.grey['950Channel'],
          theme.palette.mode === 'dark' ? 0.5 : 0.35,
        )}`,
      },
    '& .sg-table-rows .sg-table-row.tech-blue .sg-cell-inner:before': {
      content: '"AR"',
      width: 28,
      height: 28,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      fontWeight: 700,
      color: vars.palette.common.white,
      backgroundColor: vars.palette.primary.main,
      flexShrink: 0,
    },
    '& .sg-table-rows .sg-table-row.tech-orange .sg-cell-inner:before': {
      content: '"BC"',
      width: 28,
      height: 28,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      fontWeight: 700,
      color: vars.palette.common.white,
      backgroundColor: vars.palette.warning.main,
      flexShrink: 0,
    },
    '& .sg-table-rows .sg-table-row.tech-green .sg-cell-inner:before': {
      content: '"CD"',
      width: 28,
      height: 28,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      fontWeight: 700,
      color: vars.palette.common.white,
      backgroundColor: vars.palette.success.main,
      flexShrink: 0,
    },
    '& .sg-table-rows .sg-table-row.tech-purple .sg-cell-inner:before': {
      content: '"DP"',
      width: 28,
      height: 28,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      fontWeight: 700,
      color: vars.palette.common.white,
      backgroundColor: vars.palette.secondary.main,
      flexShrink: 0,
    },
    '& .sg-table-rows .sg-table-row.tech-red .sg-cell-inner:before': {
      content: '"ET"',
      width: 28,
      height: 28,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      fontWeight: 700,
      color: vars.palette.common.white,
      backgroundColor: vars.palette.error.main,
      flexShrink: 0,
    },
    '& .sg-table-rows .sg-table-row.tech-cyan .sg-cell-inner:before': {
      content: '"FJ"',
      width: 28,
      height: 28,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      fontWeight: 700,
      color: vars.palette.common.white,
      backgroundColor: vars.palette.info.main,
      flexShrink: 0,
    },
    '& .sg-table-rows .due': {
      '&.due-divider': {
        paddingBottom: '18px',
      },
      '& .sg-tree-expander': {
        backgroundColor: vars.palette.warning.main,
      },
    },
    '& .sg-table-rows .complete': {
      '&.complete-divider': {
        paddingBottom: 0,
      },
      '& .sg-tree-expander': {
        backgroundColor: vars.palette.success.main,
      },
    },
  };
};

export default projectTimelineChart;
