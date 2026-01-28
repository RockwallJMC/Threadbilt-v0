'use client';

import LeadDetails from 'components/sections/crm/lead-details';

const Page = ({ params }) => {
  const { id } = params;
  return <LeadDetails id={id} />;
};

export default Page;
