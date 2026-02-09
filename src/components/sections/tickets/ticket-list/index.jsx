'use client';

import { useState } from 'react';
import { Button, Paper, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';
import TicketListContainer from './TicketListContainer';

const TicketList = () => {
  const [viewMode, setViewMode] = useState('table');

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title="Ticket list"
        breadcrumb={[
          { label: 'Home', url: '/' },
          { label: 'Tickets', url: paths.ticketList },
          { label: 'Ticket List', active: true },
        ]}
        actionComponent={
          <Stack gap={1}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="view mode"
              size="small"
            >
              <ToggleButton value="table" aria-label="table view">
                <IconifyIcon icon="mdi:view-list" fontSize={20} />
              </ToggleButton>
              <ToggleButton value="card" aria-label="card view">
                <IconifyIcon icon="mdi:view-grid" fontSize={20} />
              </ToggleButton>
            </ToggleButtonGroup>
            <Button variant="soft" color="neutral">
              Export
            </Button>
            <Button variant="contained" color="primary">
              Create Ticket
            </Button>
          </Stack>
        }
      />
      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <TicketListContainer viewMode={viewMode} />
      </Paper>
    </Stack>
  );
};

export default TicketList;
