'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTheme } from '@mui/material';
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

const validationSchemas = [
  projectDetailsSchema,      // Step 0: Project Details
  scheduleTeamSchema,        // Step 1: Schedule & Team
  columnInfoSchema,          // Step 2: Column/Stages
  backgroundOptionFormSchema, // Step 3: Background
  labelInfoFormSchema,       // Step 4: Tag/Label
  newTeamFormSchema,         // Step 5: Invite Team
];

const useCreateProjectForm = (activeStep) => {
  const { palette } = useTheme();

  const methods = useForm({
    resolver: yupResolver(validationSchemas[activeStep]),
    defaultValues: {
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
    },
  });

  return methods;
};

export default useCreateProjectForm;
