'use client';

import Grid from '@mui/material/Grid';
import { Typography, Box } from '@mui/material';
import DashboardHeader from './DashboardHeader';
import DashboardWidgetContainer from './DashboardWidgetContainer';

// KPI Widgets
import TotalPipelineValueWidget from './widgets/kpis/TotalPipelineValueWidget';
import WeightedForecastWidget from './widgets/kpis/WeightedForecastWidget';
import LeadConversionRateWidget from './widgets/kpis/LeadConversionRateWidget';
import OpportunityWinRateWidget from './widgets/kpis/OpportunityWinRateWidget';
import AverageDealSizeWidget from './widgets/kpis/AverageDealSizeWidget';
import AverageSalesCycleWidget from './widgets/kpis/AverageSalesCycleWidget';
import ProposalsAcceptanceRateWidget from './widgets/kpis/ProposalsAcceptanceRateWidget';
import TotalActiveAccountsWidget from './widgets/kpis/TotalActiveAccountsWidget';

// Activity Widgets (Phase 1.7.5)
import RecentActivitiesWidget from './widgets/activities/RecentActivitiesWidget';
import UpcomingTasksWidget from './widgets/activities/UpcomingTasksWidget';
import RecentProposalsWidget from './widgets/activities/RecentProposalsWidget';

// Lead Analytics Widgets (Phase 1.7.4)
import {
  LeadsBySourceWidget,
  TopPerformingAccountsWidget,
  LeadEngagementTrendWidget,
} from './widgets/leads';

// Pipeline Visualization Widgets (Phase 1.7.3)
import PipelineStageBreakdownWidget from './widgets/pipeline/PipelineStageBreakdownWidget';
import ConversionRateByStageWidget from './widgets/pipeline/ConversionRateByStageWidget';
import DealVelocityTrendWidget from './widgets/pipeline/DealVelocityTrendWidget';
import WinLossAnalysisWidget from './widgets/pipeline/WinLossAnalysisWidget';

/**
 * Main CRM Dashboard layout with responsive Grid
 * Phase 1.7.2: KPI Metrics widgets integrated
 * Phase 1.7.4: Lead Analytics widgets integrated
 */
const DashboardLayout = () => {
  return (
    <Box>
      <DashboardHeader />

      <Grid container spacing={3}>
        {/* Row 1: KPI Metrics - 4 columns on desktop, 2 on tablet, stack on mobile */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TotalPipelineValueWidget />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <WeightedForecastWidget />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <LeadConversionRateWidget />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <OpportunityWinRateWidget />
        </Grid>

        {/* Row 2: Additional KPI Metrics */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AverageDealSizeWidget />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AverageSalesCycleWidget />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ProposalsAcceptanceRateWidget />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TotalActiveAccountsWidget />
        </Grid>

        {/* Row 3: Pipeline Visualization (Phase 1.7.3) */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
            Pipeline Visualization
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <PipelineStageBreakdownWidget />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ConversionRateByStageWidget />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DealVelocityTrendWidget />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <WinLossAnalysisWidget />
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
          <RecentActivitiesWidget />
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

        {/* Row 5: Lead Analytics (Phase 1.7.4) */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
            Lead Analytics
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <LeadsBySourceWidget />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TopPerformingAccountsWidget />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <LeadEngagementTrendWidget />
        </Grid>

        {/* Row 6: Activity & Task Management (Phase 1.7.5) */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
            Activity & Task Management
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <UpcomingTasksWidget />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <RecentProposalsWidget />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardLayout;
