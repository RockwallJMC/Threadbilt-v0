'use client';

import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Step,
  StepButton,
  StepConnector,
  stepConnectorClasses,
  StepContent,
  stepLabelClasses,
  Stepper,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import paths from 'routes/paths';
import { useCreateProject } from 'services/swr/api-hooks/useProjectApi';
import ProjectDetails from 'components/sections/projects/create-project/steps/ProjectDetails';
import ScheduleTeam from 'components/sections/projects/create-project/steps/ScheduleTeam';
import Background from 'components/sections/kanban/create-board/steps/Background/Background';
import ColumnStage from 'components/sections/kanban/create-board/steps/ColumnStage/ColumnStage';
import LabelInfo from 'components/sections/kanban/create-board/steps/LabelInfo';
import TeamInvite from 'components/sections/kanban/create-board/steps/TeamInvite/TeamInvite';
import useCreateProjectForm, { validationSchemas } from './useCreateProjectForm';

const steps = [
  {
    label: 'Project Details',
    content: <ProjectDetails />,
  },
  {
    label: 'Schedule & Team',
    content: <ScheduleTeam />,
  },
  {
    label: 'Column/Stages',
    content: <ColumnStage />,
  },
  {
    label: 'Background',
    content: <Background />,
  },
  {
    label: 'Tags/Labels',
    content: <LabelInfo />,
  },
  {
    label: 'Invite Team',
    content: <TeamInvite />,
  },
];

const getBorderColor = (index, activeStep, completedSteps) => {
  if (completedSteps.includes(index)) {
    return 'success.main';
  }
  if (index <= activeStep) {
    return 'primary.main';
  }
  return 'dividerLight';
};

const CreateProjectStepper = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const methods = useCreateProjectForm();
  const { handleSubmit, getValues, setError, clearErrors } = methods;
  const { trigger: createProject, isMutating } = useCreateProject();

  // Per-step validation using step-specific schemas
  const validateCurrentStep = async () => {
    clearErrors();
    const schema = validationSchemas[activeStep];
    const values = getValues();

    try {
      await schema.validate(values, { abortEarly: false });
      return true;
    } catch (err) {
      if (err.inner) {
        err.inner.forEach((validationError) => {
          setError(validationError.path, {
            type: 'validation',
            message: validationError.message,
          });
        });
      }
      return false;
    }
  };

  const handleSaveAndContinue = async (event) => {
    event.preventDefault();
    const isValid = await validateCurrentStep();
    if (isValid) {
      setCompletedSteps((prev) => [...prev, activeStep]);
      setActiveStep((prev) => prev + 1);
    } else {
      console.error('Validation failed for step:', activeStep);
    }
  };

  const handleSkip = async () => {
    setActiveStep((prev) => prev + 1);
  };

  const onSubmit = async (values) => {
    try {
      // Prepare data for API
      const projectPayload = {
        name: values.name,
        description: values.description,
        budget: values.budget ? parseFloat(values.budget) : null,
        priority: values.priority,
        start_date: values.startDate,
        end_date: values.endDate || null,
        project_manager_id: values.projectManager || null,
        status: 'active',
        background_image: values.backgroundOptions?.selected?.type === 'image'
          ? values.backgroundOptions.selected.background
          : null,
        background_color: values.backgroundOptions?.selected?.type === 'color'
          ? values.backgroundOptions.selected.background
          : null,
        columns: values.columns,
        labels: values.labels,
        members: values.team,
      };

      await createProject(projectPayload);
      enqueueSnackbar('Project created successfully', { variant: 'success' });
      router.push(paths.project);
    } catch (error) {
      console.error('Failed to create project:', error);
      enqueueSnackbar(error.message || 'Failed to create project', { variant: 'error' });
    }
  };

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 680 }}>
        <Stepper nonLinear activeStep={activeStep} orientation="vertical" connector={null}>
          {steps.map((step, index) => (
            <Step
              key={step.label}
              completed={completedSteps.includes(index)}
              sx={{
                [`& .${stepConnectorClasses.line}`]: {
                  borderWidth: 0,
                },
              }}
            >
              <StepButton
                onClick={() => setActiveStep(index)}
                sx={{
                  py: 0,
                  [`& .${stepLabelClasses.iconContainer}`]: {
                    pr: 2,
                    fontWeight: 500,
                  },
                  [`& .${stepLabelClasses.root}`]: {
                    py: 0,
                  },
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: activeStep === index ? 700 : 500,
                  }}
                >
                  {step.label}
                </Typography>
              </StepButton>
              <StepContent
                sx={{
                  pl: 3.5,
                  pr: 0,
                  my: 1,
                  borderColor: getBorderColor(index, activeStep, completedSteps),
                  borderLeftWidth: 2,
                }}
              >
                <Box
                  sx={{
                    mt: 2,
                    mb: { xs: 2, md: 4 },
                  }}
                >
                  {step.content}
                </Box>
                <Stack direction="row" spacing={2} sx={{ mb: 0, pb: 3 }}>
                  {steps.length - 1 === activeStep ? (
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={isMutating}
                      startIcon={isMutating ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                      {isMutating ? 'Creating...' : 'Create Project'}
                    </Button>
                  ) : (
                    <>
                      <Button variant="soft" onClick={handleSaveAndContinue} type="button">
                        Save & Continue
                      </Button>
                      <Button variant="text" color="neutral" onClick={handleSkip} type="button">
                        Skip
                      </Button>
                    </>
                  )}
                </Stack>
              </StepContent>
              <StepConnector
                sx={{
                  mt: 1,
                  mb: 0.5,
                  minHeight: 24,
                  ...(activeStep === index && {
                    display: 'none',
                  }),
                  ...(index + 1 === steps.length && {
                    display: 'none',
                  }),
                  ...(activeStep !== index && {
                    borderColor: completedSteps.includes(index) ? 'success.main' : 'dividerLight',
                    borderLeftStyle: 'solid',
                    borderLeftWidth: 2,
                  }),
                }}
              />
            </Step>
          ))}
        </Stepper>
      </Box>
    </FormProvider>
  );
};

export default CreateProjectStepper;
