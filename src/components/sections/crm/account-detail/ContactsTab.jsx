'use client';

import { useMemo } from 'react';
import { Alert, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useAccountContacts } from 'services/swr/api-hooks/useContactApi';

const ContactsTab = ({ accountId }) => {
  const { data: contacts, error, isLoading } = useAccountContacts(accountId);

  const columns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        flex: 1,
        minWidth: 200,
        valueGetter: (value, row) => `${row.first_name} ${row.last_name}`,
      },
      {
        field: 'email',
        headerName: 'Email',
        flex: 1,
        minWidth: 250,
      },
      {
        field: 'phone',
        headerName: 'Phone',
        flex: 1,
        minWidth: 150,
      },
      {
        field: 'title',
        headerName: 'Title',
        flex: 1,
        minWidth: 200,
      },
    ],
    []
  );

  if (error) {
    return (
      <Alert severity="error">
        Error loading contacts: {error.message}
      </Alert>
    );
  }

  if (!isLoading && (!contacts || contacts.length === 0)) {
    return (
      <Alert severity="info">
        No contacts linked to this account yet.
      </Alert>
    );
  }

  return (
    <Stack sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={contacts || []}
        columns={columns}
        loading={isLoading}
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10, page: 0 },
          },
        }}
        disableRowSelectionOnClick
        sx={{
          border: 0,
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            bgcolor: 'action.hover',
          },
        }}
      />
    </Stack>
  );
};

export default ContactsTab;
