'use client';

import { Box } from '@mui/material';
import SimpleBar from 'components/base/SimpleBar';
import PipelineKanban from 'components/sections/hiring/admin/pipeline/PipelineKanban';
import HiringProvider from 'providers/HiringProvider';

const ResourceSchedulePipeline = () => {
  return (
    <HiringProvider>
      <Box sx={{ width: 1, height: 1, overflow: 'hidden' }}>
        <SimpleBar disableHorizontal>
          <Box sx={{ minHeight: 1, pr: 2 }}>
            <PipelineKanban />
          </Box>
        </SimpleBar>
      </Box>
    </HiringProvider>
  );
};

export default ResourceSchedulePipeline;
