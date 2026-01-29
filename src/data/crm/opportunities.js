/**
 * CRM Opportunities/Deals Mock Data
 * Data for Kanban board, opportunity details, and related components
 */

import { users } from 'data/users';
import dayjs from 'dayjs';

// Opportunity Stages Configuration
export const OPPORTUNITY_STAGES = [
  { id: 'prospecting', title: 'Prospecting', label: 'Prospecting', color: 'default' },
  { id: 'qualification', title: 'Qualification', label: 'Qualification', color: 'info' },
  { id: 'proposal', title: 'Proposal', label: 'Proposal', color: 'primary' },
  { id: 'negotiation', title: 'Negotiation', label: 'Negotiation', color: 'warning' },
  { id: 'closed_won', title: 'Closed Won', label: 'Closed Won', color: 'success' },
  { id: 'closed_lost', title: 'Closed Lost', label: 'Closed Lost', color: 'error' },
];

// Companies/Clients Data
export const companies = [
  {
    id: 1,
    name: 'Acme Corporation',
    industry: 'Technology',
    size: 'Enterprise',
    logo: null,
  },
  {
    id: 2,
    name: 'TechStart Inc',
    industry: 'Software',
    size: 'SMB',
    logo: null,
  },
  {
    id: 3,
    name: 'Global Systems',
    industry: 'IT Services',
    size: 'Enterprise',
    logo: null,
  },
  {
    id: 4,
    name: 'Innovation Labs',
    industry: 'R&D',
    size: 'Mid-Market',
    logo: null,
  },
  {
    id: 5,
    name: 'Enterprise Solutions LLC',
    industry: 'Consulting',
    size: 'Enterprise',
    logo: null,
  },
  {
    id: 6,
    name: 'CloudVentures',
    industry: 'Cloud Services',
    size: 'SMB',
    logo: null,
  },
  {
    id: 7,
    name: 'DataTech Solutions',
    industry: 'Analytics',
    size: 'Mid-Market',
    logo: null,
  },
  {
    id: 8,
    name: 'SecureNet Corp',
    industry: 'Cybersecurity',
    size: 'Mid-Market',
    logo: null,
  },
];

