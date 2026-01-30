'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import AIABillingPeriods from './AIABillingPeriods';
import CreateAIABilling from './CreateAIABilling';

const ProjectAIABilling = ({ project }) => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'detail'
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);

  const handleCreateNew = () => {
    setCurrentView('create');
  };

  const handleViewDetails = (periodId) => {
    setSelectedPeriodId(periodId);
    setCurrentView('detail');
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedPeriodId(null);
  };

  const handleSave = (billingData) => {
    // In a real app, this would save to the backend
    console.log('Saving billing data:', billingData);
    setCurrentView('list');
  };

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3 }}>
        {currentView === 'list' && (
          <AIABillingPeriods project={project} onCreateNew={handleCreateNew} onViewDetails={handleViewDetails} />
        )}
        {currentView === 'create' && (
          <CreateAIABilling project={project} onSave={handleSave} onCancel={handleBack} />
        )}
      </Box>
    </Paper>
  );
};

export default ProjectAIABilling;
