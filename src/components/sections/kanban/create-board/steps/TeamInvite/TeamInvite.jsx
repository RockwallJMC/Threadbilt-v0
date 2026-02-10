'use client';

import { useState } from 'react';
import { TabContext, TabList } from '@mui/lab';
import { Box, CircularProgress, Tab, Typography } from '@mui/material';
import { useOrganizationMembers } from 'services/swr/api-hooks/useOrganizationMembersApi';
import CurrentTeamTabPanel from 'components/sections/kanban/create-board/steps/TeamInvite/CurrentTeamTabPanel';
import NewTeamTabPanel from 'components/sections/kanban/create-board/steps/TeamInvite/NewTeamTabPanel';

const TeamInvite = () => {
  const [currentTab, setCurrentTab] = useState('current');

  // Fetch all organization members for team selection
  const { data: orgMembers, isLoading, error } = useOrganizationMembers();

  const handleChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error">
        Failed to load organization members: {error.message}
      </Typography>
    );
  }

  return (
    <TabContext value={currentTab}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList onChange={handleChange} aria-label="team management tab panel">
          <Tab label="Import from Organization" value="current" />
          <Tab label="Add Team Members" value="new" />
        </TabList>
      </Box>
      <CurrentTeamTabPanel value="current" orgMembers={orgMembers} />
      <NewTeamTabPanel value="new" options={orgMembers || []} />
    </TabContext>
  );
};

export default TeamInvite;
