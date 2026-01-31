'use client';

import SplitScreenLayout from 'layouts/split-screen-layout/SplitScreenLayout';
import CRM from 'components/sections/dashboards/crm';
import Deals from 'components/sections/crm/deals';

/**
 * Combined CRM Overview Page
 *
 * Displays CRM dashboard analytics on the left and deals kanban board on the right.
 * Uses SplitScreenLayout for responsive 50/50 split on desktop, stacked on mobile.
 */
const CRMPage = () => {
  const leftContent = <CRM />;
  const rightContent = <Deals />;

  return (
    <SplitScreenLayout
      leftChild={leftContent}
      rightChild={rightContent}
    />
  );
};

export default CRMPage;
