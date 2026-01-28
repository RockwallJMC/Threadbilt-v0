import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { contactInfoData, ongoingDealsData } from 'data/crm/lead-details';
import ActivityTabs from 'components/sections/crm/common/ActivityTabs';
import ContactInfo from 'components/sections/crm/lead-details/ContactInfo';
import LeadDetailsHeader from 'components/sections/crm/lead-details/LeadDetailsHeader';
import OngoingDeals from 'components/sections/crm/lead-details/OngoingDeals';
import { useLead } from 'services/swr/api-hooks/useLeadApi';

const LeadDetails = ({ id }) => {
  // Fetch the lead data using the id
  const { data: lead, error, isLoading } = useLead(id);

  // TODO: After Phase 1.2, use real lead data instead of hardcoded contactInfoData
  // For now, we fetch the lead to validate the ID works but still use mock data

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading lead: {error.message}</div>;
  }

  return (
    <Stack direction="column">
      <LeadDetailsHeader lead={lead} />

      <Grid container>
        {contactInfoData.map((item) => (
          <Grid key={item.attribute} size={{ xs: 12, sm: 6, md: 4, xl: 2 }}>
            <ContactInfo attribute={item.attribute} value={item.value} />
          </Grid>
        ))}

        <Grid size={{ xs: 12, lg: 6 }}>
          <OngoingDeals ongoingDeals={ongoingDealsData} />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ px: { xs: 3, md: 5 }, py: 5, height: 1 }}>
            <ActivityTabs />
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};

LeadDetails.propTypes = {
  id: PropTypes.string.isRequired,
};

export default LeadDetails;
