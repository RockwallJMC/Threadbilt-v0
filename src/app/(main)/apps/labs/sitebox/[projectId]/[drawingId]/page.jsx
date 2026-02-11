'use client';

import { use } from 'react';
import SiteBox from 'components/sections/labs/sitebox/SiteBox';

const SiteBoxPage = ({ params }) => {
  const { projectId, drawingId } = use(params);

  return <SiteBox projectId={projectId} drawingId={drawingId} />;
};

export default SiteBoxPage;
