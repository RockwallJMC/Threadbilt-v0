'use client';

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Avatar
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from 'react';
import dayjs from 'dayjs';

const LaborTimesheet = ({ project }) => {
  const [selectedWeek, setSelectedWeek] = useState(dayjs());
  const [selectedEmployee, setSelectedEmployee] = useState('all');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Mock timesheet data
  const timesheetData = [
    {
      id: 1,
      date: '2024-01-22',
      employee: { id: 1, name: 'John Smith', avatar: '/avatars/john.jpg' },
      task: 'Development',
      startTime: '09:00',
      endTime: '17:00',
      hours: 8.0,
      billable: true,
      hourlyRate: 85,
      totalCost: 680,
      description: 'Implemented user authentication module',
      status: 'approved'
    },
    {
      id: 2,
      date: '2024-01-22',
      employee: { id: 2, name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg' },
      task: 'Design',
      startTime: '09:30',
      endTime: '16:30',
      hours: 7.0,
      billable: true,
      hourlyRate: 75,
      totalCost: 525,
      description: 'Created wireframes for dashboard',
      status: 'pending'
    },
    {
      id: 3,
      date: '2024-01-23',
      employee: { id: 1, name: 'John Smith', avatar: '/avatars/john.jpg' },
      task: 'Development',
      startTime: '08:30',
      endTime: '17:30',
      hours: 9.0,
      billable: true,
      hourlyRate: 85,
      totalCost: 765,
      description: 'Bug fixes and code review',
      status: 'approved'
    }
  ];

  const employees = [
    { id: 'all', name: 'All Employees' },
    { id: 1, name: 'John Smith' },
    { id: 2, name: 'Sarah Johnson' },
    { id: 3, name: 'Mike Davis' }
  ];

  const filteredData = selectedEmployee === 'all' 
    ? timesheetData 
    : timesheetData.filter(entry => entry.employee.id === selectedEmployee);

  const totalHours = filteredData.reduce((sum, entry) => sum + entry.hours, 0);
  const totalCost = filteredData.reduce((sum, entry) => sum + entry.totalCost, 0);
  const billableHours = filteredData.filter(entry => entry.billable).reduce((sum, entry) => sum + entry.hours, 0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Controls */}
      <Grid size={12}>
        <Stack direction="row" spacing={2} alignItems="center">
          <DatePicker
            label="Week Starting"
            value={selectedWeek}
            onChange={(newValue) => setSelectedWeek(newValue)}
            slotProps={{ textField: { size: 'small' } }}
          />
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Employee</InputLabel>
            <Select
              value={selectedEmployee}
              label="Employee"
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Grid>

      {/* Summary Cards */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {totalHours.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Hours
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
              {billableHours.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Billable Hours
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
              {formatCurrency(totalCost)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Cost
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      {/* Timesheet Table */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Time Entries
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Task</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell align="right">Hours</TableCell>
                    <TableCell align="right">Rate</TableCell>
                    <TableCell align="right">Cost</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar src={entry.employee.avatar} sx={{ width: 32, height: 32 }}>
                            {entry.employee.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2">
                            {entry.employee.name}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.task}</TableCell>
                      <TableCell>
                        {entry.startTime} - {entry.endTime}
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontWeight: 500 }}>
                          {entry.hours.toFixed(1)}h
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        ${entry.hourlyRate}/hr
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontWeight: 500 }}>
                          {formatCurrency(entry.totalCost)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={entry.status}
                          color={getStatusColor(entry.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default LaborTimesheet;
