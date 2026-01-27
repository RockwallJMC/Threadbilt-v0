'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Paper, Tab, Tabs, Typography, Stack, CircularProgress } from '@mui/material';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import CreateOrganizationForm from '@/components/sections/organization/CreateOrganizationForm';
import JoinOrganizationForm from '@/components/sections/organization/JoinOrganizationForm';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`organization-tabpanel-${index}`}
      aria-labelledby={`organization-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `organization-tab-${index}`,
    'aria-controls': `organization-tabpanel-${index}`,
  };
}

const OrganizationSetupPage = () => {
  const router = useRouter();
  const { user, loading, organizationId } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push('/authentication/default/jwt/login');
    }

    // Redirect to dashboard if user already has an organization
    if (!loading && organizationId) {
      router.push('/');
    }
  }, [user, loading, organizationId, router]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Don't render if user is not authenticated or already has org
  if (!user || organizationId) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: { xs: 2, md: 3 },
      }}
    >
      <Paper
        background={1}
        sx={{
          p: { xs: 3, md: 5 },
          maxWidth: 600,
          width: 1,
        }}
      >
        <Stack spacing={3}>
          {/* Header */}
          <Stack spacing={1}>
            <Typography variant="h4" component="h1">
              Welcome to PierceDesk!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Get started by creating or joining an organization
            </Typography>
          </Stack>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="Organization setup tabs"
            >
              <Tab label="Create Organization" {...a11yProps(0)} />
              <Tab label="Join with Code" {...a11yProps(1)} />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <TabPanel value={activeTab} index={0}>
            <CreateOrganizationForm />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <JoinOrganizationForm />
          </TabPanel>
        </Stack>
      </Paper>
    </Box>
  );
};

export default OrganizationSetupPage;
