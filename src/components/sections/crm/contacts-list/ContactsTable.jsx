'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Box, Chip, Link, Skeleton, Stack } from '@mui/material';
import { DataGrid, GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid';
import { useContacts } from 'services/swr/api-hooks/useContactApi';
import accounts from 'data/crm/accounts';
import paths from 'routes/paths';
import DashboardMenu from 'components/common/DashboardMenu';
import DataGridPagination from 'components/pagination/DataGridPagination';

const defaultPageSize = 20;

const getAccountName = (accountId) => {
  if (!accountId) return null;
  const account = accounts.find((acc) => acc.id === accountId);
  return account ? account.name : 'Unknown Account';
};

const ContactsTable = ({ apiRef, filterType }) => {
  const router = useRouter();
  const { data: contacts, error, isLoading } = useContacts();

  // Filter contacts based on filterType
  const filteredContacts = useMemo(() => {
    if (!contacts) return [];

    if (filterType === 'with-account') {
      return contacts.filter((contact) => contact.account_id !== null);
    } else if (filterType === 'independent') {
      return contacts.filter((contact) => contact.account_id === null);
    }

    return contacts; // 'all'
  }, [contacts, filterType]);

  const columns = useMemo(
    () => [
      {
        ...GRID_CHECKBOX_SELECTION_COL_DEF,
        width: 64,
      },
      {
        field: 'name',
        headerName: 'Name',
        minWidth: 250,
        flex: 1,
        valueGetter: (value, row) => `${row.first_name} ${row.last_name}`,
        renderCell: (params) => {
          const fullName = `${params.row.first_name} ${params.row.last_name}`;
          return (
            <Link
              href={paths.crmContactDetails(params.row.id)}
              variant="subtitle2"
              sx={{ fontWeight: 400 }}
            >
              {fullName}
            </Link>
          );
        },
      },
      {
        field: 'title',
        headerName: 'Title',
        minWidth: 200,
        flex: 1,
        renderCell: (params) => params.row.title || '-',
      },
      {
        field: 'email',
        headerName: 'Email',
        minWidth: 250,
        flex: 1,
        renderCell: (params) => {
          return (
            <Link href={`mailto:${params.row.email}`} variant="body2" sx={{ fontWeight: 400 }}>
              {params.row.email}
            </Link>
          );
        },
      },
      {
        field: 'phone',
        headerName: 'Phone',
        minWidth: 150,
        renderCell: (params) => params.row.phone || '-',
      },
      {
        field: 'account',
        headerName: 'Account',
        minWidth: 200,
        flex: 1,
        valueGetter: (value, row) => {
          const accountName = getAccountName(row.account_id);
          return accountName || 'Independent';
        },
        renderCell: (params) => {
          const accountName = getAccountName(params.row.account_id);

          if (accountName) {
            return (
              <Link variant="subtitle2" href={paths.crmAccountDetails(params.row.account_id)} sx={{ fontWeight: 400 }}>
                {accountName}
              </Link>
            );
          }

          return (
            <Box component="span" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              Independent
            </Box>
          );
        },
      },
      {
        field: 'status',
        headerName: 'Status',
        minWidth: 120,
        renderCell: () => {
          // Status field doesn't exist in mock data - show "Active" for all
          return <Chip label="Active" variant="soft" color="success" sx={{ textTransform: 'capitalize' }} />;
        },
      },
      {
        field: 'action',
        headerName: '',
        filterable: false,
        sortable: false,
        width: 60,
        align: 'right',
        headerAlign: 'right',
        renderCell: () => <DashboardMenu />,
      },
    ],
    [router],
  );

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ width: 1 }}>
        <Stack spacing={1}>
          <Skeleton variant="rectangular" height={56} />
          <Skeleton variant="rectangular" height={400} />
        </Stack>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ width: 1 }}>
        <Alert severity="error">Failed to load contacts. Please try again.</Alert>
      </Box>
    );
  }

  // Empty state
  if (!filteredContacts || filteredContacts.length === 0) {
    return (
      <Box sx={{ width: 1 }}>
        <Alert severity="info">No contacts found.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: 1 }}>
      <DataGrid
        rowHeight={64}
        rows={filteredContacts}
        apiRef={apiRef}
        columns={columns}
        pageSizeOptions={[defaultPageSize, 50, 100]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: defaultPageSize,
            },
          },
        }}
        checkboxSelection
        onRowClick={(params) => {
          router.push(paths.crmContactDetails(params.row.id));
        }}
        slots={{
          basePagination: (props) => <DataGridPagination showFullPagination {...props} />,
        }}
        sx={{
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
          },
        }}
      />
    </Box>
  );
};

export default ContactsTable;
