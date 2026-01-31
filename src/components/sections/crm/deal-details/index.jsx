'use client';

import { useState } from 'react';
import { Paper, Skeleton, Alert } from '@mui/material';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCRMDealApi } from 'services/swr/api-hooks/useCRMDealApi';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import SimpleBar from 'components/base/SimpleBar';
import AssignedTo from 'components/sections/crm/deal-details/AssignedTo';
import FloatingBar from 'components/sections/crm/deal-details/FloatingBar';
import SalesPipeline from 'components/sections/crm/deal-details/SalesPipeline';
import Account from 'components/sections/crm/deal-details/account';
import ActivityMonitoring from 'components/sections/crm/deal-details/activity-monitoring';
import ActivitySummary from 'components/sections/crm/deal-details/activity-summary';
import Analytics from 'components/sections/crm/deal-details/analytics';
import AssociatedContact from 'components/sections/crm/deal-details/associated-contact';
import DealInformation from 'components/sections/crm/deal-details/deal-information';
import DealDetailsHeader from 'components/sections/crm/deal-details/page-header/DealDetailsHeader';

const DealDetails = ({ dealId }) => {
  const { topbarHeight } = useNavContext();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch deal data
  const { deal, analytics, isLoading, error } = useCRMDealApi(dealId);

  const handleDrawerOpen = () => setDrawerOpen(true);

  const handleDrawerClose = () => setDrawerOpen(false);

  // Loading state
  if (isLoading) {
    return (
      <Stack direction="column" gap={2} p={3} data-testid="loading-skeleton">
        <Skeleton variant="rectangular" height={100} />
        <Skeleton variant="rectangular" height={400} />
      </Stack>
    );
  }

  // Error state
  if (error || !deal) {
    return (
      <Alert severity="error" sx={{ m: 3 }} data-testid="error-message">
        {error?.message || 'Failed to load deal details'}
      </Alert>
    );
  }

  // Transform data for existing components
  const dealInformation = [
    { id: 1, attribute: 'Last updated', value: deal.updated_at, background: true },
    { id: 2, attribute: 'Deal Details', value: deal.description || '', background: false },
    { id: 3, attribute: 'Create Date', value: deal.created_at, background: true },
    { id: 4, attribute: 'Created By', value: deal.created_by, background: false },
    { id: 5, attribute: 'Current Stage', value: deal.stage, background: true },
    { id: 6, attribute: 'Closing Date', value: deal.close_date, background: false },
    { id: 7, attribute: 'Associated Contact', value: deal.contact?.first_name, background: true },
    { id: 8, attribute: 'Priority', value: deal.priority || 'not set', background: false },
    { id: 9, attribute: 'Deal Owner', value: deal.collaborators?.owner?.full_name || deal.collaborators?.owner?.email || 'N/A', background: true },
    { id: 10, attribute: 'Collaborating Agents', value: deal.collaborators?.collaborators?.map(c => c.full_name || c.email).join(', ') || 'None', background: false },
    { id: 11, attribute: 'Budget Forecast', value: deal.value, background: true },
    { id: 12, attribute: 'Deal Probability', value: deal.probability, background: false },
  ];

  const activitySummary = {
    summary: [
      { id: 'call', attribute: 'Calls', value: deal.activity_summary?.by_type?.call || 0 },
      { id: 'email', attribute: 'Emails', value: deal.activity_summary?.by_type?.email || 0 },
      { id: 'meeting', attribute: 'Meeting', value: deal.activity_summary?.by_type?.meeting || 0 },
    ],
    timeline: (deal.recent_activities || []).slice(0, 4).map(a => ({
      id: a.id,
      title: a.subject,
      description: a.description,
      date: a.activity_date,
    })),
  };

  const analyticsData = analytics ? [
    { value: analytics.deal_progress, name: 'Deal Progress' },
    { value: analytics.win_loss_ratio, name: 'Win/Loss Ratio' },
    { value: analytics.conversion_rate, name: 'Conversion Rate' },
    { value: analytics.engagement_metrics, name: 'Engagement Metrics' },
  ] : [];

  const assignedToData = [
    {
      type: 'Deal Owner',
      people: deal.collaborators?.owner ? [deal.collaborators.owner] : [],
    },
    {
      type: 'Collaborator',
      people: deal.collaborators?.collaborators || [],
    },
    {
      type: 'Follower',
      people: deal.collaborators?.followers || [],
    },
  ];

  const accountData = {
    name: deal.company?.name || '',
    dateCreated: deal.company?.created_at || '',
    logo: deal.company?.logo_url || '',
    tags: deal.company?.tags || [],
    ongoingDeals: deal.company?.deals?.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost') || [],
    pastDeals: deal.company?.deals?.filter(d => d.stage === 'closed_won' || d.stage === 'closed_lost') || [],
  };

  const associatedContactData = deal.contact ? [{
    id: deal.contact.id,
    name: `${deal.contact.first_name} ${deal.contact.last_name}`,
    avatar: deal.contact.avatar_url,
    designation: deal.contact.title,
    company: deal.contact.company?.name,
    contactInfo: {
      phone: deal.contact.phone,
      email: deal.contact.email,
      contactOwner: deal.collaborators?.owner ? [deal.collaborators.owner] : [],
    },
  }] : [];

  // Sales pipeline - map stage to progress
  const stageMapping = {
    'lead': 1,
    'qualified': 2,
    'proposal': 3,
    'negotiation': 4,
    'closed_won': 5,
    'closed_lost': 5,
  };
  const currentStage = stageMapping[deal.stage] || 1;

  const salesPipelineData = [
    { id: 1, name: 'Contact', status: currentStage >= 1 ? 'done' : 'pending' },
    { id: 2, name: 'MQL', status: currentStage >= 2 ? 'done' : 'pending' },
    { id: 3, name: 'SQL', status: currentStage >= 3 ? 'done' : 'pending' },
    { id: 4, name: 'Chance', status: currentStage >= 4 ? 'done' : 'pending' },
    { id: 5, name: 'W/L', status: currentStage >= 5 ? 'ongoing' : 'pending' },
  ];

  const drawerContent = (
    <Stack direction="column" sx={{ height: 1 }}>
      <DealInformation dealInformation={dealInformation} />
      <ActivitySummary activitySummary={activitySummary} />
      <Analytics analyticsData={analyticsData} />
    </Stack>
  );

  return (
    <Stack direction="column">
      <DealDetailsHeader title={deal.name} data-testid="deal-name" />

      <Grid container>
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            [`& .${drawerClasses.paper}`]: {
              maxWidth: 400,
              width: 1,
            },
            display: { xs: 'block', lg: 'none' },
          }}
        >
          <SimpleBar>
            <Stack
              gap={1}
              sx={{
                py: 3,
                px: { xs: 3, md: 5 },
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'background.elevation1',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                More information
              </Typography>
              <IconButton color="default" size="small" onClick={handleDrawerClose}>
                <IconifyIcon
                  icon="material-symbols:close-small-rounded"
                  sx={{ fontSize: 20, color: 'neutral.dark' }}
                />
              </IconButton>
            </Stack>
            {drawerContent}
          </SimpleBar>
        </Drawer>

        <Paper
          sx={{
            display: { xs: 'none', lg: 'block' },
            maxWidth: 400,
            width: 1,
            height: ({ mixins }) => mixins.contentHeight(topbarHeight),
            overflow: 'hidden',
            position: 'sticky',
            top: topbarHeight,
          }}
        >
          <SimpleBar>{drawerContent}</SimpleBar>
        </Paper>

        <Grid container size="grow" direction="column" alignContent="flex-start">
          <Grid size={12}>
            <SalesPipeline salesPipelineData={salesPipelineData} />
          </Grid>

          <Grid container size={12}>
            <Grid container direction="column" size={{ xs: 12, md: 6, lg: 12, xl: 6 }}>
              <Grid size={12}>
                <AssignedTo assignedToData={assignedToData} data-testid="deal-owner" />
              </Grid>
              <Grid size={12} flexGrow={1}>
                <AssociatedContact associatedContactData={associatedContactData} data-testid="associated-contact" />
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 12, xl: 6 }}>
              <Account accountData={accountData} data-testid="account-name" />
            </Grid>
          </Grid>

          <Grid size={12} flexGrow={1}>
            <ActivityMonitoring dealId={dealId} />
          </Grid>
        </Grid>
      </Grid>

      <FloatingBar contactInfo={assignedToData[0]} handleDrawerOpen={handleDrawerOpen} />
    </Stack>
  );
};

export default DealDetails;
