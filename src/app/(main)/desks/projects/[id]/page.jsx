import ProjectDetail from 'components/sections/projects/project-detail';

const Page = ({ params }) => {
  return <ProjectDetail projectId={params.id} />;
};

export default Page;
