'use client';

import { useCallback, useState } from 'react';
import { Button, InputAdornment, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useGridApiRef } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
import StyledTextField from 'components/styled/StyledTextField';
import OpportunitiesTable from './OpportunitiesTable';

const OpportunitiesListContainer = () => {
  const [filterButtonEl, setFilterButtonEl] = useState(null);
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
            id="search-opportunities"
            type="search"
            fullWidth
            placeholder="Search opportunities..."
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
              minWidth: 300,
              maxWidth: {
                sm: 400,
              },
            }}
          />

          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <Button
              variant="outlined"
              color="neutral"
              href="/apps/crm/opportunities"
              startIcon={
                <IconifyIcon
                  icon="material-symbols:view-kanban"
                  sx={{ fontSize: 20 }}
                />
              }
            >
              Kanban View
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={
                <IconifyIcon icon="material-symbols:add-rounded" sx={{ fontSize: 20 }} />
              }
            >
              Add Opportunity
            </Button>
          </Stack>
        </Stack>
      </Grid>
      <Grid size={12}>
        <OpportunitiesTable apiRef={apiRef} filterButtonEl={filterButtonEl} />
      </Grid>
    </Grid>
  );
};

export default OpportunitiesListContainer;
