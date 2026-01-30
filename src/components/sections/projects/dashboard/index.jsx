'use client';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { projectMetrics, projectsData } from 'data/projects/dashboard';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import ProjectsKPIs from './ProjectsKPIs';
import ProjectsList from './ProjectsList';
import ProjectsHeader from './ProjectsHeader';

const ProjectsDashboard = () => {
  const { up } = useBreakpoints();
  const upMd = up('md');

  return (
    <Paper sx={{ p: 0 }}>
      <ProjectsHeader />
      
      <Grid container spacing={3} sx={{ p: 3 }}>
        {/* KPI Metrics */}
        <Grid size={12}>
          <ProjectsKPIs metrics={projectMetrics} />
        </Grid>

        {/* Projects List */}
        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Active Projects
            </Typography>
            <ProjectsList projects={projectsData} />
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: 200 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Quick Actions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create new project, convert opportunities, manage tasks
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: 200 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Latest project updates and task completions
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProjectsDashboard;
