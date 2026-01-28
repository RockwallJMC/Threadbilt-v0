'use client';

import LeadDetails from 'components/sections/crm/lead-details';
import PropTypes from 'prop-types';

const Page = ({ params }) => {
  const { id } = params;
  return <LeadDetails id={id} />;
};

Page.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};
export default Page;
