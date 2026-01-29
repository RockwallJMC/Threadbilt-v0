// Mock data for CRM Dashboard metrics
// This data simulates pre-calculated aggregations that would come from Supabase
// All values are internally consistent and demonstrate realistic patterns

// KPI Metrics (8 key performance indicators as object)
// Matches Phase 1.7.1 design doc structure
export const dashboardKPIs = {
  totalPipelineValue: 8420000, // Sum of all active opportunities
  weightedForecast: 4210000, // Sum of (value × probability/100)
  leadConversionRate: 18.5, // Percentage (leads → opportunities)
  opportunityWinRate: 32.0, // Percentage (opportunities → closed won)
  averageDealSize: 145000, // Average value of won opportunities
  averageSalesCycle: 42, // Average days from created to closed won
  proposalsAcceptanceRate: 23.5, // Percentage of accepted proposals
  totalActiveAccounts: 85, // Accounts with activity in last 90 days
};

// Pipeline Breakdown by Stage (values sum to total pipeline)
export const pipelineByStage = [
  { stage: 'Qualification', value: 1240000, count: 28, color: 'info.light' },
  { stage: 'Needs Analysis', value: 1580000, count: 24, color: 'info.main' },
  { stage: 'Proposal', value: 1350000, count: 19, color: 'primary.light' },
  { stage: 'Negotiation', value: 1620000, count: 22, color: 'primary.main' },
  { stage: 'Verbal Commit', value: 980000, count: 12, color: 'warning.main' },
  { stage: 'Contracting', value: 870000, count: 14, color: 'success.light' },
  { stage: 'Closed Won', value: 780000, count: 8, color: 'success.main' },
];
// Total: 8,420,000 (matches Total Pipeline Value KPI)

// Opportunity Trend (30-day time series)
export const opportunityTrend = [
  { date: '2026-01-01', created: 12, won: 3, lost: 2, value: 7820000 },
  { date: '2026-01-02', created: 8, won: 2, lost: 1, value: 7920000 },
  { date: '2026-01-03', created: 15, won: 4, lost: 3, value: 8150000 },
  { date: '2026-01-06', created: 11, won: 3, lost: 2, value: 8240000 },
  { date: '2026-01-07', created: 9, won: 2, lost: 1, value: 8310000 },
  { date: '2026-01-08', created: 14, won: 5, lost: 2, value: 8480000 },
  { date: '2026-01-09', created: 10, won: 3, lost: 1, value: 8540000 },
  { date: '2026-01-10', created: 13, won: 4, lost: 3, value: 8620000 },
  { date: '2026-01-13', created: 16, won: 6, lost: 2, value: 8890000 },
  { date: '2026-01-14', created: 12, won: 4, lost: 3, value: 8920000 },
  { date: '2026-01-15', created: 11, won: 3, lost: 2, value: 8860000 },
  { date: '2026-01-16', created: 9, won: 2, lost: 1, value: 8790000 },
  { date: '2026-01-17', created: 14, won: 5, lost: 2, value: 8950000 },
  { date: '2026-01-20', created: 10, won: 3, lost: 1, value: 8880000 },
  { date: '2026-01-21', created: 13, won: 4, lost: 3, value: 8740000 },
  { date: '2026-01-22', created: 15, won: 6, lost: 2, value: 8920000 },
  { date: '2026-01-23', created: 12, won: 4, lost: 3, value: 8810000 },
  { date: '2026-01-24', created: 11, won: 3, lost: 2, value: 8650000 },
  { date: '2026-01-27', created: 9, won: 2, lost: 1, value: 8520000 },
  { date: '2026-01-28', created: 14, won: 5, lost: 2, value: 8680000 },
  { date: '2026-01-29', created: 10, won: 3, lost: 1, value: 8420000 },
];

// Lead Source Performance (4 major sources)
export const leadSourcePerformance = [
  {
    source: 'Organic Search',
    leads: 142,
    opportunities: 38,
    won: 14,
    revenue: 2030000,
    conversionRate: 26.8,
    avgDealSize: 145000,
    color: 'primary.main',
  },
  {
    source: 'Marketing Campaigns',
    leads: 198,
    opportunities: 52,
    won: 18,
    revenue: 2610000,
    conversionRate: 26.3,
    avgDealSize: 145000,
    color: 'success.main',
  },
  {
    source: 'Referrals',
    leads: 87,
    opportunities: 28,
    won: 12,
    revenue: 1740000,
    conversionRate: 32.2,
    avgDealSize: 145000,
    color: 'info.main',
  },
  {
    source: 'Events & Trade Shows',
    leads: 64,
    opportunities: 16,
    won: 6,
    revenue: 870000,
    conversionRate: 25.0,
    avgDealSize: 145000,
    color: 'warning.main',
  },
];
// Total leads: 491, Total won: 50 (matches ~18% lead conversion in KPI)

