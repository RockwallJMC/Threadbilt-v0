import { users } from 'data/users';

// Project metrics for dashboard KPIs
export const projectMetrics = [
  {
    title: 'Active Projects',
    count: 12,
    change: {
      amount: 3,
      direction: 'more',
      timeFrame: 'last month',
    },
    icon: {
      name: 'material-symbols:folder-open-outline',
      color: 'primary',
    },
  },
  {
    title: 'On Schedule',
    count: 8,
    change: {
      amount: 2,
      direction: 'more',
      timeFrame: 'last week',
    },
    icon: {
      name: 'material-symbols:schedule-outline',
      color: 'success',
    },
  },
  {
    title: 'Over Budget',
    count: 3,
    change: {
      amount: 1,
      direction: 'less',
      timeFrame: 'last month',
    },
    icon: {
      name: 'material-symbols:trending-up',
      color: 'error',
    },
  },
  {
    title: 'Total Budget',
    count: '$2.4M',
    change: {
      amount: '$400K',
      direction: 'more',
      timeFrame: 'this quarter',
    },
    icon: {
      name: 'material-symbols:attach-money',
      color: 'warning',
    },
  },
];

// Sample projects data
export const projectsData = [
  {
    id: 1,
    name: 'Aurora CRM Enhancement',
    description: 'Enhance the existing CRM system with new features and improved UI',
    status: 'active',
    priority: 'high',
    budget: 150000,
    spent: 75000,
    progress: 65,
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    projectManager: users[5],
    team: [users[1], users[3], users[7], users[9]],
    client: 'Internal',
    opportunityId: 1, // Link to CRM opportunity
    phases: [
      {
        id: 1,
        name: 'Planning & Analysis',
        status: 'completed',
        progress: 100,
        startDate: '2024-01-15',
        endDate: '2024-02-15',
      },
      {
        id: 2,
        name: 'Development',
        status: 'active',
        progress: 70,
        startDate: '2024-02-16',
        endDate: '2024-05-30',
      },
      {
        id: 3,
        name: 'Testing & Deployment',
        status: 'pending',
        progress: 0,
        startDate: '2024-06-01',
        endDate: '2024-06-30',
      },
    ],
  },
  {
    id: 2,
    name: 'Mobile App Development',
    description: 'Develop a mobile application for customer engagement',
    status: 'active',
    priority: 'medium',
    budget: 200000,
    spent: 120000,
    progress: 45,
    startDate: '2024-02-01',
    endDate: '2024-08-31',
    projectManager: users[2],
    team: [users[4], users[6], users[8], users[10]],
    client: 'TechCorp Inc.',
    opportunityId: 2,
    phases: [
      {
        id: 1,
        name: 'UI/UX Design',
        status: 'completed',
        progress: 100,
        startDate: '2024-02-01',
        endDate: '2024-03-15',
      },
      {
        id: 2,
        name: 'Backend Development',
        status: 'active',
        progress: 60,
        startDate: '2024-03-16',
        endDate: '2024-06-30',
      },
      {
        id: 3,
        name: 'Mobile App Development',
        status: 'active',
        progress: 30,
        startDate: '2024-04-01',
        endDate: '2024-07-31',
      },
      {
        id: 4,
        name: 'Testing & Launch',
        status: 'pending',
        progress: 0,
        startDate: '2024-08-01',
        endDate: '2024-08-31',
      },
    ],
  },
];

// Task statuses for Kanban board
export const taskStatuses = ['To Do', 'In Progress', 'Completed', 'Blocked'];
