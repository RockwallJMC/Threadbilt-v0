/**
 * Mock proposal data for Phase 1.6
 *
 * 10 proposals across all statuses linked to Phase 1.5 opportunities
 * Status distribution: 2 draft, 3 sent, 2 accepted, 2 rejected, 1 expired
 *
 * TODO: Replace with Supabase queries after Phase 1.2 complete
 */

import { DEFAULT_TERMS_TEMPLATE } from 'constants/crm/proposalDefaults';

/**
 * Mock proposals with pre-calculated totals
 * Each proposal links to an opportunity from Phase 1.5 mock data
 */
export const mockProposals = [
  // DRAFT PROPOSALS (2)
  {
    id: 'prop_001',
    organization_id: 'org_001',
    opportunity_id: 'opportunity5', // Official Licensing Agreement (Proposal stage)
    proposal_number: 'PROP-2026-001',
    title: 'Official Licensing Agreement Proposal',
    description: 'Comprehensive licensing package for official branded merchandise and distribution rights.',
    status: 'draft',
    subtotal: 140500.00,
    tax_rate: 8.25,
    tax_amount: 11591.25,
    total_amount: 152091.25,
    valid_until: '2026-03-15',
    terms_and_conditions: DEFAULT_TERMS_TEMPLATE,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-20T14:30:00Z',
    sent_at: null,
    accepted_at: null,
    rejected_at: null,
  },
  {
    id: 'prop_002',
    organization_id: 'org_001',
    opportunity_id: 'opportunity6', // Next-Gen Payment Integration (Proposal stage)
    proposal_number: 'PROP-2026-002',
    title: 'Next-Gen Payment Integration Services',
    description: 'Complete payment gateway integration with advanced fraud detection and multi-currency support.',
    status: 'draft',
    subtotal: 120000.00,
    tax_rate: 0,
    tax_amount: 0,
    total_amount: 120000.00,
    valid_until: '2026-03-20',
    terms_and_conditions: DEFAULT_TERMS_TEMPLATE,
    created_at: '2026-01-18T09:00:00Z',
    updated_at: '2026-01-25T16:45:00Z',
    sent_at: null,
    accepted_at: null,
    rejected_at: null,
  },

  // SENT PROPOSALS (3)
  {
    id: 'prop_003',
    organization_id: 'org_001',
    opportunity_id: 'opportunity7', // Cybersecurity Services (Proposal stage)
    proposal_number: 'PROP-2026-003',
    title: 'Enterprise Cybersecurity Services Package',
    description: 'Comprehensive cybersecurity assessment, implementation, and ongoing monitoring services.',
    status: 'sent',
    subtotal: 170500.00,
    tax_rate: 7.5,
    tax_amount: 12787.50,
    total_amount: 183287.50,
    valid_until: '2026-02-28',
    terms_and_conditions: DEFAULT_TERMS_TEMPLATE,
    created_at: '2026-01-10T11:00:00Z',
    updated_at: '2026-01-12T10:00:00Z',
    sent_at: '2026-01-12T10:00:00Z',
    accepted_at: null,
    rejected_at: null,
  },
  {
    id: 'prop_004',
    organization_id: 'org_001',
    opportunity_id: 'opportunity8', // Cloud Infrastructure Upgrade (Proposal stage)
    proposal_number: 'PROP-2026-004',
    title: 'Cloud Infrastructure Migration & Upgrade',
    description: 'Complete migration to cloud infrastructure with enhanced security and scalability.',
    status: 'sent',
    subtotal: 195000.00,
    tax_rate: 8.25,
    tax_amount: 16087.50,
    total_amount: 211087.50,
    valid_until: '2026-03-10',
    terms_and_conditions: DEFAULT_TERMS_TEMPLATE,
    created_at: '2026-01-08T13:30:00Z',
    updated_at: '2026-01-15T09:00:00Z',
    sent_at: '2026-01-15T09:00:00Z',
    accepted_at: null,
    rejected_at: null,
  },
  {
    id: 'prop_005',
    organization_id: 'org_001',
    opportunity_id: 'opportunity9', // Almost Original Mike Boots (Negotiation stage)
    proposal_number: 'PROP-2026-005',
    title: 'Premium Footwear Manufacturing Agreement',
    description: 'Manufacturing and distribution agreement for premium athletic footwear line.',
    status: 'sent',
    subtotal: 250000.00,
    tax_rate: 0,
    tax_amount: 0,
    total_amount: 250000.00,
    valid_until: '2026-02-25',
    terms_and_conditions: DEFAULT_TERMS_TEMPLATE,
    created_at: '2026-01-05T08:00:00Z',
    updated_at: '2026-01-10T14:20:00Z',
    sent_at: '2026-01-10T14:20:00Z',
    accepted_at: null,
    rejected_at: null,
  },

  // ACCEPTED PROPOSALS (2)
  {
    id: 'prop_006',
    organization_id: 'org_001',
    opportunity_id: 'opportunity13', // E-commerce Payment Gateway (Closed Won)
    proposal_number: 'PROP-2026-006',
    title: 'E-commerce Payment Gateway Integration',
    description: 'Complete payment processing solution for e-commerce platform.',
    status: 'accepted',
    subtotal: 150000.00,
    tax_rate: 8.25,
    tax_amount: 12375.00,
    total_amount: 162375.00,
    valid_until: '2026-02-15',
    terms_and_conditions: DEFAULT_TERMS_TEMPLATE,
    created_at: '2025-12-01T10:00:00Z',
    updated_at: '2025-12-15T11:30:00Z',
    sent_at: '2025-12-10T09:00:00Z',
    accepted_at: '2025-12-15T11:30:00Z',
    rejected_at: null,
  },
  {
    id: 'prop_007',
    organization_id: 'org_001',
    opportunity_id: 'opportunity14', // High-Performance Gear Agreement (Closed Won)
    proposal_number: 'PROP-2026-007',
    title: 'High-Performance Athletic Gear Supply Agreement',
    description: 'Multi-year supply agreement for high-performance athletic equipment.',
    status: 'accepted',
    subtotal: 180500.00,
    tax_rate: 7.5,
    tax_amount: 13537.50,
    total_amount: 194037.50,
    valid_until: '2026-01-31',
    terms_and_conditions: DEFAULT_TERMS_TEMPLATE,
    created_at: '2025-12-15T14:00:00Z',
    updated_at: '2026-01-05T10:00:00Z',
    sent_at: '2025-12-20T13:00:00Z',
    accepted_at: '2026-01-05T10:00:00Z',
    rejected_at: null,
  },

  // REJECTED PROPOSALS (2)
  {
    id: 'prop_008',
    organization_id: 'org_001',
    opportunity_id: 'opportunity16', // Replica Badidas Futbol (Closed Lost)
    proposal_number: 'PROP-2026-008',
    title: 'Sports Equipment Supply Proposal',
    description: 'Bulk sports equipment supply and distribution agreement.',
    status: 'rejected',
    subtotal: 125000.00,
    tax_rate: 8.25,
    tax_amount: 10312.50,
    total_amount: 135312.50,
    valid_until: '2025-11-30',
    terms_and_conditions: DEFAULT_TERMS_TEMPLATE,
    created_at: '2025-10-01T09:00:00Z',
    updated_at: '2025-10-15T16:00:00Z',
    sent_at: '2025-10-10T11:00:00Z',
    accepted_at: null,
    rejected_at: '2025-10-15T16:00:00Z',
  },
  {
    id: 'prop_009',
    organization_id: 'org_001',
    opportunity_id: 'opportunity17', // Budget Fitness Equipment (Closed Lost)
    proposal_number: 'PROP-2026-009',
    title: 'Budget Fitness Equipment Package',
    description: 'Cost-effective fitness equipment supply for budget-conscious clients.',
    status: 'rejected',
    subtotal: 95000.00,
    tax_rate: 0,
    tax_amount: 0,
    total_amount: 95000.00,
    valid_until: '2025-09-15',
    terms_and_conditions: DEFAULT_TERMS_TEMPLATE,
    created_at: '2025-08-01T10:30:00Z',
    updated_at: '2025-08-18T14:00:00Z',
    sent_at: '2025-08-10T09:00:00Z',
    accepted_at: null,
    rejected_at: '2025-08-18T14:00:00Z',
  },

  // EXPIRED PROPOSAL (1)
  {
    id: 'prop_010',
    organization_id: 'org_001',
    opportunity_id: 'opportunity10', // Exclusive Sportswear Distribution (Negotiation stage)
    proposal_number: 'PROP-2026-010',
    title: 'Exclusive Sportswear Distribution Rights',
    description: 'Exclusive distribution agreement for premium sportswear line in North America.',
    status: 'expired',
    subtotal: 270500.00,
    tax_rate: 8.25,
    tax_amount: 22316.25,
    total_amount: 292816.25,
    valid_until: '2026-01-15', // Expired
    terms_and_conditions: DEFAULT_TERMS_TEMPLATE,
    created_at: '2025-12-10T11:00:00Z',
    updated_at: '2025-12-20T15:00:00Z',
    sent_at: '2025-12-20T15:00:00Z',
    accepted_at: null,
    rejected_at: null,
  },
];