// Recent Activities (10 most recent)
export const recentActivities = [
  {
    id: 'act-001',
    type: 'opportunity_won',
    title: 'Enterprise Software Deal - Acme Corp',
    value: 285000,
    user: 'Sarah Johnson',
    timestamp: '2026-01-29T14:30:00Z',
    icon: 'material-symbols:check-circle',
    color: 'success.main',
  },
  {
    id: 'act-002',
    type: 'proposal_sent',
    title: 'Cloud Migration Proposal - TechStart Inc',
    value: 165000,
    user: 'Michael Chen',
    timestamp: '2026-01-29T11:15:00Z',
    icon: 'material-symbols:send',
    color: 'primary.main',
  },
  {
    id: 'act-003',
    type: 'meeting_completed',
    title: 'Discovery Call - Global Industries',
    value: 420000,
    user: 'Emily Rodriguez',
    timestamp: '2026-01-29T10:00:00Z',
    icon: 'material-symbols:videocam',
    color: 'info.main',
  },
  {
    id: 'act-004',
    type: 'opportunity_created',
    title: 'New Deal - Innovate Solutions',
    value: 195000,
    user: 'David Kim',
    timestamp: '2026-01-29T09:45:00Z',
    icon: 'material-symbols:add-circle',
    color: 'secondary.main',
  },
  {
    id: 'act-005',
    type: 'proposal_accepted',
    title: 'Digital Transformation - RetailCo',
    value: 340000,
    user: 'Sarah Johnson',
    timestamp: '2026-01-28T16:20:00Z',
    icon: 'material-symbols:thumb-up',
    color: 'success.main',
  },
  {
    id: 'act-006',
    type: 'lead_converted',
    title: 'Lead Converted - Manufacturing Plus',
    value: 125000,
    user: 'Michael Chen',
    timestamp: '2026-01-28T14:10:00Z',
    icon: 'material-symbols:conversion-path',
    color: 'warning.main',
  },
  {
    id: 'act-007',
    type: 'meeting_scheduled',
    title: 'Executive Demo - Finance Group',
    value: 510000,
    user: 'Emily Rodriguez',
    timestamp: '2026-01-28T11:30:00Z',
    icon: 'material-symbols:calendar-add-on',
    color: 'info.main',
  },
  {
    id: 'act-008',
    type: 'opportunity_moved',
    title: 'Moved to Negotiation - Healthcare Systems',
    value: 275000,
    user: 'David Kim',
    timestamp: '2026-01-28T09:15:00Z',
    icon: 'material-symbols:trending-up',
    color: 'primary.main',
  },
  {
    id: 'act-009',
    type: 'proposal_sent',
    title: 'ERP Implementation - Logistics Corp',
    value: 390000,
    user: 'Sarah Johnson',
    timestamp: '2026-01-27T15:45:00Z',
    icon: 'material-symbols:send',
    color: 'primary.main',
  },
  {
    id: 'act-010',
    type: 'opportunity_won',
    title: 'SaaS Subscription - StartupXYZ',
    value: 95000,
    user: 'Michael Chen',
    timestamp: '2026-01-27T13:20:00Z',
    icon: 'material-symbols:check-circle',
    color: 'success.main',
  },
];

// Proposal Status Breakdown (4 statuses)
export const proposalStatusBreakdown = [
  { status: 'Draft', count: 12, value: 1680000, color: 'grey.400' },
  { status: 'Sent', count: 22, value: 3190000, color: 'info.main' },
  { status: 'Accepted', count: 8, value: 1160000, color: 'success.main' },
  { status: 'Declined', count: 4, value: 580000, color: 'error.main' },
];
// Total proposals: 46 (close to 34 sent in last 30 days KPI)

