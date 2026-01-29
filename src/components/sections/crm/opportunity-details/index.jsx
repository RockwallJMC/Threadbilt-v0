'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { Paper } from '@mui/material';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  accountData,
  activitySummary,
  analyticsData,
  assignedToData,
  associatedContactData,
  opportunityInformation,
  salesPipelineData,
} from 'data/crm/opportunities';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import SimpleBar from 'components/base/SimpleBar';
import AssignedTo from 'components/sections/crm/opportunity-details/AssignedTo';
import FloatingBar from 'components/sections/crm/opportunity-details/FloatingBar';
import SalesPipeline from 'components/sections/crm/opportunity-details/SalesPipeline';
import Account from 'components/sections/crm/opportunity-details/account';
import ActivityMonitoring from 'components/sections/crm/opportunity-details/activity-monitoring';
import ActivitySummary from 'components/sections/crm/opportunity-details/activity-summary';
import Analytics from 'components/sections/crm/opportunity-details/analytics';
import AssociatedContact from 'components/sections/crm/opportunity-details/associated-contact';
import OpportunityInformation from 'components/sections/crm/opportunity-details/opportunity-information';
import OpportunityDetailsHeader from 'components/sections/crm/opportunity-details/page-header/OpportunityDetailsHeader';
import ForecastingWidget from 'components/sections/crm/opportunity-details/ForecastingWidget';
import ConvertedFromLead from 'components/sections/crm/opportunity-details/ConvertedFromLead';

const OpportunityDetails = ({ id }) => {
  const { topbarHeight } = useNavContext();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerOpen = () => setDrawerOpen(true);

  const handleDrawerClose = () => setDrawerOpen(false);

  // Mock data for now - will be replaced with actual data from API
  const opportunityData = {
    value: 150000,
    probability: 75,
    expectedCloseDate: '2026-03-15',
    convertedFromLeadId: id === '456e7890-f12b-34c5-d678-901234567890' ? '987fcdeb-51a2-43d1-b123-456789abcdef' : null,
    leadName: 'Sarah Mitchell',
  };

  const drawerContent = (
    <Stack direction="column" sx={{ height: 1, gap: 2 }}>
      {opportunityData.convertedFromLeadId && (
        <ConvertedFromLead
          convertedFromLeadId={opportunityData.convertedFromLeadId}
          leadName={opportunityData.leadName}
        />
      )}
      <ForecastingWidget
        value={opportunityData.value}
        probability={opportunityData.probability}
        expectedCloseDate={opportunityData.expectedCloseDate}
      />
      <OpportunityInformation opportunityInformation={opportunityInformation} />
      <ActivitySummary activitySummary={activitySummary} />
      <Analytics analyticsData={analyticsData} />
    </Stack>
  );

  return (
    <Stack direction="column">
      <OpportunityDetailsHeader title="Replica Badidas Futbol" />

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
                <AssignedTo assignedToData={assignedToData} />
              </Grid>
              <Grid size={12} flexGrow={1}>
                <AssociatedContact associatedContactData={associatedContactData} />
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 12, xl: 6 }}>
              <Account accountData={accountData} />
            </Grid>
          </Grid>

          <Grid size={12} flexGrow={1}>
            <ActivityMonitoring />
          </Grid>
        </Grid>
      </Grid>

      <FloatingBar contactInfo={assignedToData[0]} handleDrawerOpen={handleDrawerOpen} />
    </Stack>
  );
};

OpportunityDetails.propTypes = {
  id: PropTypes.string.isRequired,
};

export default OpportunityDetails;
