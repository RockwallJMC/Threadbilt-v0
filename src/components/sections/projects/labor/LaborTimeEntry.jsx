'use client';

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Stack,
  Chip,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { Add as AddIcon, Save as SaveIcon } from '@mui/icons-material';
import { useState } from 'react';
import dayjs from 'dayjs';

const LaborTimeEntry = ({ project }) => {
  const [timeEntry, setTimeEntry] = useState({
    date: dayjs(),
    startTime: dayjs().hour(9).minute(0),
    endTime: dayjs().hour(17).minute(0),
    task: '',
    description: '',
    billable: true,
    employee: '',
    hourlyRate: 0
  });

  const [showSuccess, setShowSuccess] = useState(false);

  // Mock data for tasks and employees
  const tasks = [
    { id: 1, name: 'Planning & Analysis', phase: 'Phase 1' },
    { id: 2, name: 'Development', phase: 'Phase 2' },
    { id: 3, name: 'Testing & Deployment', phase: 'Phase 3' }
  ];

  const employees = [
    { id: 1, name: 'John Smith', role: 'Senior Developer', rate: 85 },
    { id: 2, name: 'Sarah Johnson', role: 'UI/UX Designer', rate: 75 },
    { id: 3, name: 'Mike Davis', role: 'Project Manager', rate: 95 }
  ];

  const calculateHours = () => {
    if (timeEntry.startTime && timeEntry.endTime) {
      const start = dayjs(timeEntry.startTime);
      const end = dayjs(timeEntry.endTime);
      const diff = end.diff(start, 'hour', true);
      return Math.max(0, diff);
    }
    return 0;
  };

  const calculateCost = () => {
    const hours = calculateHours();
    return hours * timeEntry.hourlyRate;
  };

  const handleEmployeeChange = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    setTimeEntry(prev => ({
      ...prev,
      employee: employeeId,
      hourlyRate: employee ? employee.rate : 0
    }));
  };

  const handleSubmit = () => {
    // In a real app, this would submit to the backend
    console.log('Time entry submitted:', {
      ...timeEntry,
      hours: calculateHours(),
      totalCost: calculateCost()
    });
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    
    // Reset form
    setTimeEntry({
      date: dayjs(),
      startTime: dayjs().hour(9).minute(0),
      endTime: dayjs().hour(17).minute(0),
      task: '',
      description: '',
      billable: true,
      employee: '',
      hourlyRate: 0
    });
  };

  const hours = calculateHours();
  const totalCost = calculateCost();

  return (
    <Grid container spacing={3}>
      {showSuccess && (
        <Grid size={12}>
          <Alert severity="success">
            Time entry saved successfully! {hours.toFixed(2)} hours logged.
          </Alert>
        </Grid>
      )}

      <Grid size={{ xs: 12, md: 8 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Log Time Entry
            </Typography>
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Date"
                  value={timeEntry.date}
                  onChange={(newValue) => setTimeEntry(prev => ({ ...prev, date: newValue }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Employee</InputLabel>
                  <Select
                    value={timeEntry.employee}
                    label="Employee"
                    onChange={(e) => handleEmployeeChange(e.target.value)}
                  >
                    {employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {employee.name} - {employee.role}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TimePicker
                  label="Start Time"
                  value={timeEntry.startTime}
                  onChange={(newValue) => setTimeEntry(prev => ({ ...prev, startTime: newValue }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TimePicker
                  label="End Time"
                  value={timeEntry.endTime}
                  onChange={(newValue) => setTimeEntry(prev => ({ ...prev, endTime: newValue }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid size={12}>
                <FormControl fullWidth>
                  <InputLabel>Task</InputLabel>
                  <Select
                    value={timeEntry.task}
                    label="Task"
                    onChange={(e) => setTimeEntry(prev => ({ ...prev, task: e.target.value }))}
                  >
                    {tasks.map((task) => (
                      <MenuItem key={task.id} value={task.id}>
                        {task.name} ({task.phase})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Description"
                  multiline
                  rows={3}
                  fullWidth
                  value={timeEntry.description}
                  onChange={(e) => setTimeEntry(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the work performed..."
                />
              </Grid>
              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={timeEntry.billable}
                      onChange={(e) => setTimeEntry(prev => ({ ...prev, billable: e.target.checked }))}
                    />
                  }
                  label="Billable Hours"
                />
              </Grid>
              <Grid size={12}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="outlined">
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                    disabled={!timeEntry.employee || !timeEntry.task}
                  >
                    Save Time Entry
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Entry Summary
            </Typography>
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Hours
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {hours.toFixed(2)}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Hourly Rate
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 500 }}>
                  ${timeEntry.hourlyRate}/hr
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Cost
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 500, color: 'success.main' }}>
                  ${totalCost.toFixed(2)}
                </Typography>
              </Box>
              
              <Box>
                <Chip
                  label={timeEntry.billable ? 'Billable' : 'Non-Billable'}
                  color={timeEntry.billable ? 'success' : 'default'}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default LaborTimeEntry;
