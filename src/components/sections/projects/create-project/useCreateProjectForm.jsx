'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTheme } from '@mui/material';
import * as yup from 'yup';
import {
  backgroundColorOptions,
  backgroundImageOptions,
  initialTeamTableData,
} from 'data/projects/createProject';
import { projectDetailsSchema } from 'components/sections/projects/create-project/steps/ProjectDetails';
import { scheduleTeamSchema } from 'components/sections/projects/create-project/steps/ScheduleTeam';
import { backgroundOptionFormSchema } from 'components/sections/kanban/create-board/steps/Background/Background';
import { columnInfoSchema } from 'components/sections/kanban/create-board/steps/ColumnStage/ColumnStage';
import { labelInfoFormSchema } from 'components/sections/kanban/create-board/steps/LabelInfo';
import { newTeamFormSchema } from 'components/sections/kanban/create-board/steps/TeamInvite/NewTeamTabPanel';

// Export validation schemas for per-step validation
export const validationSchemas = [
  projectDetailsSchema,      // Step 0: Project Details
  scheduleTeamSchema,        // Step 1: Schedule & Team
  columnInfoSchema,          // Step 2: Column/Stages
  backgroundOptionFormSchema, // Step 3: Background
  labelInfoFormSchema,       // Step 4: Tag/Label
  newTeamFormSchema,         // Step 5: Invite Team
];

// Combined schema that merges all step schemas (permissive for final submission)
const combinedSchema = yup.object().shape({
  // All fields are optional for flexibility during step navigation
  name: yup.string(),
  description: yup.string(),
  budget: yup.string(),
  priority: yup.string(),
  startDate: yup.string(),
  endDate: yup.string(),
  projectManager: yup.string(),
  boardType: yup.string(),
  visibility: yup.string(),
  columns: yup.array(),
  backgroundOptions: yup.object(),
  labels: yup.array(),
  team: yup.array(),
});

const useCreateProjectForm = () => {
  const { palette } = useTheme();

  // Memoize default values to prevent unnecessary re-renders
  const defaultValues = useMemo(() => ({
    // Project Details (Step 1)
    name: '',
    description: '',
    budget: '',
    priority: 'medium',

    // Schedule & Team (Step 2)
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    projectManager: '',

    // Board fields (Steps 3-6, reused from kanban)
    boardType: 'basic',
    visibility: 'private',
    columns: [
      { columnType: 'To Do', color: palette.success.lighter, cardLimit: 20, hasCardLimit: true },
      { columnType: 'In Progress', color: palette.warning.lighter, cardLimit: 20, hasCardLimit: true },
      { columnType: 'Review', color: palette.info.lighter, cardLimit: 20, hasCardLimit: true },
      { columnType: 'Completed', color: palette.primary.lighter, cardLimit: 20, hasCardLimit: true },
    ],
    backgroundOptions: {
      colors: backgroundColorOptions,
      images: backgroundImageOptions,
      selected: { ...backgroundImageOptions[0], type: 'image' },
    },
    labels: [
      { label: 'High Priority', color: palette.error.lighter },
      { label: 'In Progress', color: palette.warning.lighter },
      { label: 'Completed', color: palette.success.lighter },
    ],
    team: initialTeamTableData,
  }), [palette]);

  // Single form instance that persists across all steps
  const methods = useForm({
    resolver: yupResolver(combinedSchema),
    defaultValues,
    mode: 'onChange',
  });

  return methods;
};

export default useCreateProjectForm;