/**
 * Mock proposal line items
 * Each proposal has 3-7 line items with varied item_types
 */
export const mockProposalLineItems = [
  // PROP_001 Line Items (5 items)
  {
    id: 'item_001',
    proposal_id: 'prop_001',
    item_type: 'service',
    description: 'Licensing Rights - Year 1',
    quantity: 1,
    unit_price: 50000.00,
    total_price: 50000.00,
    sort_order: 0,
    is_optional: false,
  },
  {
    id: 'item_002',
    proposal_id: 'prop_001',
    item_type: 'service',
    description: 'Brand Guidelines & Asset Package',
    quantity: 1,
    unit_price: 15000.00,
    total_price: 15000.00,
    sort_order: 1,
    is_optional: false,
  },
  {
    id: 'item_003',
    proposal_id: 'prop_001',
    item_type: 'service',
    description: 'Marketing Support & Co-Branding',
    quantity: 12,
    unit_price: 5000.00,
    total_price: 60000.00,
    sort_order: 2,
    is_optional: false,
  },
  {
    id: 'item_004',
    proposal_id: 'prop_001',
    item_type: 'service',
    description: 'Quarterly Performance Reviews',
    quantity: 4,
    unit_price: 2500.00,
    total_price: 10000.00,
    sort_order: 3,
    is_optional: false,
  },
  {
    id: 'item_005',
    proposal_id: 'prop_001',
    item_type: 'optional',
    description: 'Additional Territory Rights (Optional)',
    quantity: 1,
    unit_price: 5500.00,
    total_price: 5500.00,
    sort_order: 4,
    is_optional: true,
  },

  // PROP_002 Line Items (4 items)
  {
    id: 'item_006',
    proposal_id: 'prop_002',
    item_type: 'service',
    description: 'Payment Gateway Integration',
    quantity: 1,
    unit_price: 40000.00,
    total_price: 40000.00,
    sort_order: 0,
    is_optional: false,
  },
  {
    id: 'item_007',
    proposal_id: 'prop_002',
    item_type: 'service',
    description: 'Fraud Detection System Setup',
    quantity: 1,
    unit_price: 25000.00,
    total_price: 25000.00,
    sort_order: 1,
    is_optional: false,
  },
  {
    id: 'item_008',
    proposal_id: 'prop_002',
    item_type: 'service',
    description: 'Multi-Currency Support Implementation',
    quantity: 1,
    unit_price: 30000.00,
    total_price: 30000.00,
    sort_order: 2,
    is_optional: false,
  },
  {
    id: 'item_009',
    proposal_id: 'prop_002',
    item_type: 'service',
    description: 'Testing & Quality Assurance',
    quantity: 1,
    unit_price: 25000.00,
    total_price: 25000.00,
    sort_order: 3,
    is_optional: false,
  },

  // PROP_003 Line Items (6 items)
  {
    id: 'item_010',
    proposal_id: 'prop_003',
    item_type: 'service',
    description: 'Security Assessment & Vulnerability Testing',
    quantity: 1,
    unit_price: 35000.00,
    total_price: 35000.00,
    sort_order: 0,
    is_optional: false,
  },
  {
    id: 'item_011',
    proposal_id: 'prop_003',
    item_type: 'equipment',
    description: 'Enterprise Firewall Hardware',
    quantity: 2,
    unit_price: 15000.00,
    total_price: 30000.00,
    sort_order: 1,
    is_optional: false,
  },
  {
    id: 'item_012',
    proposal_id: 'prop_003',
    item_type: 'service',
    description: 'Security Infrastructure Implementation',
    quantity: 1,
    unit_price: 45000.00,
    total_price: 45000.00,
    sort_order: 2,
    is_optional: false,
  },
  {
    id: 'item_013',
    proposal_id: 'prop_003',
    item_type: 'service',
    description: 'Staff Security Training',
    quantity: 10,
    unit_price: 1500.00,
    total_price: 15000.00,
    sort_order: 3,
    is_optional: false,
  },
  {
    id: 'item_014',
    proposal_id: 'prop_003',
    item_type: 'service',
    description: 'Ongoing Monitoring & Support (12 months)',
    quantity: 12,
    unit_price: 3000.00,
    total_price: 36000.00,
    sort_order: 4,
    is_optional: false,
  },
  {
    id: 'item_015',
    proposal_id: 'prop_003',
    item_type: 'optional',
    description: 'Advanced Threat Intelligence Subscription (Optional)',
    quantity: 1,
    unit_price: 9500.00,
    total_price: 9500.00,
    sort_order: 5,
    is_optional: true,
  },

  // PROP_004 Line Items (7 items)
  {
    id: 'item_016',
    proposal_id: 'prop_004',
    item_type: 'service',
    description: 'Cloud Migration Planning & Architecture',
    quantity: 1,
    unit_price: 30000.00,
    total_price: 30000.00,
    sort_order: 0,
    is_optional: false,
  },
  {
    id: 'item_017',
    proposal_id: 'prop_004',
    item_type: 'service',
    description: 'Data Migration Services',
    quantity: 1,
    unit_price: 45000.00,
    total_price: 45000.00,
    sort_order: 1,
    is_optional: false,
  },
  {
    id: 'item_018',
    proposal_id: 'prop_004',
    item_type: 'service',
    description: 'Application Modernization',
    quantity: 1,
    unit_price: 50000.00,
    total_price: 50000.00,
    sort_order: 2,
    is_optional: false,
  },
  {
    id: 'item_019',
    proposal_id: 'prop_004',
    item_type: 'service',
    description: 'Security Configuration & Hardening',
    quantity: 1,
    unit_price: 25000.00,
    total_price: 25000.00,
    sort_order: 3,
    is_optional: false,
  },
  {
    id: 'item_020',
    proposal_id: 'prop_004',
    item_type: 'service',
    description: 'Performance Optimization',
    quantity: 1,
    unit_price: 20000.00,
    total_price: 20000.00,
    sort_order: 4,
    is_optional: false,
  },
  {
    id: 'item_021',
    proposal_id: 'prop_004',
    item_type: 'service',
    description: 'Staff Training & Knowledge Transfer',
    quantity: 15,
    unit_price: 1000.00,
    total_price: 15000.00,
    sort_order: 5,
    is_optional: false,
  },
  {
    id: 'item_022',
    proposal_id: 'prop_004',
    item_type: 'optional',
    description: 'Disaster Recovery Setup (Optional)',
    quantity: 1,
    unit_price: 10000.00,
    total_price: 10000.00,
    sort_order: 6,
    is_optional: true,
  },

  // PROP_005 Line Items (3 items)
  {
    id: 'item_023',
    proposal_id: 'prop_005',
    item_type: 'material',
    description: 'Premium Materials & Components',
    quantity: 5000,
    unit_price: 30.00,
    total_price: 150000.00,
    sort_order: 0,
    is_optional: false,
  },
  {
    id: 'item_024',
    proposal_id: 'prop_005',
    item_type: 'labor',
    description: 'Manufacturing & Assembly',
    quantity: 5000,
    unit_price: 15.00,
    total_price: 75000.00,
    sort_order: 1,
    is_optional: false,
  },
  {
    id: 'item_025',
    proposal_id: 'prop_005',
    item_type: 'service',
    description: 'Quality Control & Packaging',
    quantity: 5000,
    unit_price: 5.00,
    total_price: 25000.00,
    sort_order: 2,
    is_optional: false,
  },

  // PROP_006 Line Items (5 items)
  {
    id: 'item_026',
    proposal_id: 'prop_006',
    item_type: 'service',
    description: 'Payment Gateway Integration',
    quantity: 1,
    unit_price: 50000.00,
    total_price: 50000.00,
    sort_order: 0,
    is_optional: false,
  },
  {
    id: 'item_027',
    proposal_id: 'prop_006',
    item_type: 'service',
    description: 'PCI Compliance Configuration',
    quantity: 1,
    unit_price: 30000.00,
    total_price: 30000.00,
    sort_order: 1,
    is_optional: false,
  },
  {
    id: 'item_028',
    proposal_id: 'prop_006',
    item_type: 'service',
    description: 'Transaction Processing Setup',
    quantity: 1,
    unit_price: 35000.00,
    total_price: 35000.00,
    sort_order: 2,
    is_optional: false,
  },
  {
    id: 'item_029',
    proposal_id: 'prop_006',
    item_type: 'service',
    description: 'API Integration & Testing',
    quantity: 1,
    unit_price: 25000.00,
    total_price: 25000.00,
    sort_order: 3,
    is_optional: false,
  },
  {
    id: 'item_030',
    proposal_id: 'prop_006',
    item_type: 'service',
    description: 'Go-Live Support',
    quantity: 1,
    unit_price: 10000.00,
    total_price: 10000.00,
    sort_order: 4,
    is_optional: false,
  },

  // PROP_007 Line Items (4 items)
  {
    id: 'item_031',
    proposal_id: 'prop_007',
    item_type: 'material',
    description: 'High-Performance Athletic Gear - Year 1',
    quantity: 1,
    unit_price: 100000.00,
    total_price: 100000.00,
    sort_order: 0,
    is_optional: false,
  },
  {
    id: 'item_032',
    proposal_id: 'prop_007',
    item_type: 'material',
    description: 'Specialized Equipment Components',
    quantity: 500,
    unit_price: 100.00,
    total_price: 50000.00,
    sort_order: 1,
    is_optional: false,
  },
  {
    id: 'item_033',
    proposal_id: 'prop_007',
    item_type: 'service',
    description: 'Custom Branding & Packaging',
    quantity: 1,
    unit_price: 20000.00,
    total_price: 20000.00,
    sort_order: 2,
    is_optional: false,
  },
  {
    id: 'item_034',
    proposal_id: 'prop_007',
    item_type: 'service',
    description: 'Delivery & Installation Services',
    quantity: 1,
    unit_price: 10500.00,
    total_price: 10500.00,
    sort_order: 3,
    is_optional: false,
  },

  // PROP_008 Line Items (3 items)
  {
    id: 'item_035',
    proposal_id: 'prop_008',
    item_type: 'material',
    description: 'Sports Equipment - Bulk Order',
    quantity: 1000,
    unit_price: 100.00,
    total_price: 100000.00,
    sort_order: 0,
    is_optional: false,
  },
  {
    id: 'item_036',
    proposal_id: 'prop_008',
    item_type: 'service',
    description: 'Shipping & Handling',
    quantity: 1,
    unit_price: 15000.00,
    total_price: 15000.00,
    sort_order: 1,
    is_optional: false,
  },
  {
    id: 'item_037',
    proposal_id: 'prop_008',
    item_type: 'service',
    description: 'Warehousing & Distribution',
    quantity: 1,
    unit_price: 10000.00,
    total_price: 10000.00,
    sort_order: 2,
    is_optional: false,
  },

  // PROP_009 Line Items (3 items)
  {
    id: 'item_038',
    proposal_id: 'prop_009',
    item_type: 'equipment',
    description: 'Budget Fitness Equipment Package',
    quantity: 50,
    unit_price: 1500.00,
    total_price: 75000.00,
    sort_order: 0,
    is_optional: false,
  },
  {
    id: 'item_039',
    proposal_id: 'prop_009',
    item_type: 'service',
    description: 'Delivery & Basic Setup',
    quantity: 1,
    unit_price: 10000.00,
    total_price: 10000.00,
    sort_order: 1,
    is_optional: false,
  },
  {
    id: 'item_040',
    proposal_id: 'prop_009',
    item_type: 'service',
    description: 'Basic Maintenance Package (6 months)',
    quantity: 1,
    unit_price: 10000.00,
    total_price: 10000.00,
    sort_order: 2,
    is_optional: false,
  },

  // PROP_010 Line Items (6 items)
  {
    id: 'item_041',
    proposal_id: 'prop_010',
    item_type: 'service',
    description: 'Exclusive Distribution Rights - Year 1',
    quantity: 1,
    unit_price: 150000.00,
    total_price: 150000.00,
    sort_order: 0,
    is_optional: false,
  },
  {
    id: 'item_042',
    proposal_id: 'prop_010',
    item_type: 'material',
    description: 'Initial Product Inventory',
    quantity: 2000,
    unit_price: 40.00,
    total_price: 80000.00,
    sort_order: 1,
    is_optional: false,
  },
  {
    id: 'item_043',
    proposal_id: 'prop_010',
    item_type: 'service',
    description: 'Marketing & Brand Support',
    quantity: 1,
    unit_price: 20000.00,
    total_price: 20000.00,
    sort_order: 2,
    is_optional: false,
  },
  {
    id: 'item_044',
    proposal_id: 'prop_010',
    item_type: 'service',
    description: 'Territory Management Software',
    quantity: 1,
    unit_price: 10000.00,
    total_price: 10000.00,
    sort_order: 3,
    is_optional: false,
  },
  {
    id: 'item_045',
    proposal_id: 'prop_010',
    item_type: 'service',
    description: 'Quarterly Business Reviews',
    quantity: 4,
    unit_price: 2000.00,
    total_price: 8000.00,
    sort_order: 4,
    is_optional: false,
  },
  {
    id: 'item_046',
    proposal_id: 'prop_010',
    item_type: 'optional',
    description: 'Additional Territory Expansion (Optional)',
    quantity: 1,
    unit_price: 2500.00,
    total_price: 2500.00,
    sort_order: 5,
    is_optional: true,
  },
];

