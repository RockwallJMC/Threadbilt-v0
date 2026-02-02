'use client';

import { Box } from '@mui/material';
import ProjectTimelineChart from 'components/sections/dashboards/project/project-timeline/ProjectTimelineChart';

const ProjectTimeline = ({ projectTimelineData, hourRange, tableHeaderTitle }) => {
  return (
    <Box sx={{ height: 1 }}>
      <ProjectTimelineChart
        projectTimelineData={projectTimelineData}
        hourRange={hourRange}
        tableHeaderTitle={tableHeaderTitle}
      />
    </Box>
  );
};

export default ProjectTimeline;
