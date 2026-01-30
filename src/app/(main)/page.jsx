// Temporarily simplified to avoid loading e-commerce dashboard assets during CRM Phase 1.1 testing
import { Box, Typography } from '@mui/material';

const page = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Welcome to PierceDesk</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Navigate to /apps/crm/deals to access CRM functionality
      </Typography>
    </Box>
  );
};

export default page;
