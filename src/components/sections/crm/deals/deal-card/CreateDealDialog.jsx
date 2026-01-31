'use client';

import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  FilledInput,
  Avatar,
  Autocomplete,
  Box,
  Button,
  Chip,
  FormHelperText,
  InputAdornment,
  inputBaseClasses,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  dialogClasses,
  Alert,
  Snackbar,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { companies } from 'data/crm/deals';
import { users } from 'data/users';
import dayjs from 'dayjs';
import { useDealsContext } from 'providers/DealsProvider';
import { ADD_NEW_DEAL, SET_CREATE_DEAL_DIALOG } from 'reducers/DealsReducer';
import * as yup from 'yup';
import IconifyIcon from 'components/base/IconifyIcon';
import { useContacts } from '@/services/swr/api-hooks/useCRMContactApi';
import { useCreateDeal } from '@/services/swr/api-hooks/useCRMDealsApi';
import { mutate } from 'swr';

const validationSchema = yup.object().shape({
  name: yup.string().required('Deal name is required'),
  stage: yup.string().required('Stage is required'),
  amount: yup.number().typeError('Amount must be a number').required('Amount is required'),
  lastUpdate: yup.string().required('Last update is required'),
  createDate: yup.string().required('Create date is required'),
  closeDate: yup.string().required('Close date is required'),
  owner: yup.object().nullable().required('Owner is required'),
  contact: yup.object().nullable().required('Contact is required'),
  priority: yup.string().required('Priority is required'),
  company: yup.object().nullable().required('Company is required'),
  collaborators: yup.array().of(yup.object()).optional(),
});