// Opportunities Kanban Data
export const opportunitiesData = [
  {
    id: 'prospecting',
    title: 'Prospecting',
    compactMode: false,
    opportunities: [
      {
        id: 'opp1',
        name: 'Enterprise Software License - Acme Corp',
        stage: 'Prospecting',
        amount: 850000,
        company: companies[0],
        assignee: [users[0], users[1]],
        priority: 'high',
        closeDate: dayjs().add(60, 'days').toISOString(),
        lastUpdate: dayjs().toISOString(),
        createDate: dayjs().subtract(5, 'days').toISOString(),
        progress: 15,
        client: {
          name: 'John Smith',
          email: 'john.smith@acme.com',
          phone: '+1-555-0101',
          videoChat: 'https://zoom.us/j/123456',
          address: 'San Francisco, CA',
          link: '#!',
        },
      },
      {
        id: 'opp2',
        name: 'Cloud Migration Project - TechStart',
        stage: 'Prospecting',
        amount: 320000,
        company: companies[1],
        assignee: [users[2]],
        priority: 'medium',
        closeDate: dayjs().add(45, 'days').toISOString(),
        lastUpdate: dayjs().toISOString(),
        createDate: dayjs().subtract(3, 'days').toISOString(),
        progress: 10,
        client: {
          name: 'Sarah Johnson',
          email: 'sarah@techstart.com',
          phone: '+1-555-0102',
          videoChat: 'https://zoom.us/j/234567',
          address: 'Austin, TX',
          link: '#!',
        },
      },
    ],
  },
  {
    id: 'qualification',
    title: 'Qualification',
    compactMode: false,
    opportunities: [
      {
        id: 'opp3',
        name: 'Digital Transformation - Global Systems',
        stage: 'Qualification',
        amount: 1200000,
        company: companies[2],
        assignee: [users[3], users[4]],
        priority: 'high',
        closeDate: dayjs().add(90, 'days').toISOString(),
        lastUpdate: dayjs().toISOString(),
        createDate: dayjs().subtract(10, 'days').toISOString(),
        progress: 30,
        client: {
          name: 'Michael Chen',
          email: 'mchen@globalsys.com',
          phone: '+1-555-0103',
          videoChat: 'https://zoom.us/j/345678',
          address: 'New York, NY',
          link: '#!',
        },
      },
      {
        id: 'opp4',
        name: 'SaaS Platform Integration - Innovation Labs',
        stage: 'Qualification',
        amount: 450000,
        company: companies[3],
        assignee: [users[5]],
        priority: 'medium',
        closeDate: dayjs().add(75, 'days').toISOString(),
        lastUpdate: dayjs().toISOString(),
        createDate: dayjs().subtract(8, 'days').toISOString(),
        progress: 25,
        client: {
          name: 'Emily Rodriguez',
          email: 'emily.r@innovlabs.com',
          phone: '+1-555-0104',
          videoChat: 'https://zoom.us/j/456789',
          address: 'Seattle, WA',
          link: '#!',
        },
      },
    ],
  },
  {
    id: 'proposal',
    title: 'Proposal',
    compactMode: false,
    opportunities: [
      {
        id: 'opp5',
        name: 'IT Infrastructure Upgrade - Enterprise Solutions',
        stage: 'Proposal',
        amount: 780000,
        company: companies[4],
        assignee: [users[6], users[7]],
        priority: 'high',
        closeDate: dayjs().add(30, 'days').toISOString(),
        lastUpdate: dayjs().toISOString(),
        createDate: dayjs().subtract(15, 'days').toISOString(),
        progress: 50,
        client: {
          name: 'David Kim',
          email: 'dkim@entsolutions.com',
          phone: '+1-555-0105',
          videoChat: 'https://zoom.us/j/567890',
          address: 'Boston, MA',
          link: '#!',
        },
      },
      {
        id: 'opp6',
        name: 'AI Chatbot Implementation - CloudVentures',
        stage: 'Proposal',
        amount: 280000,
        company: companies[5],
        assignee: [users[8]],
        priority: 'medium',
        closeDate: dayjs().add(40, 'days').toISOString(),
        lastUpdate: dayjs().toISOString(),
        createDate: dayjs().subtract(12, 'days').toISOString(),
        progress: 45,
        client: {
          name: 'Lisa Wang',
          email: 'lwang@cloudventures.com',
          phone: '+1-555-0106',
          videoChat: 'https://zoom.us/j/678901',
          address: 'Denver, CO',
          link: '#!',
        },
      },
    ],
  },
  {
    id: 'negotiation',
    title: 'Negotiation',
    compactMode: false,
    opportunities: [
      {
        id: 'opp7',
        name: 'Data Analytics Platform - DataTech',
        stage: 'Negotiation',
        amount: 670000,
        company: companies[6],
        assignee: [users[9], users[10]],
        priority: 'high',
        closeDate: dayjs().add(20, 'days').toISOString(),
        lastUpdate: dayjs().toISOString(),
        createDate: dayjs().subtract(20, 'days').toISOString(),
        progress: 75,
        client: {
          name: 'James Miller',
          email: 'jmiller@datatech.com',
          phone: '+1-555-0107',
          videoChat: 'https://zoom.us/j/789012',
          address: 'Chicago, IL',
          link: '#!',
        },
      },
    ],
  },
  {
    id: 'closed_won',
    title: 'Closed Won',
    compactMode: false,
    opportunities: [
      {
        id: 'opp8',
        name: 'Cybersecurity Assessment - SecureNet',
        stage: 'Closed Won',
        amount: 420000,
        company: companies[7],
        assignee: [users[11]],
        priority: 'high',
        closeDate: dayjs().subtract(5, 'days').toISOString(),
        lastUpdate: dayjs().toISOString(),
        createDate: dayjs().subtract(30, 'days').toISOString(),
        progress: 100,
        client: {
          name: 'Patricia Brown',
          email: 'pbrown@securenet.com',
          phone: '+1-555-0108',
          videoChat: 'https://zoom.us/j/890123',
          address: 'Miami, FL',
          link: '#!',
        },
      },
    ],
  },
  {
    id: 'closed_lost',
    title: 'Closed Lost',
    compactMode: false,
    opportunities: [],
  },
];

