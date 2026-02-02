'use client';

import { Box, IconButton, Stack, Typography } from '@mui/material';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import IconifyIcon from 'components/base/IconifyIcon';
import SimpleBar from 'components/base/SimpleBar';
import TicketDetail from 'components/sections/service/ticket-detail';

const TicketDetailDrawer = ({ open, handleClose, ticketId }) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      sx={(theme) => ({
        [`& .${drawerClasses.paper}`]: {
          maxWidth: 800,
          width: 1,
          bgcolor: 'background.elevation1',
        },
        zIndex: theme.zIndex.drawer + 1,
      })}
    >
      <Box
        sx={{
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            pt: 5,
            px: { xs: 3, sm: 5 },
            pb: 3,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Ticket Details</Typography>
            <IconButton onClick={handleClose}>
              <IconifyIcon icon="material-symbols:close" fontSize={20} />
            </IconButton>
          </Stack>
        </Box>

        {/* Ticket Detail Content */}
        <SimpleBar sx={{ minHeight: 0, flex: 1, height: 1 }}>
          <TicketDetail ticketId={ticketId} isInDrawer={true} />
        </SimpleBar>
      </Box>
    </Drawer>
  );
};

export default TicketDetailDrawer;
