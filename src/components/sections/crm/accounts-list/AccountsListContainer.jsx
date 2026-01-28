'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, InputAdornment, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useGridApiRef } from '@mui/x-data-grid';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import StyledTextField from 'components/styled/StyledTextField';
import AccountsTable from './AccountsTable';

const AccountsListContainer = () => {
  const [filterButtonEl, setFilterButtonEl] = useState(null);
  const apiRef = useGridApiRef();
  const router = useRouter();

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

  const handleCreateAccount = () => {
    // TODO: Create accounts/create route or open modal
    console.log('Create account clicked');
    // router.push(`${paths.crmAccounts}/create`);
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
            id="search-accounts"
            type="search"
            fullWidth
            placeholder="Search accounts by name or industry..."
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
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateAccount}
              startIcon={
                <IconifyIcon icon="material-symbols:add-rounded" sx={{ fontSize: 20 }} />
              }
            >
              Create Account
            </Button>
          </Stack>
        </Stack>
      </Grid>
      <Grid size={12}>
        <AccountsTable apiRef={apiRef} filterButtonEl={filterButtonEl} />
      </Grid>
    </Grid>
  );
};

export default AccountsListContainer;