// Opportunity Details Data (for detail pages)
export const opportunityInformation = [
  {
    id: 1,
    attribute: 'Last updated',
    value: dayjs().format('DD MMM, YYYY'),
    background: true,
  },
  {
    id: 2,
    attribute: 'Deal Details',
    value: 'Enterprise software license agreement with implementation services and training included.',
    background: false,
  },
  {
    id: 3,
    attribute: 'Create Date',
    value: dayjs().subtract(15, 'days').format('DD MMM, YYYY'),
    background: true,
  },
  {
    id: 4,
    attribute: 'Created By',
    value: users[0].name,
    background: false,
  },
  {
    id: 5,
    attribute: 'Current Stage',
    value: 'Proposal',
    background: true,
  },
  {
    id: 6,
    attribute: 'Closing Date',
    value: dayjs().add(30, 'days').format('DD MMM, YYYY'),
    background: false,
  },
  {
    id: 7,
    attribute: 'Associated Contact',
    value: 'John Smith',
    background: true,
  },
  {
    id: 8,
    attribute: 'Priority',
    value: 'High',
    background: false,
  },
  {
    id: 9,
    attribute: 'Deal Owner',
    value: users[0].name,
    background: true,
  },
  {
    id: 10,
    attribute: 'Budget Forecast',
    value: '$850,000',
    background: false,
  },
];

// Account Data for Opportunity Details
export const accountData = {
  name: 'Acme Corporation',
  industry: 'Technology',
  employees: '5,000-10,000',
  revenue: '$500M - $1B',
  website: 'www.acme.com',
  address: '123 Tech Street, San Francisco, CA 94105',
};

// Assigned To Data
export const assignedToData = {
  owner: users[0],
  collaborators: [users[1], users[2]],
};

// Associated Contact Data
export const associatedContactData = {
  name: 'John Smith',
  title: 'VP of Technology',
  email: 'john.smith@acme.com',
  phone: '+1-555-0101',
  linkedIn: 'linkedin.com/in/johnsmith',
};

// Sales Pipeline Data for Opportunity Details
export const salesPipelineData = [
  {
    stage: 'Prospecting',
    date: dayjs().subtract(15, 'days').format('MMM DD'),
    status: 'completed',
    probability: 10,
  },
  {
    stage: 'Qualification',
    date: dayjs().subtract(10, 'days').format('MMM DD'),
    status: 'completed',
    probability: 25,
  },
  {
    stage: 'Proposal',
    date: dayjs().subtract(5, 'days').format('MMM DD'),
    status: 'current',
    probability: 50,
  },
  {
    stage: 'Negotiation',
    date: 'Expected',
    status: 'upcoming',
    probability: 75,
  },
  {
    stage: 'Closed Won',
    date: 'Expected',
    status: 'upcoming',
    probability: 100,
  },
];

// Activity Summary Data
export const activitySummary = {
  calls: 12,
  meetings: 5,
  emails: 28,
  notes: 8,
  tasks: 15,
  tasksCompleted: 10,
};

// Analytics Data for Opportunity
export const analyticsData = {
  engagementScore: 85,
  dealVelocity: 45, // days
  expectedCloseDate: dayjs().add(30, 'days').toISOString(),
  winProbability: 65, // percentage
  competitorCount: 2,
};
