'use client';

import Grid from '@mui/material/Grid';
import { Typography, Box } from '@mui/material';
import DashboardHeader from './DashboardHeader';
import DashboardWidgetContainer from './DashboardWidgetContainer';

/**
 * Main CRM Dashboard layout with responsive Grid
 * Phase 1.7.1: Infrastructure only - widgets will be added in Phases 1.7.2-1.7.5
 */
const DashboardLayout = () => {
  return (
    <Box>
      <DashboardHeader />

      <Grid container spacing={3}>
        {/* Row 1: KPI Metrics - 4 columns on desktop, stack on mobile */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardWidgetContainer title="Total Pipeline" minHeight={180}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Widgets will be added in Phases 1.7.2-1.7.5
            </Typography>
          </DashboardWidgetContainer>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardWidgetContainer title="Win Rate" minHeight={180}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Widgets will be added in Phases 1.7.2-1.7.5
            </Typography>
          </DashboardWidgetContainer>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardWidgetContainer title="Avg Deal Size" minHeight={180}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Widgets will be added in Phases 1.7.2-1.7.5
            </Typography>
          </DashboardWidgetContainer>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardWidgetContainer title="Sales Cycle" minHeight={180}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Widgets will be added in Phases 1.7.2-1.7.5
            </Typography>
          </DashboardWidgetContainer>
        </Grid>

        {/* Row 2: Main Charts - 2 columns */}
        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardWidgetContainer
            title="Pipeline by Stage"
            subtitle="Opportunity value breakdown"
            minHeight={350}
          >
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
              Chart widget placeholder
              <br />
              Phase 1.7.3 will add ECharts visualization
            </Typography>
          </DashboardWidgetContainer>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardWidgetContainer
            title="Opportunity Trend"
            subtitle="30-day pipeline movement"
            minHeight={350}
          >
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
              Chart widget placeholder
              <br />
              Phase 1.7.3 will add ECharts visualization
            </Typography>
          </DashboardWidgetContainer>
        </Grid>

        {/* Row 3: Lead Sources and Recent Activities */}
        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardWidgetContainer
            title="Lead Source Performance"
            subtitle="ROI by channel"
            minHeight={300}
          >
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
              Table widget placeholder
              <br />
              Phase 1.7.4 will add data table
            </Typography>
          </DashboardWidgetContainer>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardWidgetContainer
            title="Recent Activities"
            subtitle="Last 10 activities"
            minHeight={300}
          >
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
              Timeline widget placeholder
              <br />
              Phase 1.7.5 will add activity timeline
            </Typography>
          </DashboardWidgetContainer>
        </Grid>

        {/* Row 4: Proposals and Top Opportunities */}
        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardWidgetContainer
            title="Proposal Status"
            subtitle="Draft, Sent, Accepted, Declined"
            minHeight={280}
          >
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
              Chart widget placeholder
              <br />
              Phase 1.7.3 will add ECharts visualization
            </Typography>
          </DashboardWidgetContainer>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardWidgetContainer
            title="Top Opportunities"
            subtitle="Highest value deals"
            minHeight={280}
          >
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
              Table widget placeholder
              <br />
              Phase 1.7.4 will add data table
            </Typography>
          </DashboardWidgetContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardLayout;
