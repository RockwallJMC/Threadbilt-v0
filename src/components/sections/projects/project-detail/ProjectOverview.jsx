'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const ProjectOverview = ({ project }) => {
  const getPhaseStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'active':
        return 'primary';
      case 'pending':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Project Description */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Project Description
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {project.description}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Project Phases */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Project Phases
            </Typography>
            <Stack spacing={3}>
              {project.phases.map((phase) => (
                <Box key={phase.id}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {phase.name}
                      </Typography>
                      <Chip
                        label={phase.status}
                        color={getPhaseStatusColor(phase.status)}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Stack>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {phase.progress}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={phase.progress}
                    sx={{ height: 6, borderRadius: 3, mb: 1 }}
                  />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      Start: {new Date(phase.startDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      End: {new Date(phase.endDate).toLocaleDateString()}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Project Details */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Project Details
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Client</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{project.client}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Project Manager</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{project.projectManager.name}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ProjectOverview;
