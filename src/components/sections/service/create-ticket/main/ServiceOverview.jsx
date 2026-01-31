import { Controller, useFormContext, useWatch } from 'react-hook-form';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

const ServiceOverview = () => {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext();

  const customerType = useWatch({
    control,
    name: 'customerType',
  });

  const sameAsServiceLocation = useWatch({
    control,
    name: 'invoiceAddressSameAsService',
  });

  return (
    <Stack spacing={3} direction="column">
      {/* Customer Type Section wrapped in Paper */}
      <Paper background={1} sx={{ p: 3, borderRadius: 6, outline: 0 }}>
        <Stack spacing={3} direction="column">
          {/* Customer Type Radio */}
          <FormControl component="fieldset">
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Customer Type
              <Box component="span" sx={{ color: 'error.main', ml: '2px' }}>
                *
              </Box>
            </Typography>
            <Controller
              name="customerType"
              control={control}
              render={({ field }) => (
                <RadioGroup row {...field}>
                  <FormControlLabel
                    value="business"
                    control={<Radio />}
                    label={
                      <Typography variant="subtitle2" color="text.secondary" fontWeight={400}>
                        Business
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    value="residential"
                    control={<Radio />}
                    label={
                      <Typography variant="subtitle2" color="text.secondary" fontWeight={400}>
                        Residential
                      </Typography>
                    }
                  />
                </RadioGroup>
              )}
            />
          </FormControl>

          {/* Conditional Customer Fields */}
          {customerType === 'business' && (
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Business Name"
                  error={!!errors.businessName}
                  helperText={errors.businessName?.message}
                  {...register('businessName')}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Primary Contact Name"
                  error={!!errors.primaryContactName}
                  helperText={errors.primaryContactName?.message}
                  {...register('primaryContactName')}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  error={!!errors.contactPhone}
                  helperText={errors.contactPhone?.message}
                  {...register('contactPhone')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  type="email"
                  error={!!errors.contactEmail}
                  helperText={errors.contactEmail?.message}
                  {...register('contactEmail')}
                />
              </Grid>
            </Grid>
          )}

          {customerType === 'residential' && (
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  error={!!errors.residentName}
                  helperText={errors.residentName?.message}
                  {...register('residentName')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Phone"
                  error={!!errors.residentPhone}
                  helperText={errors.residentPhone?.message}
                  {...register('residentPhone')}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  error={!!errors.residentEmail}
                  helperText={errors.residentEmail?.message}
                  {...register('residentEmail')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="2nd Phone"
                  error={!!errors.residentPhone2}
                  helperText={errors.residentPhone2?.message}
                  {...register('residentPhone2')}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Address"
                  error={!!errors.residentAddress}
                  helperText={errors.residentAddress?.message}
                  {...register('residentAddress')}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="City"
                  error={!!errors.residentCity}
                  helperText={errors.residentCity?.message}
                  {...register('residentCity')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  error={!!errors.residentZip}
                  helperText={errors.residentZip?.message}
                  {...register('residentZip')}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="State"
                  error={!!errors.residentState}
                  helperText={errors.residentState?.message}
                  {...register('residentState')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="County"
                  error={!!errors.residentCounty}
                  helperText={errors.residentCounty?.message}
                  {...register('residentCounty')}
                />
              </Grid>
            </Grid>
          )}

          {/* Invoice Address Checkbox - moved to bottom of Paper, left-aligned */}
          <Box>
            <Controller
              name="invoiceAddressSameAsService"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label={
                    <Typography variant="subtitle2" color="text.secondary">
                      Invoice address same as service location
                    </Typography>
                  }
                />
              )}
            />
          </Box>
        </Stack>
      </Paper>

      {/* Invoice Address Fields - outside Paper */}
      {!sameAsServiceLocation && (
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Invoice Street Address"
              error={!!errors.invoiceStreet}
              helperText={errors.invoiceStreet?.message}
              {...register('invoiceStreet')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="City"
              error={!!errors.invoiceCity}
              helperText={errors.invoiceCity?.message}
              {...register('invoiceCity')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="State"
              error={!!errors.invoiceState}
              helperText={errors.invoiceState?.message}
              {...register('invoiceState')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="ZIP"
              error={!!errors.invoiceZip}
              helperText={errors.invoiceZip?.message}
              {...register('invoiceZip')}
            />
          </Grid>
        </Grid>
      )}
    </Stack>
  );
};

export default ServiceOverview;
