'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useSnackbar } from 'notistack';
import * as yup from 'yup';
import { useCreateLead } from 'services/swr/api-hooks/useLeadApi';
import ControlledSelect from 'components/sections/crm/add-contact/ControlledSelect';

// Validation schema
const addLeadSchema = yup.object({
  name: yup.string().required('Name is required'),
  company: yup.string().required('Company is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup
    .string()
    .notRequired()
    .test('phone-format', 'Invalid phone format', (value) => {
      if (!value) return true; // Optional field
      // Basic phone validation (10+ digits, allows spaces, dashes, parentheses, + prefix)
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,5}[-\s.]?[0-9]{1,5}$/;
      return phoneRegex.test(value.replace(/\s/g, ''));
    }),
  source: yup
    .string()
    .oneOf(['website', 'referral', 'event', 'cold_call', 'social_media', 'other'])
    .required('Source is required'),
  notes: yup.string().notRequired(),
});

const sourceOptions = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'event', label: 'Event' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'other', label: 'Other' },
];

const AddLeadForm = ({ onSuccess, onCancel }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { trigger: createLead, isMutating } = useCreateLead();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(addLeadSchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
      source: '',
      notes: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      // Create lead with status 'new' by default
      const newLead = await createLead({
        ...data,
        status: 'new',
      });

      enqueueSnackbar('Lead created successfully', { variant: 'success' });
      reset(); // Reset form after successful creation

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(newLead);
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      enqueueSnackbar(error.message || 'Failed to create lead', { variant: 'error' });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: 1 }}>
      <Stack spacing={3}>
        {/* Name and Company Row */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={
                <Typography variant="subtitle2" fontWeight={400}>
                  Name
                  <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                    *
                  </Box>
                </Typography>
              }
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={isMutating}
              {...register('name')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={
                <Typography variant="subtitle2" fontWeight={400}>
                  Company
                  <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                    *
                  </Box>
                </Typography>
              }
              error={!!errors.company}
              helperText={errors.company?.message}
              disabled={isMutating}
              {...register('company')}
            />
          </Grid>
        </Grid>

        {/* Email and Phone Row */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="email"
              label={
                <Typography variant="subtitle2" fontWeight={400}>
                  Email
                  <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                    *
                  </Box>
                </Typography>
              }
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isMutating}
              {...register('email')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={
                <Typography variant="subtitle2" fontWeight={400}>
                  Phone
                  <Box component="span" sx={{ color: 'text.disabled', ml: 0.5 }}>
                    (optional)
                  </Box>
                </Typography>
              }
              error={!!errors.phone}
              helperText={errors.phone?.message}
              disabled={isMutating}
              {...register('phone')}
            />
          </Grid>
        </Grid>

        {/* Source Dropdown */}
        <ControlledSelect
          name="source"
          label={
            <Typography variant="subtitle2" fontWeight={400}>
              Source
              <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                *
              </Box>
            </Typography>
          }
          options={sourceOptions}
          control={control}
          error={errors.source?.message}
        />

        {/* Notes Field */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label={
            <Typography variant="subtitle2" fontWeight={400}>
              Notes
              <Box component="span" sx={{ color: 'text.disabled', ml: 0.5 }}>
                (optional)
              </Box>
            </Typography>
          }
          error={!!errors.notes}
          helperText={errors.notes?.message}
          disabled={isMutating}
          {...register('notes')}
        />

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {onCancel && (
            <Button
              variant="outlined"
              color="neutral"
              onClick={onCancel}
              disabled={isMutating}
              sx={{ px: 4 }}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" variant="contained" disabled={isMutating} sx={{ px: 4 }}>
            {isMutating ? 'Creating...' : 'Create Lead'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default AddLeadForm;
