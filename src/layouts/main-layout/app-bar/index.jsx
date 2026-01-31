import { useEffect, useRef } from 'react';
import { Box, Button, paperClasses, Stack, Typography } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { usePageContext } from 'providers/PageContext';
import { useSettingsContext } from 'providers/SettingsProvider';
import { topnavVibrantStyle } from 'theme/styles/vibrantNav';
import IconifyIcon from 'components/base/IconifyIcon';
import Logo from 'components/common/Logo';
import PageBreadcrumb from 'components/sections/common/PageBreadcrumb';
import VibrantBackground from 'components/common/VibrantBackground';
import AppbarActionItems from '../common/AppbarActionItems';
import ResponsiveActionButtons from '../common/ResponsiveActionButtons';
import SearchBox, { SearchBoxButton } from '../common/search-box/SearchBox';

const AppBar = () => {
  const {
    config: { drawerWidth, sidenavType, navColor },
    handleDrawerToggle,
  } = useSettingsContext();

  const { pageTitle, breadcrumbs, pageActions } = usePageContext();

  const { up } = useBreakpoints();
  const upSm = up('sm');
  const upMd = up('md');

  const prevSidenavTypeRef = useRef(sidenavType);

  useEffect(() => {
    if (prevSidenavTypeRef.current !== sidenavType) {
      prevSidenavTypeRef.current = sidenavType;
    }
  }, [sidenavType]);

  return (
    <MuiAppBar
      position="fixed"
      sx={[
        {
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          borderBottom: `1px solid`,
          borderColor: 'divider',
          [`&.${paperClasses.root}`]: {
            outline: 'none',
          },
        },
        sidenavType === 'stacked' &&
          sidenavType === prevSidenavTypeRef.current &&
          ((theme) => ({
            transition: theme.transitions.create(['width'], {
              duration: theme.transitions.duration.standard,
            }),
          })),
        navColor === 'vibrant' && !upMd && topnavVibrantStyle,
      ]}
    >
      {navColor === 'vibrant' && !upMd && <VibrantBackground position="top" />}
      <Toolbar variant="appbar" sx={{ px: { xs: 3, md: 5 }, gap: 2 }}>
        {/* Left side: Menu + Logo + Title/Breadcrumbs */}
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Button
              color="neutral"
              variant="soft"
              shape="circle"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
            >
              <IconifyIcon icon="material-symbols:menu-rounded" sx={{ fontSize: 20 }} />
            </Button>

            <Box>
              <Logo showName={upSm} />
            </Box>
          </Box>

          {/* Page title and breadcrumbs (desktop only) */}
          {upMd && pageTitle && (
            <Stack sx={{ minWidth: 0 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                {pageTitle}
              </Typography>
              {breadcrumbs && breadcrumbs.length > 0 && (
                <PageBreadcrumb items={breadcrumbs} />
              )}
            </Stack>
          )}
        </Stack>

        {/* Center: Search box */}
        <Stack
          sx={{
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {upMd ? (
            <SearchBox
              sx={{
                width: 1,
                maxWidth: 420,
              }}
            />
          ) : (
            <SearchBoxButton />
          )}
        </Stack>

        {/* Right side: Page actions + App bar actions */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {pageActions && pageActions.length > 0 && (
            <ResponsiveActionButtons actions={pageActions} />
          )}
          <AppbarActionItems />
        </Stack>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
