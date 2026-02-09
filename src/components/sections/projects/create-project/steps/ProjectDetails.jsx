'use client';

import { Controller, useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import * as yup from 'yup';
import { priorityOptions } from 'data/projects/createProject';

export const projectDetailsSchema = yup.object().shape({
  name: yup.string().required('Project name is required'),
  description: yup.string(),
  budget: yup.number().nullable().transform((value, originalValue) =>
    originalValue === '' ? null : value
  ),
  priority: yup.string().oneOf(['low', 'medium', 'high']).required('Priority is required'),
});

const ProjectDetails = () => {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext();

  return (
    <Stack direction="column" spacing={3}>
      <TextField
        fullWidth
        id="name"
        label="Project Name"
        variant="filled"
        error={!!errors.name}
        helperText={errors.name?.message}
        {...register('name')}
      />

      <TextField
        fullWidth
        label={<Typography variant="subtitle2">Description (Optional)</Typography>}
        variant="filled"
        multiline
        minRows={3}
        maxRows={6}
        error={!!errors.description}
        helperText={errors.description?.message}
        {...register('description')}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
        <TextField
          fullWidth
          id="budget"
          label="Budget (Optional)"
          variant="filled"
          type="number"
          error={!!errors.budget}
          helperText={errors.budget?.message}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            },
          }}
          {...register('budget')}
        />

        <FormControl fullWidth variant="filled" error={!!errors.priority}>
          <InputLabel id="priority-label">Priority</InputLabel>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select
                labelId="priority-label"
                inputProps={{ 'aria-label': 'Priority' }}
                {...field}
              >
                {priorityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {errors.priority && <FormHelperText>{errors.priority?.message}</FormHelperText>}
        </FormControl>
      </Stack>
    </Stack>
  );
};

export default ProjectDetails;
