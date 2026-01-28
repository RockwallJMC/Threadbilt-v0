'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Alert, Paper, Skeleton, Stack, Typography } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Grid from '@mui/material/Grid';
import { useAccount, useAccountContacts } from 'services/swr/api-hooks/useAccountApi';
import AccountSidebar from './AccountSidebar';
import OverviewTab from './OverviewTab';
import ContactsTab from './ContactsTab';
import ActivityTabs from 'components/sections/crm/common/ActivityTabs';

const AccountTab = {
  Overview: 'Overview',
  Contacts: 'Contacts',
  Opportunities: 'Opportunities',
  Activity: 'Activity',
};

const AccountDetail = () => {
  const params = useParams();
  const accountId = params?.id;

  const [activeTab, setActiveTab] = useState(AccountTab.Overview);

  const { data: account, error, isLoading } = useAccount(accountId);

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
          {error.message === `Account not found: ${accountId}`
            ? 'Account not found'
            : `Error loading account: ${error.message}`}
        </Alert>
      </Stack>
    );
  }

  // Not found state
  if (!account) {
    return (
      <Stack direction="column" spacing={2} sx={{ p: { xs: 3, md: 5 } }}>
        <Alert severity="warning">Account not found</Alert>
      </Stack>
    );
  }

  // Success state
  return (
    <Stack direction="column">
      {/* Header */}
      <Stack sx={{ p: { xs: 3, md: 5 }, pb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {account.name}
        </Typography>
      </Stack>

      {/* Main content */}
      <Grid container spacing={2} sx={{ px: { xs: 3, md: 5 } }}>
        {/* Left sidebar */}
        <Grid size={{ xs: 12, lg: 3 }}>
          <AccountSidebar account={account} />
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
                <Tab label={AccountTab.Overview} value={AccountTab.Overview} />
                <Tab label={AccountTab.Contacts} value={AccountTab.Contacts} />
                <Tab label={AccountTab.Opportunities} value={AccountTab.Opportunities} />
                <Tab label={AccountTab.Activity} value={AccountTab.Activity} />
              </Tabs>

              <TabPanel value={AccountTab.Overview} sx={{ px: 0, pb: 0 }}>
                <OverviewTab account={account} />
              </TabPanel>

              <TabPanel value={AccountTab.Contacts} sx={{ px: 0, pb: 0 }}>
                <ContactsTab accountId={accountId} />
              </TabPanel>

              <TabPanel value={AccountTab.Opportunities} sx={{ px: 0, pb: 0 }}>
                <Alert severity="info">
                  Opportunities will be available in Phase 1.5
                </Alert>
              </TabPanel>

              <TabPanel value={AccountTab.Activity} sx={{ px: 0, pb: 0 }}>
                <ActivityTabs />
              </TabPanel>
            </TabContext>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default AccountDetail;
