'use client';

import { use } from 'react';
import ProposalDetail from 'components/sections/crm/proposal-detail/ProposalDetail';

const ProposalDetailPage = ({ params }) => {
  const { id } = use(params);

  return <ProposalDetail proposalId={id} />;
};

export default ProposalDetailPage;
