/**
 * Mock data for CRM Leads
 *
 * Distribution:
 * - 3 new leads
 * - 3 contacted leads
 * - 3 qualified leads
 * - 2 unqualified leads
 * - 4 converted leads
 */

export const leads = [
  // NEW LEADS (3)
  {
    id: 'lead_001',
    name: 'Sarah Mitchell',
    company: 'TechVision Analytics',
    email: 'sarah.mitchell@techvision.com',
    phone: '+1 (415) 234-5678',
    source: 'website',
    status: 'new',
    notes: 'Submitted contact form requesting information about enterprise features and pricing.',
    qualification_notes: null,
    created_at: '2025-01-27T14:30:00Z',
    updated_at: '2025-01-27T14:30:00Z',
    organization_id: 'org_1',
  },
  {
    id: 'lead_002',
    name: 'Marcus Chen',
    company: 'GlobalTrade Solutions',
    email: 'marcus.chen@globaltrade.io',
    phone: '+1 (650) 789-0123',
    source: 'referral',
    status: 'new',
    notes: 'Referred by existing customer Victory Outfitters Ltd. Interested in supply chain management features.',
    qualification_notes: null,
    created_at: '2025-01-26T09:15:00Z',
    updated_at: '2025-01-26T09:15:00Z',
    organization_id: 'org_1',
  },
  {
    id: 'lead_003',
    name: 'Emma Rodriguez',
    company: 'Startup Incubator Network',
    email: 'emma@startupincubator.co',
    phone: null,
    source: 'event',
    status: 'new',
    notes: 'Met at SaaS Summit 2025. Looking for a solution for their portfolio companies. Requested demo.',
    qualification_notes: null,
    created_at: '2025-01-25T16:45:00Z',
    updated_at: '2025-01-25T16:45:00Z',
    organization_id: 'org_1',
  },

  // CONTACTED LEADS (3)
  {
    id: 'lead_004',
    name: 'David Park',
    company: 'HealthCare Innovations Inc',
    email: 'david.park@healthcareinnovations.com',
    phone: '+1 (408) 555-0199',
    source: 'cold_call',
    status: 'contacted',
    notes: 'Initial call made on 2025-01-22. Interested in compliance-focused features. Follow-up scheduled for next week.',
    qualification_notes: 'Budget: $50K-100K annually. Decision maker: VP of Operations. Timeline: Q1 2025',
    created_at: '2025-01-20T11:20:00Z',
    updated_at: '2025-01-22T14:30:00Z',
    organization_id: 'org_1',
  },
  {
    id: 'lead_005',
    name: 'Jennifer Walsh',
    company: 'EduTech Platform LLC',
    email: 'j.walsh@edutech-platform.com',
    phone: '+1 (512) 888-7766',
    source: 'social_media',
    status: 'contacted',
    notes: 'Engaged with LinkedIn post about automation features. Sent personalized email with case studies. Responded positively.',
    qualification_notes: 'Small team (15 people), looking for affordable solution. Budget constraints mentioned.',
    created_at: '2025-01-18T08:00:00Z',
    updated_at: '2025-01-23T10:15:00Z',
    organization_id: 'org_1',
  },
  {
    id: 'lead_006',
    name: 'Robert Thompson',
    company: 'Manufacturing Dynamics Corp',
    email: 'rthompson@manufacturing-dynamics.com',
    phone: '+1 (614) 321-9876',
    source: 'website',
    status: 'contacted',
    notes: 'Downloaded white paper on process optimization. Reached out via phone. Expressed interest in inventory tracking module.',
    qualification_notes: 'Large enterprise (500+ employees). Complex requirements. Multiple stakeholders.',
    created_at: '2025-01-15T13:45:00Z',
    updated_at: '2025-01-24T09:00:00Z',
    organization_id: 'org_1',
  },

  // QUALIFIED LEADS (3)
  {
    id: 'lead_007',
    name: 'Lisa Anderson',
    company: 'Financial Services Group',
    email: 'lisa.anderson@fsg.com',
    phone: '+1 (212) 555-0144',
    source: 'referral',
    status: 'qualified',
    notes: 'Referred by Bean Brew Ltd. Completed full product demo. Strong interest in reporting and analytics features.',
    qualification_notes: 'BANT qualified: Budget $150K, Authority: CFO approval secured, Need: Current system EOL, Timeline: 60 days',
    created_at: '2025-01-10T10:30:00Z',
    updated_at: '2025-01-26T15:20:00Z',
    organization_id: 'org_1',
  },
  {
    id: 'lead_008',
    name: 'Michael O\'Brien',
    company: 'Retail Chain Express',
    email: 'mobrien@retailchain.com',
    phone: '+1 (773) 444-5555',
    source: 'event',
    status: 'qualified',
    notes: 'Met at Retail Tech Conference. Attended two product demos. Currently evaluating alongside 2 competitors.',
    qualification_notes: 'Budget: $200K approved. Decision timeline: End of Q1. Key decision factors: Integration capabilities and mobile app.',
    created_at: '2025-01-08T14:00:00Z',
    updated_at: '2025-01-27T11:45:00Z',
    organization_id: 'org_1',
  },
  {
    id: 'lead_009',
    name: 'Patricia Kim',
    company: 'CloudOps Solutions',
    email: 'patricia.kim@cloudops.io',
    phone: '+1 (206) 777-8899',
    source: 'website',
    status: 'qualified',
    notes: 'Free trial user for 14 days. High engagement with advanced features. Requested enterprise pricing and contract terms.',
    qualification_notes: 'Budget confirmed: $100K+. Decision maker: CTO. Timeline: Immediate (trial expires in 5 days). High conversion probability.',
    created_at: '2025-01-05T09:00:00Z',
    updated_at: '2025-01-27T16:30:00Z',
    organization_id: 'org_1',
  },

  // UNQUALIFIED LEADS (2)
  {
    id: 'lead_010',
    name: 'Jason Miller',
    company: 'Small Business Consulting',
    email: 'jason@smallbizconsult.com',
    phone: '+1 (303) 123-4567',
    source: 'cold_call',
    status: 'unqualified',
    notes: 'Budget too small for enterprise solution. Looking for free or very low-cost option. Not a good fit for our product.',
    qualification_notes: 'Unqualified: Budget < $5K annually. Solo consultant, no team. Recommended alternative solutions.',
    created_at: '2025-01-12T11:00:00Z',
    updated_at: '2025-01-20T14:00:00Z',
    organization_id: 'org_1',
  },
  {
    id: 'lead_011',
    name: 'Amanda Foster',
    company: 'Nonprofit Community Center',
    email: 'afoster@communitycenter.org',
    phone: null,
    source: 'social_media',
    status: 'unqualified',
    notes: 'Looking for free nonprofit solution. Our product does not offer nonprofit pricing. Directed to alternative resources.',
    qualification_notes: 'Unqualified: No budget available. Nonprofit organization. Product not suitable for use case.',
    created_at: '2024-12-28T10:15:00Z',
    updated_at: '2025-01-15T09:30:00Z',
    organization_id: 'org_1',
  },

  // CONVERTED LEADS (4)
  {
    id: 'lead_012',
    name: 'William Harris',
    company: 'SwiftPay Systems',
    email: 'william.harris@swiftpay.com',
    phone: '+1 (415) 999-0001',
    source: 'referral',
    status: 'converted',
    notes: 'Converted to customer on 2024-12-20. Now tracked in deals pipeline (deal6: Next-Gen Payment Integration).',
    qualification_notes: 'Successfully qualified and converted. Contract value: $120K. Implementation started.',
    created_at: '2024-11-15T08:00:00Z',
    updated_at: '2024-12-20T16:00:00Z',
    organization_id: 'org_1',
  },
  {
    id: 'lead_013',
    name: 'Sophia Martinez',
    company: 'BrightWave Media',
    email: 'sophia.martinez@brightwave.com',
    phone: '+1 (323) 555-0177',
    source: 'website',
    status: 'converted',
    notes: 'Converted to customer on 2024-11-30. Signed contract for Digital Marketing Solutions package (deal3).',
    qualification_notes: 'Converted successfully. Deal value: $207.5K. Currently in contact stage.',
    created_at: '2024-10-01T12:30:00Z',
    updated_at: '2024-11-30T14:00:00Z',
    organization_id: 'org_1',
  },
  {
    id: 'lead_014',
    name: 'Christopher Lee',
    company: 'O-Ecopower Innovations',
    email: 'chris.lee@ecopower.com',
    phone: '+1 (512) 888-9999',
    source: 'event',
    status: 'converted',
    notes: 'Met at Green Energy Summit. Converted to customer on 2024-12-01. Now in opportunity stage (deal8: Sustainable Energy Solutions).',
    qualification_notes: 'Converted. Contract signed: $250K. Long sales cycle (6 months from first contact).',
    created_at: '2024-06-10T09:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
    organization_id: 'org_1',
  },
  {
    id: 'lead_015',
    name: 'Rachel Nguyen',
    company: 'UrbanNest Holdings',
    email: 'rachel.nguyen@urbannest.com',
    phone: '+1 (415) 777-6543',
    source: 'cold_call',
    status: 'converted',
    notes: 'Converted to customer on 2024-10-15. Deal closed for Cybersecurity Services package (deal7: $170.5K).',
    qualification_notes: 'Converted successfully. Quick conversion (2 months). Strong ROI case presented.',
    created_at: '2024-08-05T14:20:00Z',
    updated_at: '2024-10-15T11:00:00Z',
    organization_id: 'org_1',
  },
];

// Helper functions for filtering leads by status
export const getLeadsByStatus = (status) => {
  return leads.filter((lead) => lead.status === status);
};

export const getNewLeads = () => getLeadsByStatus('new');
export const getContactedLeads = () => getLeadsByStatus('contacted');
export const getQualifiedLeads = () => getLeadsByStatus('qualified');
export const getUnqualifiedLeads = () => getLeadsByStatus('unqualified');
export const getConvertedLeads = () => getLeadsByStatus('converted');

// Helper functions for filtering leads by source
export const getLeadsBySource = (source) => {
  return leads.filter((lead) => lead.source === source);
};

// Get lead statistics
export const getLeadStats = () => {
  return {
    total: leads.length,
    new: getNewLeads().length,
    contacted: getContactedLeads().length,
    qualified: getQualifiedLeads().length,
    unqualified: getUnqualifiedLeads().length,
    converted: getConvertedLeads().length,
  };
};

export const getLeadSourceStats = () => {
  const sources = ['website', 'referral', 'event', 'cold_call', 'social_media', 'other'];
  return sources.reduce((acc, source) => {
    acc[source] = getLeadsBySource(source).length;
    return acc;
  }, {});
};