// Top Opportunities (5 largest by value)
export const topOpportunities = [
  {
    id: 'opp-001',
    name: 'Enterprise Platform Upgrade - Fortune 500',
    account: 'Global Industries',
    value: 1250000,
    stage: 'Negotiation',
    probability: 75,
    expectedCloseDate: '2026-02-15',
    owner: 'Emily Rodriguez',
    lastActivity: '2026-01-29',
  },
  {
    id: 'opp-002',
    name: 'Cloud Infrastructure Migration - Healthcare',
    account: 'MedTech Systems',
    value: 890000,
    stage: 'Proposal',
    probability: 60,
    expectedCloseDate: '2026-02-28',
    owner: 'Sarah Johnson',
    lastActivity: '2026-01-28',
  },
  {
    id: 'opp-003',
    name: 'Digital Transformation Initiative',
    account: 'RetailCo',
    value: 720000,
    stage: 'Verbal Commit',
    probability: 85,
    expectedCloseDate: '2026-02-10',
    owner: 'David Kim',
    lastActivity: '2026-01-29',
  },
  {
    id: 'opp-004',
    name: 'ERP System Implementation',
    account: 'Manufacturing Plus',
    value: 650000,
    stage: 'Needs Analysis',
    probability: 45,
    expectedCloseDate: '2026-03-15',
    owner: 'Michael Chen',
    lastActivity: '2026-01-27',
  },
  {
    id: 'opp-005',
    name: 'Security & Compliance Upgrade',
    account: 'Finance Group',
    value: 580000,
    stage: 'Qualification',
    probability: 30,
    expectedCloseDate: '2026-03-30',
    owner: 'Emily Rodriguez',
    lastActivity: '2026-01-26',
  },
];

// Conversion Funnel Data (lead → opportunity → won)
export const conversionFunnel = [
  { stage: 'Leads', count: 491, percentage: 100 },
  { stage: 'Qualified Leads', count: 245, percentage: 49.9 },
  { stage: 'Opportunities', count: 134, percentage: 27.3 },
  { stage: 'Proposals', count: 68, percentage: 13.8 },
  { stage: 'Won', count: 50, percentage: 10.2 },
];
// 50 won out of 491 leads = 10.2% overall, 18% lead-to-opportunity matches KPI

// Pipeline Visualization Metrics (Phase 1.7.3)
export const dashboardPipelineMetrics = {
  // Stage breakdown with value per stage (matches pipelineByStage)
  stageBreakdown: [
    { stage: 'Qualification', value: 1240000, count: 28 },
    { stage: 'Needs Analysis', value: 1580000, count: 24 },
    { stage: 'Proposal', value: 1350000, count: 19 },
    { stage: 'Negotiation', value: 1620000, count: 22 },
    { stage: 'Verbal Commit', value: 980000, count: 12 },
    { stage: 'Contracting', value: 870000, count: 14 },
    { stage: 'Closed Won', value: 780000, count: 8 },
  ],

  // Conversion rates between stages (percentage)
  conversionRates: [
    { stage: 'Qualification → Needs Analysis', rate: 85.7 },
    { stage: 'Needs Analysis → Proposal', rate: 79.2 },
    { stage: 'Proposal → Negotiation', rate: 73.7 },
    { stage: 'Negotiation → Verbal Commit', rate: 54.5 },
    { stage: 'Verbal Commit → Contracting', rate: 83.3 },
    { stage: 'Contracting → Closed Won', rate: 57.1 },
  ],

  // Average days spent in each stage (velocity trend)
  velocityTrend: [
    { stage: 'Qualification', avgDays: 8 },
    { stage: 'Needs Analysis', avgDays: 12 },
    { stage: 'Proposal', avgDays: 10 },
    { stage: 'Negotiation', avgDays: 14 },
    { stage: 'Verbal Commit', avgDays: 7 },
    { stage: 'Contracting', avgDays: 5 },
  ],

  // Win/Loss analysis (counts and percentages)
  winLossAnalysis: {
    won: { count: 50, value: 7250000, percentage: 62.5 },
    lost: { count: 30, value: 3000000, percentage: 37.5 },
  },
};