/**
 * Helper function to get a proposal by ID
 *
 * @param {string} id - Proposal ID
 * @returns {Object|undefined} Proposal object or undefined if not found
 *
 * TODO: Replace with Supabase query after Phase 1.2
 */
export const getProposalById = (id) => {
  return mockProposals.find((proposal) => proposal.id === id);
};

/**
 * Helper function to get all proposals for an opportunity
 *
 * @param {string} opportunityId - Opportunity ID
 * @returns {Array} Array of proposal objects
 *
 * TODO: Replace with Supabase query after Phase 1.2
 */
export const getProposalsByOpportunityId = (opportunityId) => {
  return mockProposals.filter((proposal) => proposal.opportunity_id === opportunityId);
};

/**
 * Helper function to get all proposals by status
 *
 * @param {string} status - Status value ('draft', 'sent', 'accepted', 'rejected', 'expired')
 * @returns {Array} Array of proposal objects
 *
 * TODO: Replace with Supabase query after Phase 1.2
 */
export const getProposalsByStatus = (status) => {
  return mockProposals.filter((proposal) => proposal.status === status);
};

/**
 * Helper function to get line items for a proposal
 *
 * @param {string} proposalId - Proposal ID
 * @returns {Array} Array of line item objects sorted by sort_order
 *
 * TODO: Replace with Supabase query after Phase 1.2
 */
export const getLineItemsByProposalId = (proposalId) => {
  return mockProposalLineItems
    .filter((item) => item.proposal_id === proposalId)
    .sort((a, b) => a.sort_order - b.sort_order);
};

/**
 * Helper function to get a proposal with its line items
 *
 * @param {string} id - Proposal ID
 * @returns {Object|null} Proposal object with line_items array or null if not found
 *
 * TODO: Replace with Supabase query with JOIN after Phase 1.2
 */
export const getProposalWithLineItems = (id) => {
  const proposal = getProposalById(id);
  if (!proposal) return null;

  return {
    ...proposal,
    line_items: getLineItemsByProposalId(id),
  };
};
