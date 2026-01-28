'use client';

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  dialogClasses,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import * as yup from 'yup';
import accounts from 'data/crm/accounts';
import { useLinkContactToAccount } from 'services/swr/api-hooks/useContactApi';
import IconifyIcon from 'components/base/IconifyIcon';

const linkAccountSchema = yup.object().shape({
  accountId: yup.string().required('Account is required'),
  role: yup.string().required('Role is required'),
});

const ROLE_OPTIONS = [
  'Decision Maker',
  'Primary Contact',
  'Technical Contact',
  'Influencer',
  'User',
];

const LinkAccountModal = ({ open, onClose, contactId, contactName }) => {
  const { trigger: linkContact, isMutating } = useLinkContactToAccount();

  const initialData = {
    accountId: '',
    role: 'Primary Contact', // Default role
  };

  const methods = useForm({
    defaultValues: initialData,
    resolver: yupResolver(linkAccountSchema),
  });

  const { handleSubmit, control, reset } = methods;

  useEffect(() => {
    reset(initialData);
  }, [open]);

  const onSubmit = async (data) => {
    try {
      await linkContact({
        contactId,
        accountId: data.accountId,
        role: data.role,
      });

      enqueueSnackbar('Contact linked to account successfully', {
        variant: 'success',
      });

      reset();
      onClose();
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to link contact to account', {
        variant: 'error',
      });
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      aria-labelledby="link-account-dialog-title"
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        [`& .${dialogClasses.paper}`]: {
          p: 0,
          borderRadius: 6,
          width: 1,
          maxWidth: 500,
        },
      }}
    >
      <Stack
        sx={{
          p: 3,
          pb: 2,
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <DialogTitle id="link-account-dialog-title" sx={{ p: 0, typography: 'h6' }}>
          Link Contact to Account
        </DialogTitle>
        <Button
          shape="square"
          variant="text"
          size="small"
          color="neutral"
          onClick={handleCancel}
        >
          <IconifyIcon
            icon="material-symbols:close-rounded"
            sx={{ color: 'text.primary', fontSize: 20 }}
          />
        </Button>
      </Stack>

      <DialogContent sx={{ px: 3, py: 1 }}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <Controller
              name="accountId"
              control={control}
              render={({ field: { value, onChange }, fieldState }) => (
                <Autocomplete
                  id="account-autocomplete"
                  options={accounts}
                  getOptionLabel={(option) => option.name}
                  value={accounts.find((acc) => acc.id === value) || null}
                  onChange={(_, newValue) => {
                    onChange(newValue?.id || '');
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Account"
                      variant="filled"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      required
                    />
                  )}
                />
              )}
            />
          </Grid>

          <Grid size={12}>
            <Controller
              name="role"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl fullWidth variant="filled">
                  <InputLabel id="role-select-label" error={!!fieldState.error} required>
                    Role
                  </InputLabel>
                  <Select {...field} error={!!fieldState.error} label="Role" labelId="role-select-label">
                    {ROLE_OPTIONS.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText error>{fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          pt: 2,
          position: 'sticky',
          bottom: 0,
          zIndex: 1000,
        }}
      >
        <Button variant="soft" color="neutral" onClick={handleCancel} disabled={isMutating}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" autoFocus disabled={isMutating}>
          {isMutating ? 'Linking...' : 'Link Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LinkAccountModal;
