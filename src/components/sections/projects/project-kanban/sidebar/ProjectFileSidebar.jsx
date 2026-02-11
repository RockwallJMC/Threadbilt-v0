'use client';

import { Drawer, Paper } from '@mui/material';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import SimpleBar from 'components/base/SimpleBar';
import DriveNavigation from './drive-navigation/DriveNavigation';
import StorageInfo from './storage-info/StorageInfo';

const SidebarContent = ({ onClose }) => {
  return (
    <SimpleBar>
      <StorageInfo />
      <DriveNavigation handleDrawer={onClose} />
    </SimpleBar>
  );
};

const ProjectFileSidebar = ({ open, onClose }) => {
  const { topbarHeight } = useNavContext();
  const { up } = useBreakpoints();
  const upMd = up('md');

  if (!open) return null;

  return upMd ? (
    <Paper
      background={1}
      sx={(theme) => ({
        width: 270,
        flexShrink: 0,
        height: { md: theme.mixins.contentHeight(topbarHeight).md },
        position: { md: 'sticky' },
        top: topbarHeight,
        transition: 'width 0.2s ease',
      })}
    >
      <SidebarContent onClose={onClose} />
    </Paper>
  ) : (
    <Drawer
      open={open}
      anchor="left"
      onClose={onClose}
      slotProps={{
        paper: {
          background: 1,
          sx: { width: 270 },
        },
      }}
    >
      <SidebarContent onClose={onClose} />
    </Drawer>
  );
};

export default ProjectFileSidebar;
