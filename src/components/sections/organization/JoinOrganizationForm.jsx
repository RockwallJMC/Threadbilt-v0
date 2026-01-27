'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import * as yup from 'yup';
import { useJoinOrganization } from '@/services/swr/api-hooks/useOrganizationApi';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const schema = yup
  .object({
    inviteCode: yup
      .string()
      .trim()
      .required('Invite code is required')
      .matches(/^[a-zA-Z0-9]+$/, 'Invite code must be alphanumeric'),
  })
  .required();

const JoinOrganizationForm = () => {
  const { trigger, isMutating } = useJoinOrganization();
  const { setOrganization } = useSupabaseAuth();
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const parseErrorMessage = (error) => {
    const message = error.message || '';

    if (message.includes('invalid') || message.includes('not found')) {
      return 'Invalid invite code. Please check and try again.';
    }
    if (message.includes('expired')) {
      return 'This invite code has expired. Please request a new one.';
    }
    if (message.includes('already') || message.includes('member')) {
      return "You're already a member of this organization.";
    }

    return 'Failed to join organization. Please try again.';
  };

  const onSubmit = async (data) => {
    try {
      setSubmitError(null);
      const orgId = await trigger({ inviteCode: data.inviteCode });
      await setOrganization(orgId);
      // Redirect is handled by SupabaseAuthProvider
    } catch (error) {
      setSubmitError(parseErrorMessage(error));
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
          Enter the invite code provided by your organization administrator.
        </Typography>

        <Grid container>
          <Grid size={12}>
            <TextField
              fullWidth
              size="large"
              id="invite-code"
              type="text"
              label="Invite Code"
              placeholder="ABC123XYZ"
              error={!!errors.inviteCode}
              helperText={<>{errors.inviteCode?.message}</>}
              {...register('inviteCode')}
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
          Join Organization
        </Button>
      </Stack>
    </Box>
  );
};

export default JoinOrganizationForm;
