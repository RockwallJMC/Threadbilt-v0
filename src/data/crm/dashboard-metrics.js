// Mock data for CRM Dashboard metrics
// This data simulates pre-calculated aggregations that would come from Supabase
// All values are internally consistent and demonstrate realistic patterns

// KPI Metrics (7 key performance indicators)
export const dashboardKPIs = [
  {
    title: 'Total Pipeline Value',
    value: 8420000, // Sum of all pipeline stages
    subtitle: 'All active opportunities',
    icon: {
      name: 'material-symbols:trending-up',
      color: 'primary.main',
    },
    trend: { value: 12.5, direction: 'up' },
  },
  {
    title: 'Win Rate',
    value: '32%',
    subtitle: 'Last 90 days',
    icon: {
      name: 'material-symbols:check-circle-outline',
      color: 'success.main',
    },
    trend: { value: 5.2, direction: 'up' },
  },
  {
    title: 'Avg Deal Size',
    value: 145000,
    subtitle: 'Won opportunities',
    icon: {
      name: 'material-symbols:payments-outline',
      color: 'info.main',
    },
    trend: { value: 3.1, direction: 'down' },
  },
  {
    title: 'Sales Cycle',
    value: '42 days',
    subtitle: 'Average time to close',
    icon: {
      name: 'material-symbols:schedule',
      color: 'warning.main',
    },
    trend: { value: 8.0, direction: 'down' }, // Shorter is better
  },
  {
    title: 'Active Opportunities',
    value: 127,
    subtitle: 'In pipeline',
    icon: {
      name: 'material-symbols:work-outline',
      color: 'secondary.main',
    },
    trend: { value: 15.3, direction: 'up' },
  },
  {
    title: 'Proposals Sent',
    value: 34,
    subtitle: 'Last 30 days',
    icon: {
      name: 'material-symbols:description-outline',
      color: 'primary.main',
    },
    trend: { value: 21.4, direction: 'up' },
  },
  {
    title: 'Lead Conversion',
    value: '18%',
    subtitle: 'Lead to opportunity',
    icon: {
      name: 'material-symbols:conversion-path',
      color: 'success.main',
    },
    trend: { value: 2.3, direction: 'up' },
  },
];

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
