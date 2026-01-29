/**
 * CRM Dashboard Mock Data
 * Phase 1.7.3-1.7.5: Dashboard widgets data
 */

// Recent Activities Timeline Data
export const recentActivities = [
  {
    id: 1,
    title: 'Meeting scheduled with Acme Corp',
    timestamp: '2026-01-29T14:30:00Z',
    user: 'Sarah Johnson',
    type: 'meeting_scheduled',
  },
  {
    id: 2,
    title: 'Proposal sent to TechStart Inc',
    timestamp: '2026-01-29T11:15:00Z',
    user: 'Michael Chen',
    type: 'proposal_sent',
  },
  {
    id: 3,
    title: 'Deal closed - Global Systems',
    timestamp: '2026-01-29T09:45:00Z',
    user: 'Emily Rodriguez',
    type: 'deal_closed',
  },
  {
    id: 4,
    title: 'Follow-up call completed',
    timestamp: '2026-01-28T16:20:00Z',
    user: 'David Kim',
    type: 'call_completed',
  },
  {
    id: 5,
    title: 'New lead added - Innovation Labs',
    timestamp: '2026-01-28T14:00:00Z',
    user: 'Lisa Wang',
    type: 'lead_created',
  },
  {
    id: 6,
    title: 'Contract signed - Enterprise Solutions',
    timestamp: '2026-01-28T10:30:00Z',
    user: 'James Miller',
    type: 'contract_signed',
  },
  {
    id: 7,
    title: 'Demo completed for DataTech',
    timestamp: '2026-01-27T15:45:00Z',
    user: 'Sarah Johnson',
    type: 'demo_completed',
  },
  {
    id: 8,
    title: 'Proposal accepted - CloudVentures',
    timestamp: '2026-01-27T13:20:00Z',
    user: 'Michael Chen',
    type: 'proposal_accepted',
  },
  {
    id: 9,
    title: 'Discovery call scheduled',
    timestamp: '2026-01-27T11:00:00Z',
    user: 'Emily Rodriguez',
    type: 'call_scheduled',
  },
  {
    id: 10,
    title: 'Quote sent to StartupXYZ',
    timestamp: '2026-01-26T16:30:00Z',
    user: 'David Kim',
    type: 'quote_sent',
  },
];

// Upcoming Tasks Data
export const upcomingTasks = [
  {
    id: 1,
    title: 'Follow up with Acme Corp on proposal',
    dueDate: '2026-01-29T17:00:00Z',
    completed: false,
    priority: 'high',
    assignedTo: 'Sarah Johnson',
  },
  {
    id: 2,
    title: 'Prepare demo for TechStart Inc',
    dueDate: '2026-01-30T10:00:00Z',
    completed: false,
    priority: 'high',
    assignedTo: 'Michael Chen',
  },
  {
    id: 3,
    title: 'Send contract to Global Systems',
    dueDate: '2026-01-30T15:00:00Z',
    completed: true,
    priority: 'medium',
    assignedTo: 'Emily Rodriguez',
  },
  {
    id: 4,
    title: 'Review pricing for Innovation Labs',
    dueDate: '2026-01-31T12:00:00Z',
    completed: false,
    priority: 'medium',
    assignedTo: 'David Kim',
  },
  {
    id: 5,
    title: 'Schedule discovery call with CloudVentures',
    dueDate: '2026-02-01T09:00:00Z',
    completed: false,
    priority: 'low',
    assignedTo: 'Lisa Wang',
  },
  {
    id: 6,
    title: 'Update CRM notes for Enterprise Solutions',
    dueDate: '2026-02-01T14:00:00Z',
    completed: false,
    priority: 'low',
    assignedTo: 'James Miller',
  },
  {
    id: 7,
    title: 'Send follow-up email to DataTech',
    dueDate: '2026-02-02T10:00:00Z',
    completed: false,
    priority: 'medium',
    assignedTo: 'Sarah Johnson',
  },
  {
    id: 8,
    title: 'Prepare quarterly review presentation',
    dueDate: '2026-02-03T16:00:00Z',
    completed: false,
    priority: 'high',
    assignedTo: 'Michael Chen',
  },
];

