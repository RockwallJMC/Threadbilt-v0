'use client';

import { useMemo } from 'react';
import { Avatar, Box, Chip, Link, Stack, Typography } from '@mui/material';
import { DataGrid, GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import paths from 'routes/paths';
import DashboardMenu from 'components/common/DashboardMenu';
import DataGridPagination from 'components/pagination/DataGridPagination';

const getStatusBadgeColor = (val) => {
  switch (val) {
    case 'emergency':
      return 'error';
    case 'in-progress':
      return 'warning';
    case 'scheduled':
      return 'info';
    case 'complete':
      return 'success';
    default:
      return 'neutral';
  }
};

const getPriorityBadgeColor = (val) => {
  switch (val) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'neutral';
  }
};

const defaultPageSize = 8;

const TicketListTable = ({ apiRef, data, filterButtonEl, filterModel, onFilterModelChange }) => {
  const columns = useMemo(
    () => [
      {
        ...GRID_CHECKBOX_SELECTION_COL_DEF,
        width: 64,
      },
      {
        field: 'id',
        headerName: 'Ticket',
        sortable: false,
        filterable: true,
        minWidth: 80,
        renderCell: (params) => {
          const { id } = params.row;

          return (
            <Link
              variant="body2"
              sx={{ fontWeight: 400 }}
              href={paths.ticketDetailWithId(id.toString())}
            >
              #{id}
            </Link>
          );
        },
      },
      {
        field: 'customer',
        headerName: 'Customer',
        minWidth: 260,
        filterable: true,
        flex: 1,
        valueGetter: ({ name }) => name,
        renderCell: (params) => {
          const { name, avatar, address } = params.row.customer;

          return (
            <Stack
              sx={{
                gap: 1.5,
                alignItems: 'center',
              }}
            >
              <Avatar alt={name} src={avatar} sx={{ width: 24, height: 24 }} />
              <div>
                <Typography variant="subtitle2" sx={{ fontWeight: 400 }}>
                  {name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {address}
                </Typography>
              </div>
            </Stack>
          );
        },
      },
      {
        field: 'serviceType',
        headerName: 'Service Type',
        filterable: true,
        minWidth: 180,
        flex: 1,
        renderCell: (params) => {
          return (
            <Typography variant="body2" sx={{ fontWeight: 400 }}>
              {params.row.serviceType}
            </Typography>
          );
        },
      },
      {
        field: 'technician',
        headerName: 'Technician',
        minWidth: 160,
        filterable: true,
        valueGetter: ({ name }) => name,
        renderCell: (params) => {
          const { name, avatar } = params.row.technician;

          return (
            <Stack
              sx={{
                gap: 1.5,
                alignItems: 'center',
              }}
            >
              <Avatar alt={name} src={avatar} sx={{ width: 24, height: 24 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 400 }}>
                {name}
              </Typography>
            </Stack>
          );
        },
      },
      {
        field: 'scheduledDate',
        headerName: 'Scheduled',
        valueGetter: ({ date }) => date,
        filterable: true,
        minWidth: 150,
        renderCell: (params) => {
          return (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 400 }}>
                {dayjs(params.row.scheduledDate.date).format('MMM DD, YYYY')}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                {params.row.scheduledDate.time}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: 'status',
        headerName: 'Status',
        filterable: true,
        minWidth: 130,
        renderCell: (params) => {
          return (
            <Chip
              label={params.row.status.replace('-', ' ')}
              variant="soft"
              color={getStatusBadgeColor(params.row.status)}
              sx={{ textTransform: 'capitalize' }}
            />
          );
        },
      },
      {
        field: 'priority',
        headerName: 'Priority',
        filterable: true,
        minWidth: 100,
        renderCell: (params) => {
          return (
            <Chip
              label={params.row.priority}
              variant="soft"
              color={getPriorityBadgeColor(params.row.priority)}
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
          );
        },
      },
      {
        field: 'action',
        headerName: '',
        filterable: false,
        sortable: false,
        align: 'right',
        width: 60,
        headerAlign: 'right',
        renderCell: () => <DashboardMenu />,
      },
    ],
    [],
  );

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rowHeight={72}
        rows={data}
        apiRef={apiRef}
        columns={columns}
        pageSizeOptions={[defaultPageSize]}
        filterModel={filterModel}
        onFilterModelChange={onFilterModelChange}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: defaultPageSize,
            },
          },
        }}
        checkboxSelection
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            minWidth: '100%',
          },
        }}
        slots={{
          basePagination: (props) => <DataGridPagination showFullPagination {...props} />,
        }}
        slotProps={{
          panel: {
            target: filterButtonEl,
          },
        }}
      />
    </Box>
  );
};

export default TicketListTable;
