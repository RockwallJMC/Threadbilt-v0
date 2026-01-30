'use client';

import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';

const ProjectsList = ({ projects }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'primary';
      case 'on-hold':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Project Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.client}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getPriorityColor(params.value)}
          size="small"
          variant="outlined"
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ width: '100%' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <LinearProgress
              variant="determinate"
              value={params.value}
              sx={{ flex: 1, height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" sx={{ minWidth: 35 }}>
              {params.value}%
            </Typography>
          </Stack>
        </Box>
      ),
    },
    {
      field: 'budget',
      headerName: 'Budget',
      width: 120,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {formatCurrency(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatCurrency(params.row.spent)} spent
          </Typography>
        </Box>
      ),
    },
    {
      field: 'team',
      headerName: 'Team',
      width: 150,
      renderCell: (params) => (
        <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 28, height: 28 } }}>
          {params.value.map((member, index) => (
            <Avatar key={index} src={member.avatar} alt={member.name}>
              {member.name.charAt(0)}
            </Avatar>
          ))}
        </AvatarGroup>
      ),
    },
    {
      field: 'endDate',
      headerName: 'Due Date',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => console.log('View project', params.row.id)}>
            <IconifyIcon icon="material-symbols:visibility-outline" />
          </IconButton>
          <IconButton size="small" onClick={() => console.log('Edit project', params.row.id)}>
            <IconifyIcon icon="material-symbols:edit-outline" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <DataGrid
      rows={projects}
      columns={columns}
      pageSize={10}
      rowsPerPageOptions={[10, 25, 50]}
      disableSelectionOnClick
      autoHeight
      sx={{
        '& .MuiDataGrid-cell': {
          borderBottom: 'none',
        },
        '& .MuiDataGrid-row': {
          borderBottom: 1,
          borderColor: 'divider',
        },
      }}
    />
  );
};

export default ProjectsList;
