'use client';

import { useCallback, useState } from 'react';
import { Button, InputAdornment, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useGridApiRef } from '@mui/x-data-grid';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import StyledTextField from 'components/styled/StyledTextField';
import ContactsTable from './ContactsTable';

const ContactsListContainer = () => {
  const [filterType, setFilterType] = useState('all');
  const apiRef = useGridApiRef();

  const handleSearch = useCallback(
    (e) => {
      apiRef.current?.setQuickFilterValues([e.target.value]);
    },
    [apiRef],
  );

  const handleFilterChange = useCallback(
    (event, newFilter) => {
      if (newFilter !== null) {
        setFilterType(newFilter);
      }
    },
    [],
  );

  return (
    <Grid container spacing={{ xs: 2, md: 4 }}>
      <Grid size={12}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Contacts
        </Typography>
      </Grid>

      <Grid size={12}>
        <Stack
          direction={{ xs: 'column', xl: 'row' }}
          sx={{
            columnGap: 1,
            rowGap: 2,
            justifyContent: 'space-between',
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ flexGrow: 1, alignItems: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}
          >
            <Button
              href={paths.crmAddContact}
              variant="contained"
              color="primary"
              sx={{ flexShrink: 0 }}
            >
              Create Contact
            </Button>

            <StyledTextField
              id="search-box"
              type="search"
              fullWidth
              placeholder="Search contacts"
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
                  sm: 360,
                  xl: 300,
                },
                mr: { sm: 2, md: 4, lg: 0 },
              }}
            />

            <ToggleButtonGroup
              value={filterType}
              exclusive
              onChange={handleFilterChange}
              aria-label="contact filter"
              size="small"
              sx={{ flexShrink: 0 }}
            >
              <ToggleButton value="all" aria-label="all contacts">
                All
              </ToggleButton>
              <ToggleButton value="with-account" aria-label="with account">
                With Account
              </ToggleButton>
              <ToggleButton value="independent" aria-label="independent">
                Independent
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>
      </Grid>

      <Grid size={12}>
        <ContactsTable apiRef={apiRef} filterType={filterType} />
      </Grid>
    </Grid>
  );
};

export default ContactsListContainer;
