'use client';

import { useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { useDealsContext } from 'providers/DealsProvider';
import DealsKanbanProvider from 'providers/DealsProvider';
import { usePageContext } from 'providers/PageContext';
import { SET_CREATE_DEAL_DIALOG } from 'reducers/DealsReducer';
import paths from 'routes/paths';
import SimpleBar from 'components/base/SimpleBar';
import DealsKanban from 'components/sections/crm/deals/DealsKanban';
import CreateDealDialog from 'components/sections/crm/deals/deal-card/CreateDealDialog';

const index = () => {
  return (
    <DealsKanbanProvider>
      <Deals />
    </DealsKanbanProvider>
  );
};

const Deals = () => {
  const { topbarHeight } = useNavContext();
  const { up } = useBreakpoints();
  const upSm = up('sm');
  const { dealsDispatch } = useDealsContext();
  const { setTitle, setBreadcrumbs, setPageActions, clearPageContext } = usePageContext();

  // Set page context on mount
  useEffect(() => {
    setTitle('Deals');
    setBreadcrumbs([
      {
        label: 'Home',
        url: '/',
      },
      {
        label: 'CRM',
        url: paths.crm,
      },
      {
        label: 'Deals',
        url: '#!',
        active: true,
      },
    ]);
    setPageActions([
      {
        label: 'Import',
        variant: 'soft',
        color: 'neutral',
        onClick: () => {
          console.log('Import clicked');
        },
      },
      {
        label: 'New Deal',
        variant: 'contained',
        color: 'primary',
        icon: 'material-symbols:add-2-rounded',
        onClick: () => {
          dealsDispatch({ type: SET_CREATE_DEAL_DIALOG, payload: { isOpen: true } });
        },
      },
    ]);

    // Clear page context on unmount
    return () => {
      clearPageContext();
    };
  }, [setTitle, setBreadcrumbs, setPageActions, clearPageContext, dealsDispatch]);

  return (
    <Paper
      background={1}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 6,
        height: ({ mixins }) =>
          mixins.contentHeight(
            topbarHeight,
            (upSm ? mixins.footer.sm : mixins.footer.xs) + (upSm ? 0 : 44),
          ),
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: 16,
          height: '100%',
          pointerEvents: 'none',
          background: (theme) =>
            `linear-gradient(to left, ${theme.vars.palette.background.default} 0%, rgba(0,0,0,0) 100%)`,
          opacity: 0.35,
        },
      }}
    >
      <SimpleBar sx={{ flex: 1, minHeight: 0 }}>
        <Stack sx={{ height: 1, minHeight: 0 }}>
          <DealsKanban />
        </Stack>
      </SimpleBar>
      <CreateDealDialog />
    </Paper>
  );
};

export default index;
