'use client';

import { Box, FormControlLabel, IconButton, Stack, Switch, Toolbar, Tooltip } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { sideDeskNavigation } from 'routes/sitemap';
import NotificationMenu from 'layouts/main-layout/common/NotificationMenu';
import ProfileMenu from 'layouts/main-layout/common/ProfileMenu';
import ThemeToggler from 'layouts/main-layout/common/ThemeToggler';

const SideDeskAppBar = ({
  activeView,
  onViewChange,
  sideDeskLocked,
  onLockToggle,
  onClose,
}) => {
  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {/* First row: Close + Keep open + Profile */}
      <Toolbar
        variant="dense"
        sx={{
          px: 1.5,
          minHeight: 48,
          gap: 0.5,
        }}
      >
        {/* Left side: Close + Keep open */}
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Tooltip title="Close Side Desk">
            <IconButton size="small" onClick={onClose} aria-label="close side desk">
              <IconifyIcon icon="material-symbols:close" sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <FormControlLabel
            control={
              <Switch
                checked={sideDeskLocked}
                onChange={(e) => onLockToggle(e.target.checked)}
                size="small"
              />
            }
            label="Keep open"
            sx={{
              m: 0,
              ml: 0.5,
              '& .MuiFormControlLabel-label': {
                fontSize: '0.7rem',
                color: 'text.secondary',
              },
            }}
          />
        </Stack>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Right side: Profile */}
        <ProfileMenu />
      </Toolbar>

      {/* Second row: Theme + Notifications on left, Navigation items on right */}
      <Stack
        direction="row"
        sx={{
          px: 1,
          py: 0.5,
          gap: 0.5,
          border: 1,
          borderColor: (theme) => theme.palette.mode === 'dark'
            ? 'rgba(192, 192, 192, 0.4)'
            : 'rgba(128, 128, 128, 0.4)',
          bgcolor: 'action.hover',
          alignItems: 'center',
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
            : 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Left side: Theme + Notifications */}
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <ThemeToggler />
          <NotificationMenu />
        </Stack>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Right side: Navigation items */}
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          {sideDeskNavigation.map((item) => (
            <Tooltip key={item.key} title={item.name} placement="bottom">
              <IconButton
                size="small"
                onClick={() => onViewChange(item)}
                sx={{
                  color: activeView?.key === item.key ? 'primary.main' : 'text.secondary',
                  bgcolor: activeView?.key === item.key ? 'action.selected' : 'transparent',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    color: 'primary.main',
                  },
                }}
              >
                <IconifyIcon icon={item.icon} sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};

export default SideDeskAppBar;