// Recent Proposals Data
export const recentProposals = [
  {
    id: 1,
    title: 'Enterprise Software License - Acme Corp',
    value: 850000,
    status: 'sent',
    createdDate: '2026-01-28T10:00:00Z',
    clientName: 'Acme Corp',
    link: '/apps/crm/proposals/1',
  },
  {
    id: 2,
    title: 'Cloud Infrastructure Setup - TechStart',
    value: 450000,
    status: 'draft',
    createdDate: '2026-01-27T14:30:00Z',
    clientName: 'TechStart Inc',
    link: '/apps/crm/proposals/2',
  },
  {
    id: 3,
    title: 'Digital Transformation - Global Systems',
    value: 1200000,
    status: 'accepted',
    createdDate: '2026-01-26T09:15:00Z',
    clientName: 'Global Systems',
    link: '/apps/crm/proposals/3',
  },
  {
    id: 4,
    title: 'SaaS Platform Integration - Innovation Labs',
    value: 320000,
    status: 'sent',
    createdDate: '2026-01-25T11:45:00Z',
    clientName: 'Innovation Labs',
    link: '/apps/crm/proposals/4',
  },
  {
    id: 5,
    title: 'Cybersecurity Assessment - SecureNet',
    value: 180000,
    status: 'declined',
    createdDate: '2026-01-24T16:20:00Z',
    clientName: 'SecureNet Corp',
    link: '/apps/crm/proposals/5',
  },
  {
    id: 6,
    title: 'Mobile App Development - AppVentures',
    value: 950000,
    status: 'accepted',
    createdDate: '2026-01-23T13:00:00Z',
    clientName: 'AppVentures LLC',
    link: '/apps/crm/proposals/6',
  },
  {
    id: 7,
    title: 'Data Analytics Platform - DataTech',
    value: 670000,
    status: 'sent',
    createdDate: '2026-01-22T10:30:00Z',
    clientName: 'DataTech Solutions',
    link: '/apps/crm/proposals/7',
  },
  {
    id: 8,
    title: 'AI Chatbot Implementation - CloudVentures',
    value: 280000,
    status: 'draft',
    createdDate: '2026-01-21T15:45:00Z',
    clientName: 'CloudVentures Inc',
    link: '/apps/crm/proposals/8',
  },
];

// Dashboard Pipeline Metrics
export const dashboardPipelineMetrics = {
  // Pipeline Stage Breakdown
  stageBreakdown: [
    {
      stage: 'Prospecting',
      value: 2450000,
      count: 45,
      avgDealSize: 54444,
    },
    {
      stage: 'Qualification',
      value: 3780000,
      count: 32,
      avgDealSize: 118125,
    },
    {
      stage: 'Proposal',
      value: 5120000,
      count: 28,
      avgDealSize: 182857,
    },
    {
      stage: 'Negotiation',
      value: 4890000,
      count: 18,
      avgDealSize: 271667,
    },
    {
      stage: 'Closed Won',
      value: 8650000,
      count: 24,
      avgDealSize: 360417,
    },
    {
      stage: 'Closed Lost',
      value: 3240000,
      count: 15,
      avgDealSize: 216000,
    },
  ],

  // Win/Loss Analysis
  winLossAnalysis: {
    won: {
      count: 24,
      value: 8650000,
      percentage: 61.5,
    },
    lost: {
      count: 15,
      value: 3240000,
      percentage: 38.5,
    },
  },

  // Deal Velocity Trend (last 12 weeks)
  dealVelocityTrend: [
    { week: 'Week 1', avgDays: 45 },
    { week: 'Week 2', avgDays: 42 },
    { week: 'Week 3', avgDays: 48 },
    { week: 'Week 4', avgDays: 44 },
    { week: 'Week 5', avgDays: 41 },
    { week: 'Week 6', avgDays: 39 },
    { week: 'Week 7', avgDays: 37 },
    { week: 'Week 8', avgDays: 35 },
    { week: 'Week 9', avgDays: 38 },
    { week: 'Week 10', avgDays: 36 },
    { week: 'Week 11', avgDays: 34 },
    { week: 'Week 12', avgDays: 32 },
  ],

  // Conversion Rate by Stage
  conversionRates: [
    {
      stage: 'Prospecting → Qualification',
      rate: 71.1,
      converted: 32,
      total: 45,
    },
    {
      stage: 'Qualification → Proposal',
      rate: 87.5,
      converted: 28,
      total: 32,
    },
    {
      stage: 'Proposal → Negotiation',
      rate: 64.3,
      converted: 18,
      total: 28,
    },
    {
      stage: 'Negotiation → Closed',
      rate: 61.5,
      converted: 24,
      total: 39,
    },
  ],
};
