/**
 * CRM Dashboard Mock Data
 * Data for the main CRM dashboard page (different from dashboard-metrics.js)
 */

// KPIs Data for CRM Dashboard
export const kpisData = [
  {
    id: 1,
    title: 'Total Revenue',
    value: '$24.5M',
    change: 12.5,
    changeLabel: 'vs last month',
    icon: 'material-symbols:attach-money-rounded',
    color: 'success',
  },
  {
    id: 2,
    title: 'Active Deals',
    value: '147',
    change: 8.2,
    changeLabel: 'vs last month',
    icon: 'material-symbols:handshake-outline',
    color: 'primary',
  },
  {
    id: 3,
    title: 'Conversion Rate',
    value: '34.2%',
    change: -2.1,
    changeLabel: 'vs last month',
    icon: 'material-symbols:conversion-path',
    color: 'warning',
  },
  {
    id: 4,
    title: 'New Leads',
    value: '892',
    change: 15.7,
    changeLabel: 'vs last month',
    icon: 'material-symbols:person-add-outline',
    color: 'info',
  },
];

// Deals Data for Greeting Component
export const dealsData = {
  total: 147,
  inProgress: 89,
  closed: 58,
  totalValue: 24500000,
  avgDealSize: 166667,
};

// Generated Revenue Chart Data
export const crmGeneratedRevenueData = {
  currentYear: [
    1800000, 1950000, 2100000, 2050000, 2200000, 2150000, 2300000, 2250000, 2400000, 2350000,
    2500000, 2450000,
  ],
  lastYear: [
    1600000, 1700000, 1850000, 1900000, 2000000, 1950000, 2050000, 2100000, 2150000, 2200000,
    2250000, 2300000,
  ],
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

// Customer Feedback Data
export const customerFeedbackData = {
  nps: 72,
  satisfaction: 4.6,
  responses: 1247,
  breakdown: [
    { label: 'Promoters', value: 68, count: 848 },
    { label: 'Passives', value: 22, count: 274 },
    { label: 'Detractors', value: 10, count: 125 },
  ],
};

// Lead Sources Data
export const leadSoursesData = [
  { name: 'Website', value: 35, count: 312, color: '#1976d2' },
  { name: 'Referrals', value: 28, count: 250, color: '#2e7d32' },
  { name: 'Social Media', value: 18, count: 161, color: '#d32f2f' },
  { name: 'Email Marketing', value: 12, count: 107, color: '#ed6c02' },
  { name: 'Events', value: 7, count: 62, color: '#9c27b0' },
];

// Acquisition Cost Data
export const acquisitionCostData = {
  current: 1250,
  previous: 1380,
  trend: [
    { month: 'Jan', cost: 1450 },
    { month: 'Feb', cost: 1420 },
    { month: 'Mar', cost: 1380 },
    { month: 'Apr', cost: 1350 },
    { month: 'May', cost: 1320 },
    { month: 'Jun', cost: 1280 },
    { month: 'Jul', cost: 1250 },
  ],
};

// Average Lifetime Value Data
export const avgLifetimeValueData = {
  current: 48500,
  previous: 44200,
  trend: [
    { month: 'Jan', value: 42000 },
    { month: 'Feb', value: 43200 },
    { month: 'Mar', value: 44200 },
    { month: 'Apr', value: 45100 },
    { month: 'May', value: 46300 },
    { month: 'Jun', value: 47400 },
    { month: 'Jul', value: 48500 },
  ],
};

// Active Users Data (Customer Engagement)
export const activeUsersData = {
  daily: 4567,
  weekly: 12890,
  monthly: 28450,
  trend: [
    { date: '2026-01-01', users: 3200 },
    { date: '2026-01-08', users: 3450 },
    { date: '2026-01-15', users: 3800 },
    { date: '2026-01-22', users: 4100 },
    { date: '2026-01-29', users: 4567 },
  ],
};

// Sale Funnel Data
export const saleFunnelData = [
  { stage: 'Leads', value: 1200, color: '#1976d2' },
  { stage: 'Qualified', value: 840, color: '#2e7d32' },
  { stage: 'Proposal', value: 420, color: '#ed6c02' },
  { stage: 'Negotiation', value: 210, color: '#9c27b0' },
  { stage: 'Closed Won', value: 147, color: '#2e7d32' },
];

export const saleFunnelTableData = [
  {
    stage: 'Leads',
    count: 1200,
    value: 18000000,
    conversionRate: 70.0,
    avgDays: 0,
  },
  {
    stage: 'Qualified',
    count: 840,
    value: 16800000,
    conversionRate: 50.0,
    avgDays: 7,
  },
  {
    stage: 'Proposal',
    count: 420,
    value: 14700000,
    conversionRate: 50.0,
    avgDays: 14,
  },
  {
    stage: 'Negotiation',
    count: 210,
    value: 12600000,
    conversionRate: 70.0,
    avgDays: 21,
  },
  {
    stage: 'Closed Won',
    count: 147,
    value: 24500000,
    conversionRate: 100,
    avgDays: 28,
  },
];
