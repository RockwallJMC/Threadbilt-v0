'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Avatar,
  Box,
  Chip,
  Link,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { DataGrid, GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid';
import { useOpportunities } from 'services/swr/api-hooks/useOpportunitiesApi';
import paths from 'routes/paths';
import DashboardMenu from 'components/common/DashboardMenu';
import DataGridPagination from 'components/pagination/DataGridPagination';

// Stage color mapping
const STAGE_COLORS = {
  qualification: 'info',
  proposal: 'warning',
  negotiation: 'primary',
  closed_won: 'success',
  closed_lost: 'error',
};

const getStageColor = (stage) => {
  return STAGE_COLORS[stage] || 'default';
};

const formatCurrency = (value) => {
  if (!value && value !== 0) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

const defaultPageSize = 25;

// Stage filter configurations
const STAGE_FILTERS = [
  { value: null, label: 'All' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Won' },
  { value: 'closed_lost', label: 'Lost' },
];

const OpportunitiesTable = ({ apiRef, filterButtonEl, selectedStage, onStageChange }) => {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(0);

  // Determine the stage filter based on current tab
  const getStageFilter = (tabIndex) => {
    const filter = STAGE_FILTERS[tabIndex];
    return filter.value;
  };

  // Fetch opportunities based on current tab selection
  const stageFilter = getStageFilter(currentTab);
  const { opportunities, error, isLoading } = useOpportunities({
    stage: stageFilter,
  });

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    if (onStageChange) {
      onStageChange(getStageFilter(newValue));
    }
  };

  const columns = useMemo(
    () => [
      {
        ...GRID_CHECKBOX_SELECTION_COL_DEF,
        width: 64,
      },
      {
        field: 'name',
        headerName: 'Name',
        minWidth: 200,
        flex: 1,
        renderCell: (params) => {
          return (
            <Link
              href={paths.opportunityDetail(params.row.id)}
              variant="subtitle2"
              sx={{ fontWeight: 500, cursor: 'pointer' }}
              onClick={(e) => {
                e.preventDefault();
                router.push(paths.opportunityDetail(params.row.id));
              }}
            >
              {params.row.name}
            </Link>
          );
        },
      },
      {
        field: 'account_name',
        headerName: 'Account',
        minWidth: 180,
        flex: 1,
        renderCell: (params) => {
          const { account_name, account_logo } = params.row;
          if (!account_name) {
            return (
              <Typography variant="body2" color="text.secondary">
                —
              </Typography>
            );
          }

          return (
            <Stack direction="row" spacing={1} alignItems="center">
              {account_logo && (
                <Avatar
                  src={account_logo}
                  alt={account_name}
                  sx={{ width: 24, height: 24 }}
                  variant="rounded"
                />
              )}
              <Link
                href="#!"
                variant="body2"
                sx={{ fontWeight: 400 }}
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Navigate to account detail page
                }}
              >
                {account_name}
              </Link>
            </Stack>
          );
        },
      },
      {
        field: 'amount',
        headerName: 'Value',
        minWidth: 120,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => {
          return (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {formatCurrency(params.row.amount)}
            </Typography>
          );
        },
      },
      {
        field: 'probability',
        headerName: 'Probability',
        minWidth: 110,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => {
          return (
            <Typography variant="body2">
              {params.row.probability}%
            </Typography>
          );
        },
      },
      {
        field: 'stage',
        headerName: 'Stage',
        minWidth: 140,
        renderCell: (params) => {
          return (
            <Chip
              label={params.row.stage?.replace(/_/g, ' ')}
              variant="soft"
              color={getStageColor(params.row.stage)}
              sx={{ textTransform: 'capitalize' }}
            />
          );
        },
      },
      {
        field: 'expected_close_date',
        headerName: 'Expected Close',
        minWidth: 130,
        renderCell: (params) => formatDate(params.row.expected_close_date),
      },
      {
        field: 'assigned_to_name',
        headerName: 'Assigned To',
        minWidth: 160,
        renderCell: (params) => {
          const { assigned_to_name, assigned_to_avatar } = params.row;
          if (!assigned_to_name) {
            return (
              <Typography variant="body2" color="text.secondary">
                —
              </Typography>
            );
          }

          return (
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                src={assigned_to_avatar}
                alt={assigned_to_name}
                sx={{ width: 28, height: 28 }}
              >
                {assigned_to_name.charAt(0)}
              </Avatar>
              <Typography variant="body2">{assigned_to_name}</Typography>
            </Stack>
          );
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
        renderCell: (params) => (
          <DashboardMenu
            menuItems={[
              {
                label: 'View',
                onClick: (e) => {
                  e.stopPropagation();
                  router.push(paths.opportunityDetail(params.row.id));
                },
              },
              {
                label: 'Edit',
                onClick: (e) => {
                  e.stopPropagation();
                  // TODO: Open edit dialog
                },
              },
              {
                label: 'Delete',
                onClick: (e) => {
                  e.stopPropagation();
                  // TODO: Open delete confirmation dialog
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
          Error loading opportunities
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {/* Stage Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="opportunity stage filter tabs"
        >
          {STAGE_FILTERS.map((filter, index) => (
            <Tab key={filter.value || 'all'} label={filter.label} />
          ))}
        </Tabs>
      </Box>

      {/* DataGrid */}
      <Box sx={{ width: 1 }}>
        <DataGrid
          rowHeight={64}
          rows={opportunities || []}
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
            sorting: {
              sortModel: [{ field: 'expected_close_date', sort: 'asc' }],
            },
          }}
          checkboxSelection
          onRowClick={(params) => {
            router.push(paths.crmOpportunityDetail(params.row.id));
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

export default OpportunitiesTable;