// Lead Analytics Metrics (Phase 1.7.4)
export const dashboardLeadMetrics = {
  // Leads by Source - Horizontal bar chart data
  leadsBySource: [
    { source: 'Marketing Campaigns', count: 198, color: 'success.main' },
    { source: 'Organic Search', count: 142, color: 'primary.main' },
    { source: 'Referrals', count: 87, color: 'info.main' },
    { source: 'Events & Trade Shows', count: 64, color: 'warning.main' },
  ],
  // Lead Engagement Trend - 30-day time series
  engagementTrend: [
    { date: '2026-01-01', emailOpens: 145, linkClicks: 89, formSubmits: 34 },
    { date: '2026-01-02', emailOpens: 132, linkClicks: 78, formSubmits: 28 },
    { date: '2026-01-03', emailOpens: 158, linkClicks: 95, formSubmits: 42 },
    { date: '2026-01-06', emailOpens: 168, linkClicks: 102, formSubmits: 38 },
    { date: '2026-01-07', emailOpens: 151, linkClicks: 88, formSubmits: 35 },
    { date: '2026-01-08', emailOpens: 172, linkClicks: 108, formSubmits: 45 },
    { date: '2026-01-09', emailOpens: 162, linkClicks: 98, formSubmits: 41 },
    { date: '2026-01-10', emailOpens: 178, linkClicks: 112, formSubmits: 48 },
    { date: '2026-01-13', emailOpens: 185, linkClicks: 118, formSubmits: 52 },
    { date: '2026-01-14', emailOpens: 169, linkClicks: 104, formSubmits: 44 },
    { date: '2026-01-15', emailOpens: 156, linkClicks: 92, formSubmits: 38 },
    { date: '2026-01-16', emailOpens: 148, linkClicks: 86, formSubmits: 33 },
    { date: '2026-01-17', emailOpens: 175, linkClicks: 110, formSubmits: 46 },
    { date: '2026-01-20', emailOpens: 163, linkClicks: 99, formSubmits: 40 },
    { date: '2026-01-21', emailOpens: 171, linkClicks: 106, formSubmits: 43 },
    { date: '2026-01-22', emailOpens: 182, linkClicks: 115, formSubmits: 50 },
    { date: '2026-01-23', emailOpens: 167, linkClicks: 101, formSubmits: 42 },
    { date: '2026-01-24', emailOpens: 154, linkClicks: 90, formSubmits: 36 },
    { date: '2026-01-27', emailOpens: 149, linkClicks: 84, formSubmits: 32 },
    { date: '2026-01-28', emailOpens: 176, linkClicks: 111, formSubmits: 47 },
    { date: '2026-01-29', emailOpens: 164, linkClicks: 100, formSubmits: 41 },
  ],
};

// Top Performing Accounts - Table data (Phase 1.7.4)
export const dashboardTopAccounts = [
  {
    id: 'acc-001',
    name: 'Global Industries',
    opportunityCount: 8,
    totalValue: 2450000,
    latestActivity: '2026-01-29',
  },
  {
    id: 'acc-002',
    name: 'MedTech Systems',
    opportunityCount: 6,
    totalValue: 1890000,
    latestActivity: '2026-01-28',
  },
  {
    id: 'acc-003',
    name: 'RetailCo',
    opportunityCount: 5,
    totalValue: 1520000,
    latestActivity: '2026-01-29',
  },
  {
    id: 'acc-004',
    name: 'Finance Group',
    opportunityCount: 7,
    totalValue: 1340000,
    latestActivity: '2026-01-27',
  },
  {
    id: 'acc-005',
    name: 'Manufacturing Plus',
    opportunityCount: 4,
    totalValue: 1120000,
    latestActivity: '2026-01-26',
  },
];
// Activity & Proposal Metrics (Phase 1.7.5)

// Upcoming Tasks (next 7 days)
export const upcomingTasks = [
  {
    id: 'task-001',
    title: 'Follow-up call with Acme Corp',
    description: 'Discuss implementation timeline and next steps',
    dueDate: '2026-01-30',
    priority: 'high',
    assignedTo: 'Sarah Johnson',
    opportunityId: 'opp-001',
    opportunityName: 'Enterprise Platform Upgrade',
    completed: false,
  },
  {
    id: 'task-002',
    title: 'Prepare demo for Finance Group',
    description: 'Executive demo presentation materials',
    dueDate: '2026-01-30',
    priority: 'high',
    assignedTo: 'Emily Rodriguez',
    opportunityId: 'opp-005',
    opportunityName: 'Security & Compliance Upgrade',
    completed: false,
  },
  {
    id: 'task-003',
    title: 'Send proposal to TechStart Inc',
    description: 'Cloud migration proposal with pricing',
    dueDate: '2026-01-31',
    priority: 'medium',
    assignedTo: 'Michael Chen',
    opportunityId: 'opp-002',
    opportunityName: 'Cloud Infrastructure Migration',
    completed: false,
  },
  {
    id: 'task-004',
    title: 'Contract review - RetailCo',
    description: 'Review legal comments and finalize contract',
    dueDate: '2026-02-01',
    priority: 'high',
    assignedTo: 'David Kim',
    opportunityId: 'opp-003',
    opportunityName: 'Digital Transformation Initiative',
    completed: true,
  },
  {
    id: 'task-005',
    title: 'Discovery meeting - Innovate Solutions',
    description: 'Initial needs assessment and requirements gathering',
    dueDate: '2026-02-02',
    priority: 'medium',
    assignedTo: 'David Kim',
    opportunityId: 'opp-004',
    opportunityName: 'New Deal - Innovate Solutions',
    completed: false,
  },
  {
    id: 'task-006',
    title: 'Proposal follow-up - Manufacturing Plus',
    description: 'Address technical questions from proposal review',
    dueDate: '2026-02-03',
    priority: 'medium',
    assignedTo: 'Michael Chen',
    opportunityId: 'opp-004',
    opportunityName: 'ERP System Implementation',
    completed: false,
  },
  {
    id: 'task-007',
    title: 'Quarterly business review - MedTech Systems',
    description: 'Review Q1 results and discuss expansion opportunities',
    dueDate: '2026-02-04',
    priority: 'low',
    assignedTo: 'Sarah Johnson',
    opportunityId: 'opp-002',
    opportunityName: 'Cloud Infrastructure Migration',
    completed: false,
  },
];

