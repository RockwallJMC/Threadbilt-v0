'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import * as yup from 'yup';
import { useCreateOrganization } from '@/services/swr/api-hooks/useOrganizationApi';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const schema = yup
  .object({
    name: yup
      .string()
      .trim()
      .required('Organization name is required')
      .min(3, 'Organization name must be at least 3 characters')
      .max(50, 'Organization name must be at most 50 characters'),
  })
  .required();

const CreateOrganizationForm = () => {
  const { trigger, isMutating } = useCreateOrganization();
  const { setOrganization } = useSupabaseAuth();
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setSubmitError(null);
      const orgId = await trigger({ name: data.name });
      await setOrganization(orgId);
      // Redirect is handled by SupabaseAuthProvider
    } catch (error) {
      setSubmitError(error.message || 'Failed to create organization');
    }
  };

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {submitError && (
          <Alert severity="error" onClose={() => setSubmitError(null)}>
            {submitError}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary">
          Create a new organization to get started with PierceDesk.
        </Typography>

        <Grid container>
          <Grid size={12}>
            <TextField
              fullWidth
              size="large"
              id="organization-name"
              type="text"
              label="Organization Name"
              placeholder="My Company"
              error={!!errors.name}
              helperText={<>{errors.name?.message}</>}
              {...register('name')}
            />
          </Grid>
        </Grid>

        <Button
          fullWidth
          type="submit"
          size="large"
          variant="contained"
          loading={isSubmitting || isMutating}
          disabled={isSubmitting || isMutating}
        >
          Create Organization
        </Button>
      </Stack>
    </Box>
  );
};

export default CreateOrganizationForm;
