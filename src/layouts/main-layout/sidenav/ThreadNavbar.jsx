import { Fragment } from 'react';
import { useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import { useSettingsContext } from 'providers/SettingsProvider';
import { TOGGLE_SIDE_DESK, SET_SIDENAV_SHAPE, SET_NAVIGATION_MENU_TYPE } from 'reducers/SettingsReducer';
import paths from 'routes/paths';
import { sidenavVibrantStyle } from 'theme/styles/vibrantNav';
import IconifyIcon from 'components/base/IconifyIcon';
import Logo from 'components/common/Logo';
import VibrantBackground from 'components/common/VibrantBackground';
import { useNavContext } from '../NavProvider';
import SidenavSimpleBar from './SidenavSimpleBar';
import SlimNavItem from './SlimNavItem';

// ThreadNavbar menu items - filtered to show only 6 specific items
const getThreadNavbarMenuItems = () => {
  return [
    {
      name: 'Business',
      key: 'business',
      path: paths.analytics,
      pathName: 'analytics',
      icon: 'material-symbols:query-stats-rounded',
      active: true,
    },
    {
      name: 'Sales',
      key: 'sales',
      path: '/apps/crm',
      pathName: 'crm',
      icon: 'material-symbols:phone-in-talk-outline-rounded',
      active: true,
    },
    {
      name: 'Projects',
      key: 'projects',
      path: paths.project,
      pathName: 'project ',
      icon: 'material-symbols:pending-actions-rounded',
      active: true,
    },
    {
      name: 'Service',
      key: 'service',
      path: '/dashboard/time-tracker',
      pathName: 'time-tracker',
      icon: 'material-symbols:engineering-outline',
      active: true,
    },
    {
      name: 'Inventory',
      key: 'inventory',
      path: paths.ecommerce,
      pathName: 'e-commerce',
      icon: 'material-symbols:shopping-cart-outline',
      active: true,
    },
  ];
};

const ThreadNavbar = () => {
  const {
    config: { sidenavCollapsed, drawerWidth, navColor, navigationMenuType, sideDeskOpen },
    configDispatch,
  } = useSettingsContext();
  const { sidenavAppbarVariant } = useNavContext();

  const threadMenuItems = getThreadNavbarMenuItems();

  const toggleSideDesk = () => {
    configDispatch({
      type: TOGGLE_SIDE_DESK,
    });
  };

  const switchToSlimNav = () => {
    configDispatch({
      type: SET_NAVIGATION_MENU_TYPE,
      payload: 'sidenav',
    });
    configDispatch({
      type: SET_SIDENAV_SHAPE,
      payload: 'slim',
    });
  };

  const drawer = (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {navColor === 'vibrant' && <VibrantBackground position="side" />}
        <Toolbar
          variant={sidenavAppbarVariant}
          sx={[
            {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
        >
          {navigationMenuType === 'threadnavbar' && <Logo showName={false} />}
        </Toolbar>
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
          }}
        >
          <SidenavSimpleBar
            sx={{
              height: 1,
              '& .simplebar-horizontal': {
                display: 'none',
              },
            }}
            autoHide={false}
          >
            <Box
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: '100%',
              }}
            >
              {/* Side Desk Toggle Button */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Tooltip title="Side Desk" placement="right">
                  <IconButton
                    onClick={toggleSideDesk}
                    sx={{
                      color: sideDeskOpen ? 'primary.main' : 'text.secondary',
                      transition: 'color 0.2s',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    <IconifyIcon icon="material-symbols:dashboard-customize-outline" sx={{ fontSize: 22 }} />
                  </IconButton>
                </Tooltip>
              </Box>

              <Divider sx={{ my: 1 }} />

              {/* Desk Navigation Items */}
              <List
                component="nav"
                sx={{
                  py: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                {threadMenuItems.map((item) => (
                  <SlimNavItem key={item.pathName} item={item} level={0} />
                ))}
              </List>

              <Divider sx={{ my: 1 }} />

              {/* Switch to Slim Sidenav Button */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Tooltip title="Switch to Slim Sidenav" placement="right">
                  <IconButton
                    onClick={switchToSlimNav}
                    sx={{
                      color: 'text.secondary',
                      transition: 'color 0.2s',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    <IconifyIcon icon="material-symbols:view-sidebar-outline" sx={{ fontSize: 22 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </SidenavSimpleBar>
        </Box>
      </Box>
    </>
  );

  const theme = useTheme();

  return (
    <Box
      component="nav"
      className="thread-navbar"
      sx={[
        {
          width: { md: drawerWidth },
          flexShrink: { sm: 0 },
        },
        !sidenavCollapsed && {
          transition: {
            xs: theme.transitions.create(['width'], {
              duration: theme.transitions.duration.standard,
            }),
          },
        },
        navColor === 'vibrant' && sidenavVibrantStyle,
      ]}
    >
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          [`& .${drawerClasses.paper}`]: {
            boxSizing: 'border-box',
            width: drawerWidth,
            boxShadow: (theme) => `6px 0 10px -8px ${alpha(theme.palette.grey[500], 0.35)}`,
            transition: {
              xs: theme.transitions.create(['width'], {
                duration: theme.transitions.duration.standard,
              }),
            },
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default ThreadNavbar;
