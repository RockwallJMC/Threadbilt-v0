'use client';

import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { getServicePropertyById } from 'data/service/service-properties';
import dayjs from 'dayjs';
import IconifyIcon from 'components/base/IconifyIcon';
import DashboardMenu from 'components/common/DashboardMenu';

const PipelineCard = ({
  pipeline,
  forceCollapsed = null,
  sx,
  avatarSx,
  avatarProps,
  menuPlacement = 'footer',
  detailsLayout = 'default',
  collapsedAvatarLeft = -20,
  progressHeight = 6,
  progressSx,
  collapsedContentAlign = 'center',
  collapsedTitleGap = 0,
  detailsExtra,
  detailsExtraSx,
  dividerSx,
  addressSx,
  cityZipSx,
  menuSx,
  titleSx,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const collapsed = forceCollapsed ?? isCollapsed;
  const {
    index: propertyIndex,
    name: propertyName,
    address: propertyAddress,
  } = getServicePropertyById(pipeline?.id);
  const progressValue = Math.min(100, Math.max(0, ((pipeline?.rating ?? 2) / 5) * 100));
  const ticketNumber = `T${String(propertyIndex).padStart(6, '0')}`;
  const collapsedAlignAvatarLeft =
    collapsed && collapsedContentAlign === 'avatarLeft' && Number.isFinite(collapsedAvatarLeft);
  const collapsedTitlePl = collapsedAlignAvatarLeft
    ? `${collapsedAvatarLeft + 40 + collapsedTitleGap}px`
    : 0;

  const {
    sx: avatarPropsSx,
    src: avatarSrc,
    children: avatarChildren,
    ...restAvatarProps
  } = avatarProps ?? {};

  return (
    <Paper
      background={2}
      sx={[
        {
          p: collapsed ? 0 : 1.25,
          borderRadius: collapsed ? 999 : 3,
          outline: 0,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: collapsed ? 0 : 0.5,
          overflow: 'hidden',
          cursor: 'grab',
          height: collapsed ? 45 : 'auto',
          transition:
            'height 300ms cubic-bezier(0.34, 1.56, 0.64, 1), border-radius 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          pb: collapsed ? 0 : 1.25,
          '& button': {
            cursor: 'pointer',
          },
          touchAction: 'none',
        },
        sx,
      ]}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          width: 1,
          minHeight: collapsed ? 36 : 'auto',
          height: collapsed ? '100%' : 'auto',
          justifyContent: collapsed
            ? collapsedAlignAvatarLeft
              ? 'flex-start'
              : 'center'
            : 'flex-start',
          position: 'relative',
          transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <Tooltip title={propertyName}>
          <Avatar
            {...restAvatarProps}
            src={avatarProps ? avatarSrc : pipeline?.user?.avatar}
            sx={[
              (theme) => ({
                width: 32,
                height: 32,
                boxSizing: 'border-box',
                border: `1px solid ${alpha(theme.palette.grey[300], 0.7)}`,
                boxShadow: `inset 0 2px 4px ${alpha(
                  theme.palette.grey[950],
                  theme.palette.mode === 'dark' ? 0.5 : 0.35,
                )}`,
                position: collapsed ? 'absolute' : 'static',
                left: collapsed ? collapsedAvatarLeft : 'auto',
                top: collapsed ? '50%' : 'auto',
                transform: collapsed ? 'translateY(calc(-50% + 2px))' : 'translateY(0)',
                transition:
                  'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), left 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }),
              avatarPropsSx,
              avatarSx,
            ]}
          >
            {avatarProps ? avatarChildren : null}
          </Avatar>
        </Tooltip>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          noWrap
          sx={{
            flex: collapsed ? (collapsedAlignAvatarLeft ? 1 : 'none') : 1,
            pl: collapsedTitlePl,
            pr: collapsed ? (collapsedAlignAvatarLeft ? '44px' : 0) : 0.5,
            textAlign: collapsed ? (collapsedAlignAvatarLeft ? 'left' : 'center') : 'left',
            display: collapsed ? 'flex' : 'block',
            alignItems: collapsed ? 'center' : 'initial',
            height: collapsed ? '100%' : 'auto',
            transition: 'opacity 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            lineHeight: 1.2,
            ...titleSx,
          }}
        >
          {propertyName}
        </Typography>
        <IconButton
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            setIsCollapsed((prev) => !prev);
          }}
          onPointerDown={(event) => event.stopPropagation()}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '50%',
            width: 28,
            height: 28,
            position: collapsed ? 'absolute' : 'static',
            right: collapsed ? 8 : 'auto',
          }}
        >
          <IconifyIcon
            icon="material-symbols:expand-more-rounded"
            sx={{
              fontSize: 18,
              transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
              transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
        </IconButton>
      </Box>

      <Collapse in={!collapsed} timeout="auto" unmountOnExit>
        <Stack gap={1} alignItems="center" sx={{ mt: 0.5 }}>
          <Stack direction="column" gap={0} sx={{ width: 1 }}>
            <Divider
              sx={[
                {
                  opacity: 1,
                  borderBottomWidth: 2,
                  borderColor: 'secondary.main',
                  mb: 0.5,
                },
                dividerSx,
              ]}
            />
            {detailsLayout === 'stackedAddress' ? (
              <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
                gap={1}
                sx={{ width: 1 }}
              >
                <Stack direction="column" gap={0} sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                    noWrap
                    sx={addressSx}
                  >
                    {propertyAddress.street}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                    noWrap
                    sx={[{ mt: '3px' }, cityZipSx]}
                  >
                    {propertyAddress.cityZip}
                  </Typography>
                </Stack>
                <Stack direction="column" alignItems="flex-end" spacing={0.5}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={400}
                    sx={{ letterSpacing: 0.4 }}
                  >
                    {ticketNumber}
                  </Typography>
                  <Chip
                    size="small"
                    icon={<IconifyIcon icon="material-symbols:schedule-outline-rounded" />}
                    label={dayjs(pipeline.appliedDate).format('DD.MM.YY')}
                    sx={{
                      height: 22,
                      borderRadius: 999,
                      bgcolor: 'background.elevation1',
                      color: 'text.secondary',
                      border: '1px solid',
                      borderColor: 'divider',
                      '& .MuiChip-label': {
                        fontSize: 11,
                        fontWeight: 600,
                        px: 0.75,
                      },
                      '& .MuiChip-icon': {
                        fontSize: 14,
                        ml: 0.5,
                      },
                    }}
                  />
                  {menuPlacement === 'meta' ? (
                    <Box
                      sx={[
                        {
                          mt: '3px',
                          display: 'flex',
                          justifyContent: 'flex-end',
                          width: 1,
                        },
                        menuSx,
                      ]}
                    >
                      <DashboardMenu />
                    </Box>
                  ) : null}
                </Stack>
              </Stack>
            ) : (
              <>
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                    noWrap
                    sx={addressSx}
                  >
                    {propertyAddress.street}
                  </Typography>
                  <Stack direction="column" alignItems="flex-end" spacing={0.5}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={400}
                      sx={{ letterSpacing: 0.4 }}
                    >
                      {ticketNumber}
                    </Typography>
                    <Chip
                      size="small"
                      icon={<IconifyIcon icon="material-symbols:schedule-outline-rounded" />}
                      label={dayjs(pipeline.appliedDate).format('DD.MM.YY')}
                      sx={{
                        height: 22,
                        borderRadius: 999,
                        bgcolor: 'background.elevation1',
                        color: 'text.secondary',
                        border: '1px solid',
                        borderColor: 'divider',
                        '& .MuiChip-label': {
                          fontSize: 11,
                          fontWeight: 600,
                          px: 0.75,
                        },
                        '& .MuiChip-icon': {
                          fontSize: 14,
                          ml: 0.5,
                        },
                      }}
                    />
                    {menuPlacement === 'meta' ? (
                      <Box
                        sx={[
                          {
                            mt: '3px',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            width: 1,
                          },
                          menuSx,
                        ]}
                      >
                        <DashboardMenu />
                      </Box>
                    ) : null}
                  </Stack>
                </Stack>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={500}
                  noWrap
                  sx={[{ mt: 1 }, cityZipSx]}
                >
                  {propertyAddress.cityZip}
                </Typography>
              </>
            )}
          </Stack>
        </Stack>

        {detailsExtra ? (
          <Box sx={[{ width: 1, display: 'flex', justifyContent: 'center' }, detailsExtraSx]}>
            {detailsExtra}
          </Box>
        ) : null}

        <Box
          sx={{
            width: 1,
            minHeight: menuPlacement === 'footer' ? 36 : 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {menuPlacement === 'footer' ? (
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
              <Box />
              <Box sx={menuSx}>
                <DashboardMenu />
              </Box>
            </Stack>
          ) : null}
          <LinearProgress
            variant="determinate"
            value={progressValue}
            sx={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: progressHeight,
                borderRadius: 0,
                backgroundColor: 'transparent',
                boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.2)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 0,
                  backgroundColor: 'success.main',
                  boxShadow: 'inset 0 2px 0 rgba(0, 0, 0, 0.2)',
                },
              },
              progressSx,
            ]}
          />
        </Box>
      </Collapse>
      {collapsed ? (
        <LinearProgress
          variant="determinate"
          value={progressValue}
          sx={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: progressHeight,
              borderRadius: 0,
              backgroundColor: 'transparent',
              boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.2)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 0,
                backgroundColor: 'success.main',
                boxShadow: 'inset 0 2px 0 rgba(0, 0, 0, 0.2)',
              },
            },
            progressSx,
          ]}
        />
      ) : null}
    </Paper>
  );
};
export default PipelineCard;
