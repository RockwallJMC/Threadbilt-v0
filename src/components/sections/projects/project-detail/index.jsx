'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useState } from 'react';
import { projectsData } from 'data/projects/dashboard';
import ProjectDetailHeader from './ProjectDetailHeader';
import ProjectSidebar from './ProjectSidebar';
import ProjectOverview from './ProjectOverview';
import ProjectTasks from './ProjectTasks';
import ProjectBudget from './ProjectBudget';
import ProjectTeam from './ProjectTeam';

const ProjectDetail = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  // Find project by ID (in real app, this would be an API call)
  const project = projectsData.find(p => p.id === parseInt(projectId)) || projectsData[0];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabs = [
    { label: 'Overview', component: <ProjectOverview project={project} /> },
    { label: 'Tasks', component: <ProjectTasks project={project} /> },
    { label: 'Budget', component: <ProjectBudget project={project} /> },
    { label: 'Labor', component: <div>Labor tracking coming soon...</div> },
    { label: 'Materials', component: <div>Materials tracking coming soon...</div> },
    { label: 'Billing', component: <div>Billing information coming soon...</div> },
    { label: 'Team', component: <ProjectTeam project={project} /> },
  ];

  return (
    <Paper sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ProjectDetailHeader project={project} />
      
      <Grid container sx={{ flex: 1, overflow: 'hidden' }}>
        {/* Main Content */}
        <Grid size={{ xs: 12, lg: 9 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              {tabs.map((tab, index) => (
                <Tab key={index} label={tab.label} />
              ))}
            </Tabs>
          </Box>
          
          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
            {tabs[activeTab]?.component}
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid 
          size={{ xs: 12, lg: 3 }} 
          sx={{ 
            borderLeft: { lg: 1 }, 
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <ProjectSidebar project={project} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProjectDetail;
