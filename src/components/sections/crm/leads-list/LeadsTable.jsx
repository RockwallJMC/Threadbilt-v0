'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Chip, Link, Stack, Tab, Tabs, Typography } from '@mui/material';
import { DataGrid, GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid';
import { useLeads } from 'services/swr/api-hooks/useLeadApi';
import paths from 'routes/paths';
import DashboardMenu from 'components/common/DashboardMenu';
import DataGridPagination from 'components/pagination/DataGridPagination';
import ConvertLeadModal from 'components/sections/crm/leads/ConvertLeadModal';

const getStatusColor = (status) => {
  switch (status) {
    case 'new':
      return 'default';
    case 'contacted':
      return 'info';
    case 'qualified':
      return 'success';
    case 'unqualified':
      return 'error';
    case 'converted':
      return 'success';
    default:
      return 'neutral';
  }
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
  { value: null, label: 'All Leads' },
  { value: 'active', label: 'Active Leads' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'unqualified', label: 'Unqualified' },
  { value: 'converted', label: 'Converted' },
];

const LeadsTable = ({ apiRef, filterButtonEl, selectedStatus, onStatusChange }) => {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(0);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Determine the status filter based on current tab
  const getStatusFilter = (tabIndex) => {
    const filter = STATUS_FILTERS[tabIndex];
    return filter.value;
  };

  // Fetch leads based on current tab selection
  const statusFilter = getStatusFilter(currentTab);
  const { data: allLeads, error, isLoading } = useLeads(
    statusFilter === 'active' ? null : statusFilter,
  );

  // Filter out converted and unqualified for "Active Leads" tab
  const leads = useMemo(() => {
    if (!allLeads) return [];
    if (statusFilter === 'active') {
      return allLeads.filter(
        (lead) => lead.status !== 'converted' && lead.status !== 'unqualified',
      );
    }
    return allLeads;
  }, [allLeads, statusFilter]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    if (onStatusChange) {
      onStatusChange(getStatusFilter(newValue));
    }
  };

  const handleOpenConvertModal = (lead) => {
    setSelectedLead(lead);
    setConvertModalOpen(true);
  };

  const handleCloseConvertModal = () => {
    setConvertModalOpen(false);
    setSelectedLead(null);
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
              href={paths.crmLeadDetail(params.row.id)}
              variant="subtitle2"
              sx={{ fontWeight: 500, cursor: 'pointer' }}
              onClick={(e) => {
                e.preventDefault();
                router.push(paths.crmLeadDetail(params.row.id));
              }}
            >
              {params.row.name}
            </Link>
          );
        },
      },
      {
        field: 'company',
        headerName: 'Company',
        minWidth: 200,
        flex: 1,
        renderCell: (params) => {
          return params.row.company || (
            <Typography variant="body2" color="text.secondary">
              —
            </Typography>
          );
        },
      },
      {
        field: 'email',
        headerName: 'Email',
        minWidth: 220,
        renderCell: (params) => {
          return params.row.email ? (
            <Link
              href={`mailto:${params.row.email}`}
              variant="body2"
              sx={{ fontWeight: 400 }}
              onClick={(e) => e.stopPropagation()}
            >
              {params.row.email}
            </Link>
          ) : (
            <Typography variant="body2" color="text.secondary">
              —
            </Typography>
          );
        },
      },
      {
        field: 'status',
        headerName: 'Status',
        minWidth: 140,
        renderCell: (params) => {
          return (
            <Chip
              label={params.row.status}
              variant="soft"
              color={getStatusColor(params.row.status)}
              sx={{ textTransform: 'capitalize' }}
            />
          );
        },
      },
      {
        field: 'source',
        headerName: 'Source',
        minWidth: 140,
        renderCell: (params) => {
          return (
            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
              {params.row.source?.replace(/_/g, ' ') || '—'}
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
                  router.push(paths.crmLeadDetail(params.row.id));
                },
              },
              {
                label: 'Convert to Opportunity',
                onClick: (e) => {
                  e.stopPropagation();
                  handleOpenConvertModal(params.row);
                },
              },
              {
                label: 'Edit',
                onClick: (e) => {
                  e.stopPropagation();
                },
              },
              {
                label: 'Delete',
                onClick: (e) => {
                  e.stopPropagation();
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
          Error loading leads
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Stack spacing={2}>
        {/* Status Filter Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="lead status filter tabs"
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
            rows={leads || []}
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
              router.push(paths.crmLeadDetail(params.row.id));
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

      {/* Convert Lead Modal */}
      <ConvertLeadModal
        open={convertModalOpen}
        onClose={handleCloseConvertModal}
        lead={selectedLead}
      />
    </>
  );
};

export default LeadsTable;