const CreateDealDialog = () => {
  const { listItems, createDealDialog, dealsDispatch } = useDealsContext();
  const listTitle = listItems.find((list) => list.id === createDealDialog.listId)?.title;
  const { data: contacts, isLoading: contactsLoading } = useContacts();
  const { trigger: createDeal, isMutating } = useCreateDeal();
  const [submitError, setSubmitError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const initialData = useMemo(
    () => ({
      name: '',
      description: '',
      pipeline: '',
      stage: listTitle ?? '',
      amount: 0,
      contact: null,
      createDate: dayjs().toString(),
      lastUpdate: dayjs().toString(),
      closeDate: dayjs().toString(),
      priority: '',
      progress: 0,
      company: null,
      owner: null,
      collaborators: [],
    }),
    [listTitle],
  );

  const methods = useForm({
    defaultValues: initialData,
    resolver: yupResolver(validationSchema),
  });

  const { handleSubmit, control, reset, setValue, setError, formState: { errors } } = methods;

  useEffect(() => {
    reset(initialData);
  }, [createDealDialog, methods]);

  const onSubmit = async (data) => {
    try {
      setSubmitError(null);

      // Transform form data to API format
      const dealPayload = {
        name: data.name,
        description: data.description || null,
        stage: data.stage,
        company_id: data.company?.id,
        contact_id: data.contact?.id,
        amount: Number(data.amount),
        priority: data.priority,
        progress: 0,
        close_date: dayjs(data.closeDate).toISOString(),
      };

      // Call API
      const newDeal = await createDeal(dealPayload);

      // Optimistic update - add to local state
      dealsDispatch({
        type: 'ADD_NEW_DEAL',
        payload: {
          listId: data.stage,
          deal: {
            ...newDeal,
            client: {
              name: `${data.contact?.first_name || ''} ${data.contact?.last_name || ''}`.trim(),
              email: data.contact?.email || '',
              phone: data.contact?.phone || '',
            },
          },
        },
      });

      // Revalidate deals list from server
      mutate('/api/crm/deals');

      // Show success toast
      setSnackbar({
        open: true,
        message: 'Deal created successfully!',
        severity: 'success',
      });

      // Close modal and reset form
      dealsDispatch({
        type: 'SET_CREATE_DEAL_DIALOG',
        payload: { listId: null },
      });
      reset();

    } catch (error) {
      console.error('Error creating deal:', error);

      // Handle duplicate name error
      if (error.response?.data?.code === 'DUPLICATE_DEAL_NAME') {
        setError('name', {
          type: 'manual',
          message: 'A deal with this name already exists',
        });
      } else {
        // Generic error
        setSubmitError(error.response?.data?.error || 'Failed to create deal. Please try again.');
      }
    }
  };

  const handleClose = () => {
    if (!isMutating) {
      reset();
      setSubmitError(null);
      dealsDispatch({
        type: 'SET_CREATE_DEAL_DIALOG',
        payload: { listId: null },
      });
    }
  };

  return (
    <Dialog
      open={createDealDialog.isOpen}
      onClose={isMutating ? undefined : handleClose}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        [`& .${dialogClasses.paper}`]: {
          p: 0,
          borderRadius: 6,
          width: 1,
          maxWidth: 600,
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
        <DialogTitle id="dialog-title" sx={{ p: 0, typography: 'h6' }}>
          Create Deal
        </DialogTitle>
        <Button
          shape="square"
          variant="text"
          size="small"
          color="neutral"
          onClick={handleClose}
          disabled={isMutating}
        >
          <IconifyIcon
            icon="material-symbols:close-rounded"
            sx={{ color: 'text.primary', fontSize: 20 }}
          />
        </Button>
      </Stack>

      {submitError && (
        <Alert severity="error" sx={{ mx: 3, mt: 2 }} onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      <DialogContent sx={{ px: 3, py: 1 }}>
        <Grid container spacing={1}>
          <Grid size={12}>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  id="deal-name"
                  label="Deal name"
                  variant="filled"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  disabled={isMutating}
                />
              )}
            />
          </Grid>

          <Grid size={12} sx={{ mb: 1 }}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="deal-description"
                  label="Deal description"
                  variant="filled"
                  size="small"
                  rows={3}
                  multiline
                  fullWidth
                  sx={{ [`& .${inputBaseClasses.root}`]: { borderRadius: 2 } }}
                  disabled={isMutating}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ mb: 1 }}>
            <Controller
              name="pipeline"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth disabled={isMutating}>
                  <InputLabel>Pipeline</InputLabel>
                  <Select {...field} label="Pipeline">
                    <MenuItem value="Sales Pipeline">Sales Pipeline</MenuItem>
                    <MenuItem value="Marketing Pipeline">Marketing Pipeline</MenuItem>
                    <MenuItem value="Development Pipeline">Development Pipeline</MenuItem>
                    <MenuItem value="Support Pipeline">Support Pipeline</MenuItem>
                    <MenuItem value="Operations Pipeline">Operations Pipeline</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ mb: 1 }}>
            <Controller
              name="stage"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl fullWidth disabled={isMutating}>
                  <InputLabel id="stage-select-label" error={!!fieldState.error}>
                    Stage
                  </InputLabel>
                  <Select {...field} error={!!fieldState.error} label="stage">
                    {listItems.map((list) => (
                      <MenuItem key={list.id} value={list.title}>
                        {list.title}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText error>{fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ mb: 1 }}>
            <Controller
              name="amount"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl variant="filled" fullWidth disabled={isMutating}>
                  <InputLabel htmlFor="deal-amount" error={!!fieldState.error}>
                    Amount
                  </InputLabel>
                  <FilledInput
                    {...field}
                    id="deal-amount"
                    error={!!fieldState.error}
                    type="number"
                    startAdornment={
                      <InputAdornment position="start">
                        <IconifyIcon
                          icon="material-symbols:attach-money-rounded"
                          color="text.secondary"
                        />
                      </InputAdornment>
                    }
                  />
                  <FormHelperText error>{fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={6} sx={{ mb: 1, display: { xs: 'none', sm: 'flex' } }} />

          <Grid size={6} sx={{ mb: 1 }}>
            <Controller
              name="createDate"
              control={control}
              render={({ field: { onChange } }) => (
                <DatePicker
                  label="Create Date"
                  format="DD MMM, YYYY"
                  defaultValue={dayjs()}
                  onChange={(date) => {
                    onChange(date);
                  }}
                  disabled={isMutating}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                    inputAdornment: {
                      position: 'start',
                    },
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={6} sx={{ mb: 1 }}>
            <Controller
              name="closeDate"
              control={control}
              render={({ field: { onChange } }) => (
                <DatePicker
                  label="Close Date"
                  format="DD MMM, YYYY"
                  defaultValue={dayjs()}
                  onChange={(date) => {
                    onChange(date);
                  }}
                  disabled={isMutating}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                    inputAdornment: {
                      position: 'start',
                    },
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ mb: 1 }}>
            <Controller
              name="owner"
              control={control}
              render={({ field: { value, onChange }, fieldState }) => (
                <FormControl fullWidth disabled={isMutating}>
                  <InputLabel id="deal-owner-label" error={!!fieldState.error}>
                    Deal owner
                  </InputLabel>
                  <Select
                    value={value?.name || ''}
                    error={!!fieldState.error}
                    onChange={(event) => {
                      const selectedUser = users.find((user) => user.name === event.target.value);
                      onChange(selectedUser);
                    }}
                    label="deal-owner"
                  >
                    {users.slice(0, 10).map((user) => (
                      <MenuItem key={user.id} value={user.name}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText error>{fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ mb: 4 }}>
            <Controller
              name="priority"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl fullWidth disabled={isMutating}>
                  <InputLabel id="priority-select-label" error={!!fieldState.error}>
                    Priority
                  </InputLabel>
                  <Select {...field} error={!!fieldState.error} label="priority">
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                  <FormHelperText error>{fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={12}>
            <Controller
              name="company"
              control={control}
              render={({ field: { value, onChange }, fieldState }) => (
                <FormControl fullWidth disabled={isMutating}>
                  <InputLabel id="company-label" error={!!fieldState.error}>
                    Associate deal with
                  </InputLabel>
                  <Select
                    label="company"
                    value={value?.name || ''}
                    error={!!fieldState.error}
                    onChange={(event) => {
                      const company = companies.find((item) => item.name === event.target.value);
                      onChange(company);
                    }}
                  >
                    {companies.map((item) => (
                      <MenuItem key={item.id} value={item.name}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText error>{fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={12}>
            <Controller
              name="contact"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Autocomplete
                  {...field}
                  options={contacts || []}
                  loading={contactsLoading}
                  disabled={isMutating}
                  getOptionLabel={(option) =>
                    option.first_name && option.last_name
                      ? `${option.first_name} ${option.last_name}`
                      : option.first_name || option.last_name || ''
                  }
                  isOptionEqualToValue={(option, value) => option.id === value?.id}
                  onChange={(event, newValue) => {
                    field.onChange(newValue);
                    // Auto-populate company when contact selected
                    if (newValue?.account) {
                      setValue('company', newValue.account);
                    }
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body2">
                          {option.first_name} {option.last_name}
                        </Typography>
                        {option.email && (
                          <Typography variant="caption" color="text.secondary">
                            {option.email}
                          </Typography>
                        )}
                        {option.account?.name && (
                          <Typography variant="caption" color="text.secondary">
                            {' • '}{option.account.name}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Contact"
                      placeholder="Select contact"
                      error={!!error}
                      helperText={error?.message}
                      required
                    />
                  )}
                />
              )}
            />
          </Grid>

          <Grid size={12}>
            <Controller
              name="collaborators"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  multiple
                  id="users-autocomplete"
                  options={users}
                  disabled={isMutating}
                  getOptionLabel={(option) => option.name}
                  popupIcon={null}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  clearIcon={null}
                  sx={{ width: 1 }}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  renderTags={(selectedOptions, getTagProps) =>
                    selectedOptions.map((option, index) => (
                      <Chip
                        label={option.name}
                        avatar={<Avatar src={option.avatar} />}
                        {...getTagProps({ index })}
                        key={option.id}
                      />
                    ))
                  }
                  renderOption={(props, option) => {
                    const { key, ...optionProps } = props;

                    return (
                      <Stack
                        gap={1}
                        key={key}
                        component="li"
                        sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
                        {...optionProps}
                      >
                        <Avatar src={option.avatar} sx={{ width: 24, height: 24 }} />
                        <Typography sx={{ lineClamp: 1 }}>{option.name}</Typography>
                      </Stack>
                    );
                  }}
                  renderInput={(params) => <TextField {...params} label="Collaborators" />}
                />
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
        <Button variant="soft" color="neutral" onClick={handleClose} disabled={isMutating}>
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          variant="contained"
          loading={isMutating}
          disabled={isMutating}
          autoFocus
        >
          {isMutating ? 'Creating...' : 'Create'}
        </LoadingButton>
      </DialogActions>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default CreateDealDialog;
