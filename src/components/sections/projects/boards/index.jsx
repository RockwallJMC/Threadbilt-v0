'use client';

import { Stack } from '@mui/material';
import { useRecentProjects } from 'services/swr/api-hooks/useProjectApi';
import BoardsSlider from 'components/sections/projects/boards/boards-slider/BoardsSlider';
import ProjectBoardsHeader from 'components/sections/projects/boards/page-header/ProjectBoardsHeader';

const ProjectBoards = () => {
  const { data: recentProjects, isLoading } = useRecentProjects(10);

  // Fallback empty state while loading
  const recentData = recentProjects || { id: 'recentProjects', title: 'Recent Projects', boards: [] };

  return (
    <>
      <ProjectBoardsHeader />
      <Stack direction="column">
        <BoardsSlider
          boardList={recentData}
          size="small"
          showControls
          isLoading={isLoading}
        />
      </Stack>
    </>
  );
};

export default ProjectBoards;
