'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import IconifyIcon from 'components/base/IconifyIcon';

const ProjectDetailHeader = ({ project }) => {
  const router = useRouter();

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

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 3,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <IconButton onClick={() => router.back()}>
          <IconifyIcon icon="material-symbols:arrow-back" />
        </IconButton>
        
        <Box>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {project.name}
            </Typography>
            <Chip
              label={project.status}
              color={getStatusColor(project.status)}
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
            <Chip
              label={project.priority}
              color={getPriorityColor(project.priority)}
              size="small"
              variant="outlined"
              sx={{ textTransform: 'capitalize' }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {project.description}
          </Typography>
        </Box>
      </Stack>

      <Button variant="contained" startIcon={<IconifyIcon icon="material-symbols:edit" />}>
        Edit Project
      </Button>
    </Box>
  );
};

export default ProjectDetailHeader;
