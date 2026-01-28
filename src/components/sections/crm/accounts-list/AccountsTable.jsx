'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Chip, Link, Stack, Typography } from '@mui/material';
import { DataGrid, GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid';
import { useAccounts } from 'services/swr/api-hooks/useAccountApi';
import paths from 'routes/paths';
import DashboardMenu from 'components/common/DashboardMenu';
import DataGridPagination from 'components/pagination/DataGridPagination';

const getIndustryColor = (industry) => {
  const colorMap = {
    Technology: 'primary',
    Healthcare: 'success',
    Finance: 'warning',
    Manufacturing: 'neutral',
    Retail: 'info',
    Consulting: 'secondary',
    Education: 'success',
    Energy: 'warning',
    Media: 'error',
    Insurance: 'neutral',
    Logistics: 'primary',
  };
  return colorMap[industry] || 'neutral';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: '2-digit',
    month: 'short',
    day: 'numeric',
  });
};

const defaultPageSize = 20;

const AccountsTable = ({ apiRef, filterButtonEl }) => {
  const router = useRouter();
  const { data: accounts, error, isLoading } = useAccounts();

  const columns = useMemo(
    () => [
      {
        ...GRID_CHECKBOX_SELECTION_COL_DEF,
        width: 64,
      },
      {
        field: 'name',
        headerName: 'Name',
        minWidth: 300,
        flex: 1,
        renderCell: (params) => {
          return (
            <Link
              href={paths.crmAccountDetail(params.row.id)}
              variant="subtitle2"
              sx={{ fontWeight: 500, cursor: 'pointer' }}
              onClick={(e) => {
                e.preventDefault();
                router.push(paths.crmAccountDetail(params.row.id));
              }}
            >
              {params.row.name}
            </Link>
          );
        },
      },
      {
        field: 'industry',
        headerName: 'Industry',
        minWidth: 140,
        renderCell: (params) => {
          return (
            <Chip
              label={params.row.industry}
              variant="soft"
              color={getIndustryColor(params.row.industry)}
            />
          );
        },
      },
      {
        field: 'website',
        headerName: 'Website',
        minWidth: 220,
        renderCell: (params) => {
          return params.row.website ? (
            <Link
              href={params.row.website}
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
              sx={{ fontWeight: 400 }}
              onClick={(e) => e.stopPropagation()}
            >
              {params.row.website.replace(/^https?:\/\//, '')}
            </Link>
          ) : (
            <Typography variant="body2" color="text.secondary">
              —
            </Typography>
          );
        },
      },
      {
        field: 'phone',
        headerName: 'Phone',
        minWidth: 160,
        renderCell: (params) => {
          return params.row.phone || (
            <Typography variant="body2" color="text.secondary">
              —
            </Typography>
          );
        },
      },
      {
        field: 'created_at',
        headerName: 'Created',
        minWidth: 120,
        filterable: true,
        renderCell: (params) => formatDate(params.row.created_at),
      },
      {
        field: 'action',
        headerName: '',
        filterable: false,
        sortable: false,
        width: 60,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <DashboardMenu
            menuItems={[
              {
                label: 'View',
                onClick: (e) => {
                  e.stopPropagation();
                  router.push(paths.crmAccountDetail(params.row.id));
                },
              },
              {
                label: 'Edit',
                onClick: (e) => {
                  e.stopPropagation();
                  console.log('Edit account:', params.row.id);
                  // TODO: Navigate to edit page or open modal
                },
              },
              {
                label: 'Delete',
                onClick: (e) => {
                  e.stopPropagation();
                  console.log('Delete account:', params.row.id);
                  // TODO: Show confirmation dialog
                },
                sx: { color: 'error.main' },
              },
            ]}
          />
        ),
      },
    ],
    [router],
  );

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Error loading accounts
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: 1 }}>
      <DataGrid
        rowHeight={64}
        rows={accounts || []}
        apiRef={apiRef}
        columns={columns}
        loading={isLoading}
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
          router.push(paths.crmAccountDetail(params.row.id));
        }}
        slots={{
          basePagination: (props) => <DataGridPagination showFullPagination {...props} />,
        }}
        slotProps={{
          panel: {
            target: filterButtonEl,
          },
          row: {
            style: { cursor: 'pointer' },
          },
        }}
        sx={{
          '& .MuiDataGrid-row:hover': {
            cursor: 'pointer',
          },
        }}
      />
    </Box>
  );
};

export default AccountsTable;
