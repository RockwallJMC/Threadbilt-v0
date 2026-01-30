'use client';

import ProjectTasksKanban from '../tasks/ProjectTasksKanban';

const ProjectTasks = ({ project }) => {
  return <ProjectTasksKanban projectId={project.id} />;
};

export default ProjectTasks;
