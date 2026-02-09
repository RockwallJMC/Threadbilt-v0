import { Paper, Typography } from '@mui/material';
import CreateProjectStepper from './CreateProjectStepper';

const CreateProject = () => {
  return (
    <Paper
      sx={{
        p: { xs: 3, md: 5 },
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 4 }}>
        Create New Project
      </Typography>
      <CreateProjectStepper />
    </Paper>
  );
};

export default CreateProject;
