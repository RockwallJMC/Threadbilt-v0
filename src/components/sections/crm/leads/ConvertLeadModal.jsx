'use client';

import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FilledInput,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  dialogClasses,
  inputBaseClasses,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { enqueueSnackbar } from 'notistack';
import * as yup from 'yup';
import dayjs from 'dayjs';
import { useConvertLeadToOpportunity } from 'services/swr/api-hooks/useLeadApi';
import IconifyIcon from 'components/base/IconifyIcon';

const convertLeadSchema = yup.object({
  opportunityName: yup.string().required('Opportunity name is required'),
  value: yup
    .number()
    .typeError('Value must be a number')
    .required('Value is required')
    .min(0, 'Value must be positive'),
  stage: yup
    .string()
    .oneOf(['qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])
    .required('Stage is required'),
  expectedCloseDate: yup
    .date()
    .required('Expected close date is required')
    .test('is-future', 'Close date must be in the future', (value) => {
      return !value || new Date(value) > new Date();
    }),
  probability: yup
    .number()
    .typeError('Probability must be a number')
    .required('Probability is required')
    .min(0, 'Probability must be at least 0')
    .max(100, 'Probability must be at most 100'),
  notes: yup.string().notRequired(),
});

// Stage options with auto-calculated probability
const STAGE_OPTIONS = [
  { value: 'qualification', label: 'Qualification', probability: 25 },
  { value: 'proposal', label: 'Proposal', probability: 50 },
  { value: 'negotiation', label: 'Negotiation', probability: 75 },
  { value: 'closed_won', label: 'Closed Won', probability: 100 },
  { value: 'closed_lost', label: 'Closed Lost', probability: 0 },
];

const ConvertLeadModal = ({ open, onClose, lead, onSuccess }) => {
  const { trigger: convertLead, isMutating } = useConvertLeadToOpportunity();

  const initialData = useMemo(
    () => ({
      opportunityName: lead?.company ? `${lead.company} - Opportunity` : '',
      value: 0,
      stage: 'qualification',
      expectedCloseDate: dayjs().add(30, 'days').toString(),
      probability: 25,
      notes: '',
    }),
    [lead],
  );

  const methods = useForm({
    defaultValues: initialData,
    resolver: yupResolver(convertLeadSchema),
  });

  const { handleSubmit, control, reset, setValue, watch } = methods;

  const selectedStage = watch('stage');

  // Auto-update probability when stage changes
  useEffect(() => {
    if (selectedStage) {
      const stageOption = STAGE_OPTIONS.find((option) => option.value === selectedStage);
      if (stageOption) {
        setValue('probability', stageOption.probability);
      }
    }
  }, [selectedStage, setValue]);

  useEffect(() => {
    if (open) {
      reset(initialData);
    }
  }, [open, initialData, reset]);

  const onSubmit = async (data) => {
    try {
      await convertLead({
        leadId: lead.id,
        opportunityData: {
          name: data.opportunityName,
          deal_value: data.value,
          stage: data.stage,
          expected_close_date: dayjs(data.expectedCloseDate).format('YYYY-MM-DD'),
          probability: data.probability,
          notes: data.notes,
        },
      });

      enqueueSnackbar('Lead converted to opportunity successfully', {
        variant: 'success',
      });

      reset();
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to convert lead to opportunity', {
        variant: 'error',
      });
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  if (!lead) return null;

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      aria-labelledby="convert-lead-dialog-title"
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
        direction="row"
        sx={{
          p: 3,
          pb: 2,
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <DialogTitle id="convert-lead-dialog-title" sx={{ p: 0, typography: 'h6' }}>
          Convert Lead to Opportunity
        </DialogTitle>
        <Button
          shape="square"
          variant="text"
          size="small"
          color="neutral"
          onClick={handleCancel}
          aria-label="close"
        >
          <IconifyIcon
            icon="material-symbols:close-rounded"
            sx={{ color: 'text.primary', fontSize: 20 }}
          />
        </Button>
      </Stack>

      <DialogContent sx={{ px: 3, py: 1 }}>
        <Grid container spacing={2}>
          {/* Pre-filled Lead Information */}
          <Grid size={12}>
            <Paper
              background={1}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Lead Information
              </Typography>
              <Stack spacing={0.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Contact Name:
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {lead.name}
                  </Typography>
                </Box>
                {lead.company && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Company:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {lead.company}
                    </Typography>
                  </Box>
                )}
                {lead.source && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Source:
                    </Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                      {lead.source.replace(/_/g, ' ')}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>

          {/* Opportunity Name */}
          <Grid size={12}>
            <Controller
              name="opportunityName"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  id="opportunity-name"
                  label="Opportunity Name"
                  variant="filled"
                  fullWidth
                  required
                  disabled={isMutating}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          {/* Value */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="value"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl variant="filled" fullWidth>
                  <InputLabel htmlFor="opportunity-value" error={!!fieldState.error} required>
                    Value
                  </InputLabel>
                  <FilledInput
                    {...field}
                    id="opportunity-value"
                    type="number"
                    disabled={isMutating}
                    error={!!fieldState.error}
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

          {/* Stage */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="stage"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl fullWidth variant="filled">
                  <InputLabel id="stage-select-label" error={!!fieldState.error} required>
                    Stage
                  </InputLabel>
                  <Select
                    {...field}
                    labelId="stage-select-label"
                    disabled={isMutating}
                    error={!!fieldState.error}
                    label="Stage"
                  >
                    {STAGE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText error>{fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </Grid>

          {/* Expected Close Date */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="expectedCloseDate"
              control={control}
              render={({ field: { onChange, value }, fieldState }) => (
                <DatePicker
                  label="Expected Close Date"
                  format="DD MMM, YYYY"
                  value={dayjs(value)}
                  onChange={(date) => {
                    onChange(date?.toString());
                  }}
                  disabled={isMutating}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      variant: 'filled',
                      error: !!fieldState.error,
                      helperText: fieldState.error?.message,
                    },
                    inputAdornment: {
                      position: 'start',
                    },
                  }}
                />
              )}
            />
          </Grid>

          {/* Probability */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="probability"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl variant="filled" fullWidth>
                  <InputLabel htmlFor="opportunity-probability" error={!!fieldState.error} required>
                    Probability
                  </InputLabel>
                  <FilledInput
                    {...field}
                    id="opportunity-probability"
                    type="number"
                    disabled={isMutating}
                    error={!!fieldState.error}
                    endAdornment={
                      <InputAdornment position="end">
                        <Typography variant="body2" color="text.secondary">
                          %
                        </Typography>
                      </InputAdornment>
                    }
                  />
                  <FormHelperText error>{fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </Grid>

          {/* Notes */}
          <Grid size={12}>
            <Controller
              name="notes"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  id="opportunity-notes"
                  label="Notes"
                  variant="filled"
                  fullWidth
                  multiline
                  rows={4}
                  disabled={isMutating}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message || 'Why is this lead qualified?'}
                  sx={{ [`& .${inputBaseClasses.root}`]: { borderRadius: 2 } }}
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
        <Button variant="soft" color="neutral" onClick={handleCancel} disabled={isMutating}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" autoFocus disabled={isMutating}>
          {isMutating ? 'Converting...' : 'Convert to Opportunity'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConvertLeadModal;
