'use client';

import { Controller, useFormContext } from 'react-hook-form';
import {
  Avatar,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import * as yup from 'yup';
import { useOrganizationManagers } from 'services/swr/api-hooks/useOrganizationMembersApi';

export const scheduleTeamSchema = yup.object().shape({
  startDate: yup.string().required('Start date is required'),
  endDate: yup.string(),
  projectManager: yup.string().required('Project manager is required'),
});

const ScheduleTeam = () => {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext();

  // Fetch eligible project managers (owner, admin, manager roles)
  const { data: managers, isLoading, error } = useOrganizationManagers();

  return (
    <Stack direction="column" spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
        <TextField
          fullWidth
          id="startDate"
          label="Start Date"
          variant="filled"
          type="date"
          error={!!errors.startDate}
          helperText={errors.startDate?.message}
          slotProps={{
            inputLabel: { shrink: true },
          }}
          {...register('startDate')}
        />

        <TextField
          fullWidth
          id="endDate"
          label="End Date (Optional)"
          variant="filled"
          type="date"
          error={!!errors.endDate}
          helperText={errors.endDate?.message}
          slotProps={{
            inputLabel: { shrink: true },
          }}
          {...register('endDate')}
        />
      </Stack>

      <FormControl fullWidth variant="filled" error={!!errors.projectManager}>
        <InputLabel id="project-manager-label">Project Manager</InputLabel>
        <Controller
          name="projectManager"
          control={control}
          render={({ field }) => (
            <Select
              labelId="project-manager-label"
              inputProps={{ 'aria-label': 'Project Manager' }}
              disabled={isLoading}
              {...field}
            >
              {isLoading && (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading managers...
                </MenuItem>
              )}
              {error && (
                <MenuItem disabled>Failed to load managers</MenuItem>
              )}
              {managers?.map((manager) => (
                <MenuItem key={manager.id} value={manager.id}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar
                      src={manager.avatar}
                      sx={{ width: 24, height: 24 }}
                    >
                      {manager.name?.[0]}
                    </Avatar>
                    <span>{manager.name}</span>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          )}
        />
        {errors.projectManager && <FormHelperText>{errors.projectManager?.message}</FormHelperText>}
      </FormControl>
    </Stack>
  );
};

export default ScheduleTeam;
