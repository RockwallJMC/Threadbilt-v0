// Temporarily simplified to avoid loading e-commerce dashboard assets during CRM Phase 1.1 testing
import { Box, Typography } from '@mui/material';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AuthedRedirect from 'components/auth/AuthedRedirect';

const page = async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      redirect('/apps/crm/deals');
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Auth check failed on landing page:', error?.message ?? error);
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <AuthedRedirect />
      <Typography variant="h4">Welcome to PierceDesk</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Navigate to /apps/crm/deals to access CRM functionality
      </Typography>
    </Box>
  );
};

export default page;
