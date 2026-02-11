'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog, { dialogClasses } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconifyIcon from 'components/base/IconifyIcon';
import FileDropZone from 'components/base/FileDropZone';
import { useCreateDrawing } from 'services/swr/api-hooks/useProjectDrawingsApi';

const steps = ['Upload File', 'Drawing Type', 'Version', 'Review & Save'];

const drawingTypes = [
  'Architectural',
  'Structural',
  'Mechanical',
  'Electrical',
  'Plumbing',
  'Civil',
  'Landscape',
  'Shop Drawing',
  'As-Built',
  'Detail',
];

const AddDrawingDialog = ({ open, onClose, title, projectId, onDrawingCreated }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [drawingType, setDrawingType] = useState('');
  const [version, setVersion] = useState('');
  const [error, setError] = useState('');

  const { trigger: createDrawing, isMutating } = useCreateDrawing(projectId);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFileChange = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];

      if (file.size > 52428800) {
        setError('File size exceeds 50MB limit');
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      } else {
        setError('');
        setSelectedFile(file);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
      }
    }
  };

  const handleSave = async () => {
    try {
      setError('');
      await createDrawing({
        title,
        drawingType,
        version,
        file: selectedFile,
      });

      onDrawingCreated?.();
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to save drawing');
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setDrawingType('');
    setVersion('');
    setError('');
    onClose();
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return selectedFile !== null && !error;
      case 1:
        return drawingType !== '';
      case 2:
        return version.trim() !== '';
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={2}>
            <Typography variant="h6">{title}</Typography>
            <FileDropZone
              onDrop={handleFileChange}
              accept={{
                'image/png': ['.png'],
                'image/jpeg': ['.jpg', '.jpeg'],
                'application/pdf': ['.pdf'],
              }}
              maxFiles={1}
              maxSize={52428800}
              error={error}
            />
            {error && (
              <Typography color="error" variant="caption">
                {error}
              </Typography>
            )}
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={2}>
            <TextField
              select
              fullWidth
              label="Drawing Type"
              value={drawingType}
              onChange={(e) => setDrawingType(e.target.value)}
            >
              {drawingTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Version"
              placeholder="e.g., Rev A, v1, Draft 2"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            />
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Review your drawing details:
            </Typography>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Title:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {title}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                File:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedFile?.name}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Drawing Type:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {drawingType}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Version:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {version}
              </Typography>
            </Box>
            {previewUrl && (
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  Preview:
                </Typography>
                <Box
                  component="img"
                  src={previewUrl}
                  alt="Preview"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    borderRadius: 2,
                    objectFit: 'contain',
                  }}
                />
              </Box>
            )}
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{ [`& .${dialogClasses.paper}`]: { p: 3, borderRadius: 6, position: 'relative' } }}
    >
      <DialogTitle sx={{ p: 0, mb: 1, typography: 'h6' }}>Add Drawing</DialogTitle>
      <DialogContent sx={{ p: 0, mb: 3, overflow: 'visible' }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}
      </DialogContent>
      <DialogActions sx={{ p: 0 }}>
        <Button variant="soft" color="neutral" onClick={handleClose}>
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button variant="soft" color="neutral" onClick={handleBack}>
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" onClick={handleNext} disabled={!isStepValid()}>
            Next
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSave} disabled={isMutating || !isStepValid()}>
            {isMutating ? 'Saving...' : 'Save'}
          </Button>
        )}
      </DialogActions>
      <Button
        shape="square"
        variant="text"
        size="small"
        color="neutral"
        onClick={handleClose}
        sx={{ position: 'absolute', top: 24, right: 24 }}
      >
        <IconifyIcon icon="material-symbols:close-rounded" sx={{ color: 'text.primary', fontSize: 20 }} />
      </Button>
    </Dialog>
  );
};

export default AddDrawingDialog;
