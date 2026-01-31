import { Controller, useFormContext } from 'react-hook-form';
import {
  Box,
  FormControl,
  FormHelperText,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { TimePicker } from '@mui/x-date-pickers';
import DateRangePicker from 'components/base/DateRangePicker';
import FileDropZone from 'components/base/FileDropZone';
import IconifyIcon from 'components/base/IconifyIcon';

const ServiceFileDropzone = () => {
  const {
    register,
    setValue,
    watch,
    trigger,
    control,
    formState: { errors },
  } = useFormContext();

  const serviceFiles = watch('serviceFiles');

  const handleDrop = (acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({ id: file.name, file }));
    setValue('serviceFiles', [...(serviceFiles || []), ...newFiles]);
    trigger('serviceFiles');
  };

  const handleRemove = (index) => {
    const updatedFiles = serviceFiles.filter((_, i) => i !== index);
    setValue('serviceFiles', updatedFiles);
    trigger('serviceFiles');
  };

  return (
    <Paper background={1} sx={{ p: 3, borderRadius: 6, outline: 0 }}>
      <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 700 }}>
        Service Ticket [ticket - #####]
      </Typography>

      <Stack spacing={3} direction="column">
        {/* Ticket Title */}
        <TextField
          fullWidth
          multiline
          rows={2}
          id="ticketTitle"
          type="text"
          label="Ticket Title"
          error={!!errors.ticketTitle}
          helperText={errors.ticketTitle?.message || 'Minimum 10 characters'}
          {...register('ticketTitle')}
        />

        {/* Drag and Drop Zone */}
        <FileDropZone
          accept={{
            'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
            'application/pdf': ['.pdf'],
          }}
          previewType="thumbnail"
          onDrop={handleDrop}
          onRemove={handleRemove}
          defaultFiles={serviceFiles?.map((file) => file.file) || []}
          error={errors.serviceFiles?.message}
        />

        {/* Service Location */}
        <TextField
          fullWidth
          id="serviceLocation"
          type="text"
          label="Service Location"
          variant="filled"
          error={!!errors.serviceLocation}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <IconifyIcon icon="material-symbols:location-on-outline" />
                </InputAdornment>
              ),
            },
          }}
          helperText={errors.serviceLocation?.message}
          {...register('serviceLocation')}
        />

        {/* Service Date Range */}
        <FormControl fullWidth error={!!errors.serviceDateRange}>
          <Controller
            name="serviceDateRange"
            control={control}
            render={({ field }) => (
              <DateRangePicker
                selected={field.value?.[0] || undefined}
                startDate={field.value?.[0] || undefined}
                endDate={field.value?.[1] || undefined}
                onChange={(dates) => {
                  field.onChange(dates);
                }}
                isClearable
                customInput={
                  <TextField
                    label="Service Date Range"
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconifyIcon icon="material-symbols:calendar-month-outline-rounded" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                }
              />
            )}
          />
          {errors.serviceDateRange && <FormHelperText>{errors.serviceDateRange?.message}</FormHelperText>}
        </FormControl>

        {/* Service Window */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Service Window
            <Box component="span" sx={{ color: 'error.main', ml: '2px' }}>
              *
            </Box>
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                control={control}
                name="serviceWindowStart"
                render={({ field }) => (
                  <TimePicker
                    label="Start time"
                    value={field.value ?? null}
                    onChange={field.onChange}
                    slotProps={{
                      inputAdornment: {
                        position: 'start',
                      },
                      textField: {
                        fullWidth: true,
                        error: !!errors.serviceWindowStart,
                        helperText: errors.serviceWindowStart?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                control={control}
                name="serviceWindowEnd"
                render={({ field }) => (
                  <TimePicker
                    label="End time"
                    value={field.value ?? null}
                    onChange={field.onChange}
                    slotProps={{
                      inputAdornment: {
                        position: 'start',
                      },
                      textField: {
                        fullWidth: true,
                        error: !!errors.serviceWindowEnd,
                        helperText: errors.serviceWindowEnd?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ServiceFileDropzone;
