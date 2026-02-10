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
} from 'data/kanban/createBoard';
import { backgroundOptionFormSchema } from 'components/sections/kanban/create-board/steps/Background/Background';
import { basicInfoFormSchema } from 'components/sections/kanban/create-board/steps/BasicInfo';
import { columnInfoSchema } from 'components/sections/kanban/create-board/steps/ColumnStage/ColumnStage';
import { labelInfoFormSchema } from 'components/sections/kanban/create-board/steps/LabelInfo';
import { newTeamFormSchema } from 'components/sections/kanban/create-board/steps/TeamInvite/NewTeamTabPanel';

// Export validation schemas for per-step validation
export const validationSchemas = [
  basicInfoFormSchema,
  columnInfoSchema,
  backgroundOptionFormSchema,
  labelInfoFormSchema,
  newTeamFormSchema,
];

// Combined schema that merges all step schemas (permissive for flexibility)
const combinedSchema = yup.object().shape({
  name: yup.string(),
  boardType: yup.string(),
  visibility: yup.string(),
  columns: yup.array(),
  backgroundOptions: yup.object(),
  labels: yup.array(),
  team: yup.array(),
});

const useCreateBoardForm = () => {
  const { palette } = useTheme();

  // Memoize default values to prevent unnecessary re-renders
  const defaultValues = useMemo(() => ({
    name: '',
    boardType: '',
    visibility: 'private',
    columns: [
      { columnType: 'To Do', color: palette.success.lighter, cardLimit: 20, hasCardLimit: true },
      {
        columnType: 'Completed',
        color: palette.primary.lighter,
        cardLimit: 20,
        hasCardLimit: true,
      },
      {
        columnType: 'Ongoing',
        color: palette.warning.lighter,
        cardLimit: 20,
        hasCardLimit: true,
      },
    ],
    backgroundOptions: {
      colors: backgroundColorOptions,
      images: backgroundImageOptions,
      selected: { ...backgroundImageOptions[0], type: 'image' },
    },
    labels: [
      { label: 'Todo', color: palette.success.lighter },
      { label: 'Completed', color: palette.primary.lighter },
      { label: 'Ongoing', color: palette.warning.lighter },
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

export default useCreateBoardForm;
