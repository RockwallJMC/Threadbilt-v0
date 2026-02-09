'use client';

import { Controller, useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import * as yup from 'yup';
import { users } from 'data/users';

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
              {...field}
            >
              {users.slice(0, 15).map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
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
