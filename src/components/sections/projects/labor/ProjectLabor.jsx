'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography
} from '@mui/material';
import LaborTimeEntry from './LaborTimeEntry';
import LaborTimesheet from './LaborTimesheet';
import LaborSummary from './LaborSummary';

const ProjectLabor = ({ project }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabs = [
    { label: 'Time Entry', component: <LaborTimeEntry project={project} /> },
    { label: 'Timesheet', component: <LaborTimesheet project={project} /> },
    { label: 'Summary', component: <LaborSummary project={project} /> }
  ];

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Box>
      
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {tabs[activeTab]?.component}
      </Box>
    </Paper>
  );
};

export default ProjectLabor;
