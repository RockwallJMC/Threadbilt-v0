import { useState } from 'react';
import { Button, IconButton, Menu, MenuItem, Stack, useMediaQuery, useTheme } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

const ResponsiveActionButtons = ({ actions = [] }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  // Breakpoint for when buttons should collapse to menu
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Calculate available space for buttons
  const shouldCollapse = isSmallScreen && actions.length > 1;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleActionClick = (action) => {
    if (action.onClick) {
      action.onClick();
    }
    handleMenuClose();
  };

  if (!actions || actions.length === 0) {
    return null;
  }

  // If we should collapse to menu, show dropdown
  if (shouldCollapse) {
    return (
      <>
        <Button
          size="medium"
          variant="soft"
          color="neutral"
          endIcon={<IconifyIcon icon="material-symbols:keyboard-arrow-down-rounded" />}
          onClick={handleMenuOpen}
          sx={{
            minWidth: theme.spacing(10),
            maxWidth: theme.spacing(15),
          }}
        >
          Actions
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {actions.map((action, index) => (
            <MenuItem
              key={index}
              onClick={() => handleActionClick(action)}
              disabled={action.disabled}
            >
              {action.icon && (
                <IconifyIcon
                  icon={action.icon}
                  sx={{ mr: 1, fontSize: theme.typography.pxToRem(18) }}
                />
              )}
              {action.label}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  // Otherwise, show individual buttons with responsive sizing
  return (
    <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
      {actions.map((action, index) => (
        <Button
          key={index}
          size="medium"
          variant={action.variant || 'soft'}
          color={action.color || 'neutral'}
          startIcon={
            action.icon ? (
              <IconifyIcon
                icon={action.icon}
                sx={{ fontSize: theme.typography.pxToRem(18) }}
              />
            ) : undefined
          }
          onClick={action.onClick}
          disabled={action.disabled}
          sx={{
            minWidth: theme.spacing(8),
            maxWidth: theme.spacing(20),
            flexGrow: 1,
            flexShrink: 1,
            ...action.sx,
          }}
        >
          {action.label}
        </Button>
      ))}
    </Stack>
  );
};

export default ResponsiveActionButtons;
