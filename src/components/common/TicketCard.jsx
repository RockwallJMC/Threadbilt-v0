'use client';

import { Avatar, Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

const TicketCard = ({
  title,
  address,
  city,
  state,
  zip,
  chipName,
  chipAvatar,
  laneColor,
  size = 'default',
  lines,
  sx,
  onClick,
}) => {
  const isCompact = size === 'compact';
  const borderWidth = 2;
  const resolvedLines = lines?.length
    ? lines.filter(Boolean)
    : [address, city, [state, zip].filter(Boolean).join(' ')].filter(Boolean);

  return (
    <Paper
      background={1}
      elevation={0}
      onClick={onClick}
      sx={(theme) => {
        const silverBorderColor = alpha(
          theme.palette.mode === 'dark' ? theme.palette.grey[200] : theme.palette.grey[500],
          0.3,
        );

        const silverInsetShadowColor = alpha(
          theme.palette.mode === 'dark' ? theme.palette.grey[500] : theme.palette.grey[400],
          theme.palette.mode === 'dark' ? 0.22 : 0.28,
        );

        return {
          p: { xs: 0.25, md: 0.4 },
          pt: { xs: isCompact ? 1.25 : 2, md: isCompact ? 1.5 : 2.5 },
          borderRadius: 1,
          border: `${borderWidth}px solid ${silverBorderColor}`,
          borderLeft: `${borderWidth}px solid ${
            laneColor || theme.vars?.palette?.divider || theme.palette.divider
          }`,
          boxShadow: [
            `inset 0 1px 0 ${alpha(
              theme.palette.common.white,
              theme.palette.mode === 'dark' ? 0.14 : 0.32,
            )}`,
            `inset 0 1px 3px ${silverInsetShadowColor}`,
            ...(isCompact
              ? [
                  `inset 0 1px 3px ${alpha(
                    theme.palette.mode === 'dark'
                      ? theme.palette.grey[800]
                      : theme.palette.grey[600],
                    theme.palette.mode === 'dark' ? 0.38 : 0.22,
                  )}`,
                ]
              : []),
            `0 1px 3px ${alpha(
              theme.palette.grey[900],
              theme.palette.mode === 'dark' ? 0.55 : 0.28,
            )}`,
          ].join(', '),
          aspectRatio: isCompact ? 'auto' : '16 / 9',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 0.25,
          position: 'relative',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': onClick
            ? {
                transform: 'translateY(-2px)',
                boxShadow: [
                  `inset 0 1px 0 ${alpha(
                    theme.palette.common.white,
                    theme.palette.mode === 'dark' ? 0.14 : 0.32,
                  )}`,
                  `inset 0 1px 3px ${silverInsetShadowColor}`,
                  ...(isCompact
                    ? [
                        `inset 0 1px 3px ${alpha(
                          theme.palette.mode === 'dark'
                            ? theme.palette.grey[800]
                            : theme.palette.grey[600],
                          theme.palette.mode === 'dark' ? 0.38 : 0.22,
                        )}`,
                      ]
                    : []),
                  `0 4px 8px ${alpha(
                    theme.palette.grey[900],
                    theme.palette.mode === 'dark' ? 0.65 : 0.35,
                  )}`,
                ].join(', '),
              }
            : {},
          ...sx,
        };
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: isCompact ? -8 : -10,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {chipName ? (
          <Chip
            avatar={
              chipAvatar ? (
                <Avatar src={chipAvatar} alt={chipName} />
              ) : (
                <Avatar>{chipName[0]}</Avatar>
              )
            }
            label={chipName}
            size="small"
            variant="filled"
            color="primary"
            sx={(theme) => ({
              height: isCompact ? 18 : 20,
              fontSize: isCompact ? 9 : 10,
              boxShadow: theme.vars?.shadows?.[2] || theme.shadows[2],
              '& .MuiChip-avatar': {
                width: isCompact ? 14 : 16,
                height: isCompact ? 14 : 16,
                marginLeft: 0.5,
                border: `5px solid ${theme.palette.error.main}`,
                boxShadow: `inset 0 2px 4px ${alpha(
                  theme.palette.grey[900],
                  theme.palette.mode === 'dark' ? 0.45 : 0.3,
                )}`,
              },
            })}
          />
        ) : null}
      </Box>
      <Stack spacing={0.25} sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          fontWeight={300}
          noWrap
          sx={{ fontSize: isCompact ? 12 : 16 }}
        >
          {title}
        </Typography>
        <Stack spacing={0.1} sx={{ width: 1 }}>
          {resolvedLines.map((line, index) => (
            <Typography
              key={`${title}-${index}`}
              variant="caption"
              color="text.secondary"
              component="div"
              sx={{
                fontSize: isCompact ? 9 : 13,
                fontWeight: 400,
                lineHeight: isCompact ? 1.2 : 1.35,
                display: 'block',
                whiteSpace: isCompact ? 'normal' : 'wrap',
                overflow: isCompact ? 'visible' : 'hidden',
                textOverflow: isCompact ? 'clip' : 'ellipsis',
                wordBreak: isCompact ? 'break-word' : 'normal',
              }}
            >
              {line}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default TicketCard;
