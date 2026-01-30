'use client';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { users } from 'data/users';
import IconifyIcon from 'components/base/IconifyIcon';

const OpportunityConvertToProject = ({ open, onClose, opportunity }) => {
  const [formData, setFormData] = useState({
    name: opportunity?.name || '',
    description: opportunity?.description || '',
    budget: opportunity?.value || 0,
    projectManager: '',
    priority: 'medium',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleConvert = () => {
    // TODO: Implement actual conversion logic
    const projectData = {
      ...formData,
      opportunityId: opportunity?.id,
      client: opportunity?.account || 'Unknown Client',
      status: 'active',
    };
    
    console.log('Converting opportunity to project:', projectData);
    
    // In a real implementation, this would:
    // 1. Create the project in the database
    // 2. Link it to the opportunity
    // 3. Update opportunity status to "Closed Won"
    // 4. Navigate to the new project
    
    onClose();
  };

  if (!opportunity) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconifyIcon icon="material-symbols:transform" />
          Convert Opportunity to Project
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Convert "{opportunity.name}" into a project. The opportunity data will be carried over and linked to the new project.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Project Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              required
            />
          </Grid>
          
          <Grid size={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleInputChange('description')}
              multiline
              rows={3}
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Budget"
              type="number"
              value={formData.budget}
              onChange={handleInputChange('budget')}
              InputProps={{
                startAdornment: '$',
              }}
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={handleInputChange('priority')}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange('startDate')}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={handleInputChange('endDate')}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid size={12}>
            <FormControl fullWidth>
              <InputLabel>Project Manager</InputLabel>
              <Select
                value={formData.projectManager}
                onChange={handleInputChange('projectManager')}
                label="Project Manager"
              >
                {users.slice(0, 10).map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              <strong>Source Opportunity:</strong> {opportunity.name}<br />
              <strong>Account:</strong> {opportunity.account || 'N/A'}<br />
              <strong>Value:</strong> ${opportunity.value?.toLocaleString() || '0'}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleConvert} 
          variant="contained"
          disabled={!formData.name || !formData.projectManager}
        >
          Convert to Project
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OpportunityConvertToProject;
