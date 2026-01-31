'use client';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useCRMContact } from 'services/swr/api-hooks/useCRMContactApi';
import ActivityTabs from 'components/sections/crm/common/ActivityTabs';
import ContactInfo from 'components/sections/crm/lead-details/ContactInfo';
import LeadDetailsHeader from 'components/sections/crm/lead-details/LeadDetailsHeader';
import OngoingDeals from 'components/sections/crm/lead-details/OngoingDeals';

const LeadDetails = ({ contactId }) => {
  const { data: contact, error, isLoading } = useCRMContact(contactId);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !contact) {
    return (
      <Box p={3}>
        <Alert severity="error">
          {error?.message || 'Contact not found'}
        </Alert>
      </Box>
    );
  }

  // Transform API data to match existing component format
  const contactInfoData = [
    { attribute: 'Title', value: contact.title || 'N/A' },
    { attribute: 'Account', value: contact.company?.name || 'N/A' },
    { attribute: 'Lead Source', value: contact.lead_source || 'N/A' },
    { attribute: 'Email', value: contact.email || 'N/A' },
    { attribute: 'Phone No.', value: contact.phone || 'N/A' },
    { attribute: 'Contact Owner', value: 'Sales Team' },
  ];

  const ongoingDealsData = contact.deals || [];
  return (
    <Stack direction="column">
      <LeadDetailsHeader />

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
            <ActivityTabs contactId={contactId} />
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default LeadDetails;
