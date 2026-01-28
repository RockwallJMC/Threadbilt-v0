'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Alert, Paper, Skeleton, Stack, Typography } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Grid from '@mui/material/Grid';
import { useContact } from 'services/swr/api-hooks/useContactApi';
import ContactSidebar from './ContactSidebar';
import OverviewTab from './OverviewTab';
import ActivityTabs from 'components/sections/crm/common/ActivityTabs';

const ContactTab = {
  Overview: 'Overview',
  Activity: 'Activity',
  Opportunities: 'Opportunities',
  Documents: 'Documents',
};

const ContactDetail = () => {
  const params = useParams();
  const contactId = params?.id;

  const [activeTab, setActiveTab] = useState(ContactTab.Overview);

  const { data: contact, error, isLoading } = useContact(contactId);

  const handleTabChange = (_event, newValue) => setActiveTab(newValue);

  // Loading state
  if (isLoading) {
    return (
      <Stack direction="column" spacing={2} sx={{ p: { xs: 3, md: 5 } }}>
        <Skeleton variant="rectangular" width="100%" height={60} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 3 }}>
            <Skeleton variant="rectangular" width="100%" height={400} />
          </Grid>
          <Grid size={{ xs: 12, lg: 9 }}>
            <Skeleton variant="rectangular" width="100%" height={400} />
          </Grid>
        </Grid>
      </Stack>
    );
  }

  // Error state
  if (error) {
    return (
      <Stack direction="column" spacing={2} sx={{ p: { xs: 3, md: 5 } }}>
        <Alert severity="error">
          {error.message === `Contact not found: ${contactId}`
            ? 'Contact not found'
            : `Error loading contact: ${error.message}`}
        </Alert>
      </Stack>
    );
  }

  // Not found state
  if (!contact) {
    return (
      <Stack direction="column" spacing={2} sx={{ p: { xs: 3, md: 5 } }}>
        <Alert severity="warning">Contact not found</Alert>
      </Stack>
    );
  }

  // Success state
  return (
    <Stack direction="column">
      {/* Header */}
      <Stack sx={{ p: { xs: 3, md: 5 }, pb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {contact.first_name} {contact.last_name}
        </Typography>
      </Stack>

      {/* Main content */}
      <Grid container spacing={2} sx={{ px: { xs: 3, md: 5 } }}>
        {/* Left sidebar */}
        <Grid size={{ xs: 12, lg: 3 }}>
          <ContactSidebar contact={contact} />
        </Grid>

        {/* Tabs panel */}
        <Grid size={{ xs: 12, lg: 9 }}>
          <Paper background={1} sx={{ p: { xs: 3, md: 5 } }}>
            <TabContext value={activeTab}>
              <Tabs
                onChange={handleTabChange}
                value={activeTab}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
              >
                <Tab label={ContactTab.Overview} value={ContactTab.Overview} />
                <Tab label={ContactTab.Activity} value={ContactTab.Activity} />
                <Tab label={ContactTab.Opportunities} value={ContactTab.Opportunities} />
                <Tab label={ContactTab.Documents} value={ContactTab.Documents} />
              </Tabs>

              <TabPanel value={ContactTab.Overview} sx={{ px: 0, pb: 0 }}>
                <OverviewTab contact={contact} />
              </TabPanel>

              <TabPanel value={ContactTab.Activity} sx={{ px: 0, pb: 0 }}>
                <ActivityTabs />
              </TabPanel>

              <TabPanel value={ContactTab.Opportunities} sx={{ px: 0, pb: 0 }}>
                <Alert severity="info">
                  Contact opportunities will be available in Phase 1.5
                </Alert>
              </TabPanel>

              <TabPanel value={ContactTab.Documents} sx={{ px: 0, pb: 0 }}>
                <Alert severity="info">Document management coming soon</Alert>
              </TabPanel>
            </TabContext>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ContactDetail;
