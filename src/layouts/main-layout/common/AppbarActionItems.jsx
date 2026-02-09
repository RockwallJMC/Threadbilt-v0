'use client';

import { IconButton, Stack, Tooltip } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import IconifyIcon from 'components/base/IconifyIcon';
import { useSettingsPanelContext } from 'providers/SettingsPanelProvider';
import LanguageMenu from './LanguageMenu';
import NotificationMenu from './NotificationMenu';
import ProfileMenu from './ProfileMenu';
import ThemeToggler from './ThemeToggler';

// Customize button to open settings panel
const CustomizeButton = () => {
  const { setSettingsPanelConfig } = useSettingsPanelContext();

  const handleClick = () => {
    setSettingsPanelConfig({
      openSettingPanel: true,
    });
  };

  return (
    <Tooltip title="Customize">
      <IconButton
        onClick={handleClick}
        aria-label="Open customize panel"
        sx={{
          color: 'text.secondary',
          '&:hover': {
            bgcolor: 'action.hover',
            color: 'primary.main',
          },
        }}
      >
        <IconifyIcon icon="material-symbols:tune" fontSize={20} />
      </IconButton>
    </Tooltip>
  );
};

// Folder toggle button component (shown on all pages)
const FileManagerQuickView = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isOnFileManager = pathname?.startsWith('/apps/file-manager');

  // On file manager pages, use the hook for toggle functionality
  let isSlideDownOpen = false;
  let handleClick = () => {
    // Navigate to file manager if not already there
    router.push('/apps/file-manager');
  };

  if (isOnFileManager) {
    // Dynamically import the hook only when on file manager page
    const { useFileManager } = require('providers/FileManagerProvider');
    const fileManagerContext = useFileManager();
    isSlideDownOpen = fileManagerContext.isSlideDownOpen;
    handleClick = fileManagerContext.toggleSlideDown;
  }

  return (
    <Tooltip
      title={
        isOnFileManager
          ? isSlideDownOpen
            ? 'Hide quick view'
            : 'Show quick view'
          : 'Go to file manager'
      }
    >
      <IconButton
        onClick={handleClick}
        aria-label="Toggle quick file view"
        aria-expanded={isSlideDownOpen}
        sx={{
          transition: 'all 0.3s ease-in-out',
          transform: isSlideDownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          color: isSlideDownOpen ? 'primary.main' : 'text.secondary',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <IconifyIcon icon="material-symbols:folder-outline" fontSize={20} />
      </IconButton>
    </Tooltip>
  );
};

const AppbarActionItems = ({ type = 'default', sx, searchComponent }) => {
  return (
    <Stack
      className="action-items"
      spacing={1}
      sx={{
        alignItems: 'center',
        ml: 'auto',
        ...sx,
      }}
    >
      {searchComponent}
      <FileManagerQuickView />
      <LanguageMenu type={type} />
      <ThemeToggler type={type} />
      <CustomizeButton />
      <NotificationMenu type={type} />
      <ProfileMenu type={type} />
    </Stack>
  );
};

export default AppbarActionItems;
