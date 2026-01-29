'use client';

import { useCallback, useState } from 'react';
import { Button, InputAdornment, Stack, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useGridApiRef } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
import StyledTextField from 'components/styled/StyledTextField';
import ProposalsTable from './ProposalsTable';

const ProposalsListContainer = () => {
  const [filterButtonEl, setFilterButtonEl] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const apiRef = useGridApiRef();

  const handleSearch = useCallback(
    (e) => {
      apiRef.current?.setQuickFilterValues([e.target.value]);
    },
    [apiRef],
  );

  const handleToggleFilterPanel = (e) => {
    const clickedEl = e.currentTarget;

    if (filterButtonEl && filterButtonEl === clickedEl) {
      setFilterButtonEl(null);
      apiRef.current?.hideFilterPanel();

      return;
    }

    setFilterButtonEl(clickedEl);
    apiRef.current?.showFilterPanel();
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  return (
    <Grid container spacing={{ xs: 2, md: 4 }}>
      <Grid size={12}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            columnGap: 2,
            rowGap: 2,
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
          }}
        >
          <StyledTextField
            id="search-proposals"
            type="search"
            fullWidth
            placeholder="Search proposals by number, opportunity, or account..."
            onChange={handleSearch}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <IconifyIcon
                      icon="material-symbols:search-rounded"
                      sx={{
                        fontSize: 20,
                        color: 'text.secondary',
                      }}
                    />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              maxWidth: {
                sm: 400,
              },
            }}
          />

          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <Button
              variant="outlined"
              color="neutral"
              onClick={handleToggleFilterPanel}
              startIcon={
                <IconifyIcon
                  icon="material-symbols:filter-list-rounded"
                  sx={{ fontSize: 20 }}
                />
              }
            >
              Filter
            </Button>
            <Tooltip title="Create proposals from opportunities" arrow>
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  disabled
                  startIcon={
                    <IconifyIcon icon="material-symbols:add-rounded" sx={{ fontSize: 20 }} />
                  }
                >
                  Add Proposal
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </Grid>
      <Grid size={12}>
        <ProposalsTable
          apiRef={apiRef}
          filterButtonEl={filterButtonEl}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
        />
      </Grid>
    </Grid>
  );
};

export default ProposalsListContainer;
