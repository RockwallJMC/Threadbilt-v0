'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Chip, Link, Stack, Tab, Tabs, Typography } from '@mui/material';
import { DataGrid, GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid';
import { useProposals } from 'services/swr/api-hooks/useProposalApi';
import paths from 'routes/paths';
import DashboardMenu from 'components/common/DashboardMenu';
import DataGridPagination from 'components/pagination/DataGridPagination';
import { STATUS_COLORS } from 'constants/crm/proposalDefaults';

const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
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

// Status filter configurations
const STATUS_FILTERS = [
  { value: null, label: 'All Proposals' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
];

const ProposalsTable = ({ apiRef, filterButtonEl, selectedStatus, onStatusChange }) => {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(0);

  // Determine the status filter based on current tab
  const getStatusFilter = (tabIndex) => {
    const filter = STATUS_FILTERS[tabIndex];
    return filter.value;
  };

  // Fetch proposals based on current tab selection
  const statusFilter = getStatusFilter(currentTab);
  const { data: proposals, error, isLoading } = useProposals(
    statusFilter ? { status: statusFilter } : {},
  );

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    if (onStatusChange) {
      onStatusChange(getStatusFilter(newValue));
    }
  };

  const columns = useMemo(
    () => [
      {
        ...GRID_CHECKBOX_SELECTION_COL_DEF,
        width: 64,
      },
      {
        field: 'proposal_number',
        headerName: 'Proposal #',
        minWidth: 140,
        renderCell: (params) => {
          return (
            <Link
              href={paths.crmProposalDetail(params.row.id)}
              variant="subtitle2"
              sx={{ fontWeight: 500, cursor: 'pointer' }}
              onClick={(e) => {
                e.preventDefault();
                router.push(paths.crmProposalDetail(params.row.id));
              }}
            >
              {params.row.proposal_number}
            </Link>
          );
        },
      },
      {
        field: 'opportunity_name',
        headerName: 'Opportunity',
        minWidth: 200,
        flex: 1,
        renderCell: (params) => {
          return params.row.opportunity?.name || (
            <Typography variant="body2" color="text.secondary">
              —
            </Typography>
          );
        },
      },
      {
        field: 'account_name',
        headerName: 'Account',
        minWidth: 180,
        flex: 1,
        renderCell: (params) => {
          return params.row.account?.name || (
            <Typography variant="body2" color="text.secondary">
              —
            </Typography>
          );
        },
      },
      {
        field: 'status',
        headerName: 'Status',
        minWidth: 120,
        renderCell: (params) => {
          return (
            <Chip
              label={params.row.status}
              variant="soft"
              color={STATUS_COLORS[params.row.status] || 'default'}
              sx={{ textTransform: 'capitalize' }}
            />
          );
        },
      },
      {
        field: 'total_amount',
        headerName: 'Total Amount',
        minWidth: 140,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => {
          return (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {formatCurrency(params.row.total_amount)}
            </Typography>
          );
        },
      },
      {
        field: 'valid_until',
        headerName: 'Valid Until',
        minWidth: 120,
        renderCell: (params) => formatDate(params.row.valid_until),
      },
      {
        field: 'action',
        headerName: '',
        filterable: false,
        sortable: false,
        width: 60,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => {
          const isDraft = params.row.status === 'draft';

          return (
            <DashboardMenu
              menuItems={[
                {
                  label: 'View',
                  onClick: (e) => {
                    e.stopPropagation();
                    router.push(paths.crmProposalDetail(params.row.id));
                  },
                },
                {
                  label: 'Edit',
                  onClick: (e) => {
                    e.stopPropagation();
                    // TODO: Navigate to edit page
                  },
                  disabled: !isDraft,
                },
                {
                  label: 'Delete',
                  onClick: (e) => {
                    e.stopPropagation();
                    // TODO: Implement delete confirmation
                  },
                  disabled: !isDraft,
                  sx: { color: isDraft ? 'error.main' : 'text.disabled' },
                },
              ]}
            />
          );
        },
      },
    ],
    [router],
  );

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Error loading proposals
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {/* Status Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="proposal status filter tabs"
        >
          {STATUS_FILTERS.map((filter, index) => (
            <Tab key={filter.value || 'all'} label={filter.label} />
          ))}
        </Tabs>
      </Box>

      {/* DataGrid */}
      <Box sx={{ width: 1 }}>
        <DataGrid
          rowHeight={64}
          rows={proposals || []}
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
            router.push(paths.crmProposalDetail(params.row.id));
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
    </Stack>
  );
};

export default ProposalsTable;
