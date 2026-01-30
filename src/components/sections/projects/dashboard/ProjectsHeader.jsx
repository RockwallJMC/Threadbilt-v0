'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';

const ProjectsHeader = () => {
  const handleCreateProject = () => {
    // TODO: Open create project dialog
    console.log('Create new project');
  };

  const handleImportFromCRM = () => {
    // TODO: Open CRM opportunity selection dialog
    console.log('Import from CRM');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 3,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Projects Desk
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your projects, tasks, and team collaboration
        </Typography>
      </Box>

      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          startIcon={<IconifyIcon icon="material-symbols:download" />}
          onClick={handleImportFromCRM}
        >
          Convert from CRM
        </Button>
        <Button
          variant="contained"
          startIcon={<IconifyIcon icon="material-symbols:add" />}
          onClick={handleCreateProject}
        >
          New Project
        </Button>
      </Stack>
    </Box>
  );
};

export default ProjectsHeader;
