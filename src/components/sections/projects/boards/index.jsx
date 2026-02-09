import { Stack } from '@mui/material';
import { recentProjects, userProjects, sharedProjects } from 'data/projects/boards';
import BoardsSlider from 'components/sections/projects/boards/boards-slider/BoardsSlider';
import ProjectBoardsHeader from 'components/sections/projects/boards/page-header/ProjectBoardsHeader';

const ProjectBoards = () => {
  return (
    <>
      <ProjectBoardsHeader />
      <Stack direction="column">
        <BoardsSlider boardList={recentProjects} size="small" />
        <BoardsSlider boardList={userProjects} />
        <BoardsSlider boardList={sharedProjects} />
      </Stack>
    </>
  );
};

export default ProjectBoards;
