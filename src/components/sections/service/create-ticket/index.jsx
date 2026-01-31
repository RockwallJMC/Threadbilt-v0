'use client';

import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { Box, Container, Drawer, drawerClasses, Paper, Stack, Typography } from '@mui/material';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import paths from 'routes/paths';
import PageBreadcrumb from 'components/sections/common/PageBreadcrumb';
import BottomBar from 'components/sections/service/create-ticket/BottomBar';
import ServiceAside from 'components/sections/service/create-ticket/aside/EventAside';
import ServiceSections from 'components/sections/service/create-ticket/main/EventSections';
import useCreateTicketForm from 'components/sections/service/create-ticket/useCreateEventForm';

const CreateTicket = () => {
  const { methods } = useCreateTicketForm();
  const { up } = useBreakpoints();
  const [isAsideOpen, setIsAsideOpen] = useState(false);

  const { handleSubmit, reset } = methods;
  const upMd = up('md');

  const handleAsideOpen = () => setIsAsideOpen(true);

  const onSubmit = (formData) => {
    console.log('Form Submitted', formData);
    reset();
  };

  return (
    <FormProvider {...methods}>
      <Stack component="form" id="createTicketForm" onSubmit={handleSubmit(onSubmit)}>
        <Paper sx={{ p: { xs: 3, md: 5 }, flex: 1 }}>
          <Box sx={{ mb: 3 }}>
            <PageBreadcrumb
              items={[
                { label: 'Home', url: paths.events },
                { label: 'Service', url: '#!' },
                { label: 'Create Ticket', active: true },
              ]}
              sx={{ mb: 2 }}
            />
            <Typography variant="h4">Create Service Ticket</Typography>
          </Box>

          <Container maxWidth={false} sx={{ maxWidth: 520, px: { xs: 0 } }}>
            <ServiceSections />
          </Container>
        </Paper>

        {upMd ? (
          <ServiceAside />
        ) : (
          <Drawer
            anchor="right"
            variant="temporary"
            open={isAsideOpen}
            onClose={() => setIsAsideOpen(false)}
            sx={{
              [`& .${drawerClasses.paper}`]: { width: 1, maxWidth: 404 },
            }}
          >
            <ServiceAside handleClose={() => setIsAsideOpen(false)} />
          </Drawer>
        )}
      </Stack>

      {!upMd && (
        <Box sx={{ position: 'sticky', zIndex: 999, width: 1, bottom: 0 }}>
          <BottomBar handleAsideOpen={handleAsideOpen} />
        </Box>
      )}
    </FormProvider>
  );
};

export default CreateTicket;
