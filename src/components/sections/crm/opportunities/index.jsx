'use client';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import OpportunitiesKanbanProvider from 'providers/OpportunitiesProvider';
import SimpleBar from 'components/base/SimpleBar';
import OpportunitiesKanban from 'components/sections/crm/opportunities/OpportunitiesKanban';
import CreateOpportunityDialog from 'components/sections/crm/opportunities/opportunity-card/CreateOpportunityDialog';
import OpportunitiesHeader from 'components/sections/crm/opportunities/page-header/OpportunitiesHeader';

const index = () => {
  return (
    <OpportunitiesKanbanProvider>
      <Opportunities />
    </OpportunitiesKanbanProvider>
  );
};

const Opportunities = () => {
  const { topbarHeight } = useNavContext();
  const { up } = useBreakpoints();
  const upSm = up('sm');

  return (
    <Paper>
      <OpportunitiesHeader />
      <Paper
        sx={{
          height: ({ mixins }) =>
            mixins.contentHeight(
              topbarHeight,
              (upSm ? mixins.footer.sm : mixins.footer.xs) + (upSm ? 117 : 161),
            ),
        }}
      >
        <SimpleBar>
          <Stack sx={{ height: 1 }}>
            <OpportunitiesKanban />
          </Stack>
        </SimpleBar>
      </Paper>
      <CreateOpportunityDialog />
    </Paper>
  );
};

export default index;
