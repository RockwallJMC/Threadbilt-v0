'use client';

import { useState } from 'react';
import { Drawer, drawerClasses } from '@mui/material';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import { TOGGLE_SIDE_DESK, SET_SIDE_DESK_WIDTH } from 'reducers/SettingsReducer';
import SimpleBar from 'components/base/SimpleBar';
import useSideDeskMetrics from 'hooks/useSideDeskMetrics';
import { SIDE_DESK_WIDTH_MIN, SIDE_DESK_WIDTH_MAX } from 'lib/constants';
import Resizable from 'components/base/Resizable';
import SideDeskContent from './SideDeskContent';
import SideDeskHeader from './SideDeskHeader';

const SideDeskDrawer = () => {
  const [activeView, setActiveView] = useState(null);

  const {
    config: { sideDeskOpen, sideDeskWidth, drawerWidth: threadNavbarWidth },
    configDispatch,
  } = useSettingsContext();

  const { up } = useBreakpoints();
  const upMd = up('md');

  const { deskType } = useSideDeskMetrics();

  const handleViewChange = (item) => {
    setActiveView(item);
  };

  const handleClose = () => {
    configDispatch({
      type: TOGGLE_SIDE_DESK,
    });
  };

  const handleResize = (width) => {
    configDispatch({
      type: SET_SIDE_DESK_WIDTH,
      payload: width,
    });
  };

  const drawerContent = (
    <Resizable
      size={{ width: sideDeskWidth, height: '100%' }}
      handleResize={handleResize}
      minWidth={SIDE_DESK_WIDTH_MIN}
      maxWidth={SIDE_DESK_WIDTH_MAX}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        '.resizable-handler': {
          width: '8px !important',
          backgroundColor: 'action.hover',
          cursor: 'col-resize',
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: 'primary.main',
          },
        },
      }}
    >
      <SideDeskHeader
        activeView={activeView}
        onViewChange={handleViewChange}
      />
      <SimpleBar
        sx={{
          flex: 1,
          overflow: 'auto',
          '& .simplebar-content': {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          },
        }}
      >
        <SideDeskContent deskType={deskType} activeView={activeView} />
      </SimpleBar>
    </Resizable>
  );

  return (
    <>
      {upMd ? (
        <Drawer
          variant="persistent"
          open={sideDeskOpen}
          anchor="left"
          sx={{
            flexShrink: 0,
            width: 0,
            [`& .${drawerClasses.paper}`]: {
              boxSizing: 'border-box',
              width: sideDeskWidth,
              position: 'fixed',
              left: threadNavbarWidth,
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={sideDeskOpen}
          onClose={handleClose}
          anchor="left"
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            [`& .${drawerClasses.paper}`]: {
              width: sideDeskWidth,
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default SideDeskDrawer;
