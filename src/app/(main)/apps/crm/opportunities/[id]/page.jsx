'use client';

import OpportunityDetails from 'components/sections/crm/opportunity-details';
import PropTypes from 'prop-types';

const Page = ({ params }) => {
  const { id } = params;
  return <OpportunityDetails id={id} />;
};

Page.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};

export default Page;