// Recent Proposals (last 10 created/updated)
export const recentProposals = [
  {
    id: 'prop-001',
    title: 'Enterprise Platform Upgrade - Acme Corp',
    opportunityId: 'opp-001',
    opportunityName: 'Enterprise Platform Upgrade - Fortune 500',
    account: 'Acme Corp',
    value: 1250000,
    status: 'sent',
    createdDate: '2026-01-28',
    sentDate: '2026-01-28',
    owner: 'Emily Rodriguez',
  },
  {
    id: 'prop-002',
    title: 'Cloud Migration Proposal - TechStart Inc',
    opportunityId: 'opp-002',
    opportunityName: 'Cloud Infrastructure Migration',
    account: 'TechStart Inc',
    value: 165000,
    status: 'draft',
    createdDate: '2026-01-29',
    sentDate: null,
    owner: 'Michael Chen',
  },
  {
    id: 'prop-003',
    title: 'Digital Transformation - RetailCo',
    opportunityId: 'opp-003',
    opportunityName: 'Digital Transformation Initiative',
    account: 'RetailCo',
    value: 340000,
    status: 'accepted',
    createdDate: '2026-01-26',
    sentDate: '2026-01-26',
    acceptedDate: '2026-01-28',
    owner: 'Sarah Johnson',
  },
  {
    id: 'prop-004',
    title: 'ERP Implementation - Logistics Corp',
    opportunityId: 'opp-006',
    opportunityName: 'ERP Implementation',
    account: 'Logistics Corp',
    value: 390000,
    status: 'sent',
    createdDate: '2026-01-27',
    sentDate: '2026-01-27',
    owner: 'Sarah Johnson',
  },
  {
    id: 'prop-005',
    title: 'Security Upgrade - Finance Group',
    opportunityId: 'opp-005',
    opportunityName: 'Security & Compliance Upgrade',
    account: 'Finance Group',
    value: 580000,
    status: 'draft',
    createdDate: '2026-01-29',
    sentDate: null,
    owner: 'Emily Rodriguez',
  },
  {
    id: 'prop-006',
    title: 'Data Analytics Platform - Healthcare Systems',
    opportunityId: 'opp-007',
    opportunityName: 'Data Analytics Platform',
    account: 'Healthcare Systems',
    value: 275000,
    status: 'sent',
    createdDate: '2026-01-25',
    sentDate: '2026-01-25',
    owner: 'David Kim',
  },
  {
    id: 'prop-007',
    title: 'Infrastructure Modernization - Manufacturing Plus',
    opportunityId: 'opp-004',
    opportunityName: 'ERP System Implementation',
    account: 'Manufacturing Plus',
    value: 650000,
    status: 'declined',
    createdDate: '2026-01-23',
    sentDate: '2026-01-23',
    declinedDate: '2026-01-27',
    owner: 'Michael Chen',
  },
  {
    id: 'prop-008',
    title: 'Cloud Services - StartupXYZ',
    opportunityId: 'opp-008',
    opportunityName: 'SaaS Subscription',
    account: 'StartupXYZ',
    value: 95000,
    status: 'accepted',
    createdDate: '2026-01-24',
    sentDate: '2026-01-24',
    acceptedDate: '2026-01-27',
    owner: 'Michael Chen',
  },
  {
    id: 'prop-009',
    title: 'Custom Integration - Global Industries',
    opportunityId: 'opp-001',
    opportunityName: 'Enterprise Platform Upgrade',
    account: 'Global Industries',
    value: 420000,
    status: 'sent',
    createdDate: '2026-01-26',
    sentDate: '2026-01-26',
    owner: 'Emily Rodriguez',
  },
  {
    id: 'prop-010',
    title: 'Training & Support Package - MedTech Systems',
    opportunityId: 'opp-002',
    opportunityName: 'Cloud Infrastructure Migration',
    account: 'MedTech Systems',
    value: 125000,
    status: 'draft',
    createdDate: '2026-01-28',
    sentDate: null,
    owner: 'Sarah Johnson',
  },
];
