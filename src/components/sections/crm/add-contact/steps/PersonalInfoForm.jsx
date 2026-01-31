import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Box,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import * as yup from 'yup';
import AvatarDropBox from 'components/base/AvatarDropBox';
import IconifyIcon from 'components/base/IconifyIcon';
import NumberTextField from 'components/base/NumberTextField';
import ContactFormSection from 'components/sections/crm/add-contact/ContactFormSection';
import ControlledSelect from 'components/sections/crm/add-contact/ControlledSelect';

export const personalInfoSchema = yup.object({
  personalInfo: yup.object({
    profileImage: yup.mixed().optional(),
    firstName: yup.string().required('This field is required'),
    lastName: yup.string().required('This field is required'),
    workEmail: yup.string().email('Invalid email format').required('This field is required'),
    personalEmail: yup.string().email('Invalid email format').optional(),
    phoneNumber: yup.string().required('Phone Number is required'),
    alternatePhoneNumber: yup.string().notRequired(),
    dateOfBirth: yup.string().optional(),
    jobTitle: yup.string().required('This field is required'),
    status: yup.string().required('This field is required'),
    linkedInUrl: yup.string().url('Invalid URL').optional(),
    note: yup.string().optional(),
  }),
});

const PersonalInfoForm = ({ label }) => {
  const {
    register,
    control,
    formState: { errors },
    getValues,
  } = useFormContext();

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [emailValidation, setEmailValidation] = useState({
    checking: false,
    exists: null,
    message: '',
  });

  const checkEmailUniqueness = async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailValidation({ checking: false, exists: null, message: '' });
      return;
    }

    setEmailValidation({ checking: true, exists: null, message: '' });

    try {
      const response = await fetch(`/api/crm/contacts/check-email?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (response.ok) {
        setEmailValidation({
          checking: false,
          exists: data.exists,
          message: data.exists ? 'This email is already in use' : 'Email is available',
        });
      } else {
        setEmailValidation({ checking: false, exists: null, message: '' });
      }
    } catch (error) {
      console.error('Error checking email:', error);
      setEmailValidation({ checking: false, exists: null, message: '' });
    }
  };

  return (
    <div>
      <Box sx={{ mb: 4.5 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {label}
        </Typography>
        <Divider />
      </Box>
      <Stack direction="column" spacing={4}>
        <ContactFormSection title="Profile Picture">
          <Controller
            control={control}
            name="personalInfo.profileImage"
            render={({ field: { value, onChange } }) => {
              return (
                <AvatarDropBox
                  defaultFile={value}
                  onDrop={async (acceptedFiles) => {
                    if (acceptedFiles.length > 0) {
                      setIsUploadingAvatar(true);
                      try {
                        const formData = new FormData();
                        formData.append('file', acceptedFiles[0]);

                        const response = await fetch('/api/upload/avatar', {
                          method: 'POST',
                          body: formData,
                        });

                        if (!response.ok) throw new Error('Upload failed');

                        const data = await response.json();
                        onChange(data.url); // Store URL instead of File object
                      } catch (error) {
                        console.error('Avatar upload error:', error);
                        // Keep file object as fallback
                        onChange(acceptedFiles[0]);
                      } finally {
                        setIsUploadingAvatar(false);
                      }
                    }
                  }}
                  sx={{
                    '& img': {
                      objectFit: 'cover',
                    },
                  }}
                  error={errors.personalInfo?.profileImage ? 'Invalid avatar' : undefined}
                />
              );
            }}
          />
          {isUploadingAvatar && (
            <Typography variant="caption" color="primary">
              Uploading...
            </Typography>
          )}
          {errors.personalInfo?.profileImage?.message && (
            <FormHelperText error>{errors.personalInfo?.profileImage?.message}</FormHelperText>
          )}
          <Typography variant="caption" color="text.secondary">
            JPG or PNG, Recommended size 1:1, Up to 10MB.
          </Typography>
        </ContactFormSection>
        <ContactFormSection title="Basic Information">
          <Grid container spacing={2} sx={{ width: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="First Name"
                error={!!errors.personalInfo?.firstName}
                helperText={errors.personalInfo?.firstName?.message}
                {...register('personalInfo.firstName')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Last Name"
                error={!!errors.personalInfo?.lastName}
                helperText={errors.personalInfo?.lastName?.message}
                {...register('personalInfo.lastName')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Work Email"
                type="email"
                error={!!errors.personalInfo?.workEmail || emailValidation.exists === true}
                helperText={
                  errors.personalInfo?.workEmail?.message ||
                  (emailValidation.exists !== null ? emailValidation.message : '')
                }
                {...register('personalInfo.workEmail')}
                onBlur={(e) => checkEmailUniqueness(e.target.value)}
                InputProps={{
                  endAdornment: emailValidation.checking ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : emailValidation.exists === false ? (
                    <InputAdornment position="end">
                      <IconifyIcon icon="mdi:check-circle" color="success.main" />
                    </InputAdornment>
                  ) : emailValidation.exists === true ? (
                    <InputAdornment position="end">
                      <IconifyIcon icon="mdi:close-circle" color="error.main" />
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Personal Email"
                type="email"
                error={!!errors.personalInfo?.personalEmail}
                helperText={errors.personalInfo?.personalEmail?.message}
                {...register('personalInfo.personalEmail')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumberTextField
                fullWidth
                label="Phone Number"
                error={!!errors.personalInfo?.phoneNumber}
                helperText={errors.personalInfo?.phoneNumber?.message}
                {...register('personalInfo.phoneNumber')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumberTextField
                fullWidth
                label="Alternate Phone Number"
                error={!!errors.personalInfo?.alternatePhoneNumber}
                helperText={errors.personalInfo?.alternatePhoneNumber?.message}
                {...register('personalInfo.alternatePhoneNumber')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl variant="filled" fullWidth={true}>
                <Controller
                  name="personalInfo.dateOfBirth"
                  control={control}
                  render={({ field }) => {
                    return (
                      <DatePicker
                        label="Date of Birth"
                        disableFuture
                        format="DD/MM/YYYY"
                        value={field.value ? dayjs(field.value, 'DD/MM/YYYY') : null}
                        onChange={(newValue) => {
                          const formattedDate = newValue?.format('DD/MM/YYYY');
                          field.onChange(formattedDate || '');
                        }}
                        slotProps={{
                          textField: {
                            error: !!errors.personalInfo?.dateOfBirth,
                            helperText: errors.personalInfo?.dateOfBirth?.message,
                          },
                        }}
                      />
                    );
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
        </ContactFormSection>

        <ContactFormSection title="Professional Details">
          <Grid container spacing={2} sx={{ width: 1 }}>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Job Title"
                error={!!errors.personalInfo?.jobTitle}
                helperText={errors.personalInfo?.jobTitle?.message}
                {...register('personalInfo.jobTitle')}
              />
            </Grid>
            <Grid size={6}>
              <ControlledSelect
                name="personalInfo.status"
                label="Status"
                options={[
                  { value: 'currentlyWorking', label: 'Currently Working' },
                  { value: 'notWorking', label: 'Not Working' },
                  { value: 'seekingOpportunities', label: 'Seeking Opportunities' },
                ]}
                control={control}
                error={errors.personalInfo?.status?.message}
              />
            </Grid>
          </Grid>
        </ContactFormSection>

        <ContactFormSection title="Additional Information">
          <TextField
            fullWidth
            label={
              <Typography variant="subtitle2" fontWeight={400}>
                LinkedIn URL
                <Box component="span" sx={{ color: 'text.disabled', ml: 0.5 }}>
                  ( optional )
                </Box>
              </Typography>
            }
            error={!!errors.personalInfo?.linkedInUrl}
            helperText={errors.personalInfo?.linkedInUrl?.message}
            {...register('personalInfo.linkedInUrl')}
          />

          <TextField
            fullWidth
            label={
              <Typography variant="subtitle2" fontWeight={400}>
                Add note
                <Box component="span" sx={{ color: 'text.disabled', ml: 0.5 }}>
                  ( optional )
                </Box>
              </Typography>
            }
            multiline
            rows={3}
            error={!!errors.personalInfo?.note}
            helperText={errors.personalInfo?.note?.message}
            {...register('personalInfo.note')}
          />
        </ContactFormSection>
      </Stack>
    </div>
  );
};

export default PersonalInfoForm;
