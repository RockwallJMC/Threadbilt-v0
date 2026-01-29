'use client';

import CRMDashboardProvider from 'providers/CRMDashboardProvider';
import DashboardLayout from 'components/sections/crm/dashboard/DashboardLayout';

/**
 * CRM Dashboard Page
 * Phase 1.7.1: Core infrastructure with placeholder widgets
 * Actual widget implementations will be added in Phases 1.7.2-1.7.5
 */
export default function CRMDashboardPage() {
  return (
    <CRMDashboardProvider>
      <DashboardLayout />
    </CRMDashboardProvider>
  );
}
