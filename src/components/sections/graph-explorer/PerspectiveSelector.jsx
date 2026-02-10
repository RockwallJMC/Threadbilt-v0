'use client';

import { Box, ToggleButton, ToggleButtonGroup, Typography, Tooltip } from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import CorporateFareRoundedIcon from '@mui/icons-material/CorporateFareRounded';

const perspectives = [
  {
    id: 'user',
    label: 'My Network',
    icon: PersonRoundedIcon,
    description: 'View relationships centered on you',
  },
  {
    id: 'account',
    label: 'Account',
    icon: BusinessRoundedIcon,
    description: 'View relationships for a specific account',
  },
  {
    id: 'project',
    label: 'Project',
    icon: FolderRoundedIcon,
    description: 'View relationships for a specific project',
  },
  {
    id: 'organization',
    label: 'Organization',
    icon: CorporateFareRoundedIcon,
    description: 'View all relationships in your organization',
  },
];

/**
 * Selector for choosing the graph perspective/center point
 */
export default function PerspectiveSelector({
  value = 'user',
  onChange,
  disabled = false,
}) {
  const handleChange = (event, newValue) => {
    if (newValue !== null) {
      onChange?.(newValue);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Perspective
      </Typography>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        size="small"
        disabled={disabled}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          '& .MuiToggleButton-root': {
            flex: '1 1 auto',
            minWidth: 80,
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
          },
        }}
      >
        {perspectives.map((perspective) => {
          const Icon = perspective.icon;
          return (
            <Tooltip key={perspective.id} title={perspective.description}>
              <ToggleButton
                value={perspective.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  py: 1,
                }}
              >
                <Icon fontSize="small" />
                <Typography variant="caption" sx={{ lineHeight: 1 }}>
                  {perspective.label}
                </Typography>
              </ToggleButton>
            </Tooltip>
          );
        })}
      </ToggleButtonGroup>
    </Box>
  );
}

export { perspectives };
