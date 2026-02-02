'use client';

import { Drawer, drawerClasses } from '@mui/material';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import { TOGGLE_SIDE_DESK } from 'reducers/SettingsReducer';
import SimpleBar from 'components/base/SimpleBar';
import useSideDeskMetrics from 'hooks/useSideDeskMetrics';
import { sideDeskDrawerWidth } from 'lib/constants';
import SideDeskContent from './SideDeskContent';
import SideDeskHeader from './SideDeskHeader';

const SideDeskDrawer = () => {
  const {
    config: { sideDeskOpen, drawerWidth: threadNavbarWidth },
    configDispatch,
  } = useSettingsContext();

  const { up } = useBreakpoints();
  const upMd = up('md');

  const { deskName, deskType } = useSideDeskMetrics();

  const drawerWidth = sideDeskDrawerWidth;

  const handleClose = () => {
    configDispatch({
      type: TOGGLE_SIDE_DESK,
    });
  };

  const drawerContent = (
    <>
      <SideDeskHeader deskName={deskName} />
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
        <SideDeskContent deskType={deskType} />
      </SimpleBar>
    </>
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
              width: drawerWidth,
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
              width: drawerWidth,
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
