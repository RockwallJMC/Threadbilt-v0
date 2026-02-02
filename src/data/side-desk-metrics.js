// Mock data provider for Side Desk metrics
// Based on desks.yaml perspective metrics

export const deskConfig = {
  business: {
    name: 'Business',
    icon: 'material-symbols:query-stats-rounded',
  },
  sales: {
    name: 'Sales',
    icon: 'material-symbols:phone-in-talk-outline-rounded',
  },
  projects: {
    name: 'Projects',
    icon: 'material-symbols:pending-actions-rounded',
  },
  service: {
    name: 'Service',
    icon: 'material-symbols:engineering-outline',
  },
  inventory: {
    name: 'Inventory',
    icon: 'material-symbols:shopping-cart-outline',
  },
};

const generateMockMetrics = (deskType) => {
  const baseMetrics = {
    business: {
      new: [
        {
          label: 'New Sales',
          quantity: 12,
          value: '$45,000',
          icon: 'material-symbols:trending-up',
        },
        {
          label: 'New Projects',
          quantity: 5,
          value: '$120,000',
          icon: 'material-symbols:folder-open',
        },
        {
          label: 'New Tickets',
          quantity: 8,
          value: '$12,500',
          icon: 'material-symbols:confirmation-number-outline',
        },
        {
          label: 'New Orders',
          quantity: 23,
          value: '$67,800',
          icon: 'material-symbols:shopping-bag-outline',
        },
      ],
      inProgress: [
        {
          label: 'Pending Leads',
          quantity: 18,
          value: '$89,000',
          icon: 'material-symbols:person-search',
        },
        {
          label: 'Pending Projects',
          quantity: 7,
          value: '$234,000',
          icon: 'material-symbols:hourglass-empty',
        },
        {
          label: 'Pending Tickets',
          quantity: 15,
          value: '$31,200',
          icon: 'material-symbols:pending-outline',
        },
      ],
      pipeline: [
        {
          label: 'Opportunities in Pipeline',
          quantity: 45,
          value: '$450,000',
          icon: 'material-symbols:insights',
        },
        {
          label: 'Projects in Pipeline',
          quantity: 12,
          value: '$567,000',
          icon: 'material-symbols:playlist-add',
        },
        {
          label: 'Orders in Pipeline',
          quantity: 34,
          value: '$123,400',
          icon: 'material-symbols:inventory-2-outline',
        },
      ],
    },
    sales: {
      new: [
        {
          label: 'New Leads',
          quantity: 28,
          value: '$140,000',
          icon: 'material-symbols:person-add-outline',
        },
        {
          label: 'New Opportunities',
          quantity: 15,
          value: '$325,000',
          icon: 'material-symbols:lightbulb-outline',
        },
        {
          label: 'New Deals',
          quantity: 9,
          value: '$178,500',
          icon: 'material-symbols:handshake-outline',
        },
      ],
      inProgress: [
        {
          label: 'Pending Leads',
          quantity: 42,
          value: '$210,000',
          icon: 'material-symbols:hourglass-top',
        },
        {
          label: 'Active Opportunities',
          quantity: 23,
          value: '$560,000',
          icon: 'material-symbols:play-circle-outline',
        },
        {
          label: 'Negotiating Deals',
          quantity: 11,
          value: '$445,000',
          icon: 'material-symbols:forum-outline',
        },
      ],
      pipeline: [
        {
          label: 'Leads in Pipeline',
          quantity: 156,
          value: '$780,000',
          icon: 'material-symbols:conversion-path',
        },
        {
          label: 'Opportunities in Pipeline',
          quantity: 67,
          value: '$1,340,000',
          icon: 'material-symbols:attach-money',
        },
      ],
    },
    projects: {
      new: [
        {
          label: 'New Projects',
          quantity: 8,
          value: '$456,000',
          icon: 'material-symbols:create-new-folder-outline',
        },
        {
          label: 'New Tasks',
          quantity: 45,
          value: 'N/A',
          icon: 'material-symbols:task-outline',
        },
      ],
      inProgress: [
        {
          label: 'Active Projects',
          quantity: 15,
          value: '$1,230,000',
          icon: 'material-symbols:work-outline',
        },
        {
          label: 'Pending Tasks',
          quantity: 78,
          value: 'N/A',
          icon: 'material-symbols:pending-actions',
        },
      ],
      pipeline: [
        {
          label: 'Projects in Pipeline',
          quantity: 23,
          value: '$2,100,000',
          icon: 'material-symbols:event-upcoming-outline',
        },
        {
          label: 'Scheduled Tasks',
          quantity: 156,
          value: 'N/A',
          icon: 'material-symbols:calendar-month-outline',
        },
      ],
    },
    service: {
      new: [
        {
          label: 'New Tickets',
          quantity: 34,
          value: '$28,500',
          icon: 'material-symbols:confirmation-number-outline',
        },
        {
          label: 'New Service Requests',
          quantity: 12,
          value: '$45,200',
          icon: 'material-symbols:build-outline',
        },
      ],
      inProgress: [
        {
          label: 'Open Tickets',
          quantity: 67,
          value: '$89,300',
          icon: 'material-symbols:support-agent',
        },
        {
          label: 'Active Service Jobs',
          quantity: 23,
          value: '$123,800',
          icon: 'material-symbols:engineering',
        },
      ],
      pipeline: [
        {
          label: 'Scheduled Services',
          quantity: 89,
          value: '$234,500',
          icon: 'material-symbols:schedule',
        },
        {
          label: 'Tickets in Queue',
          quantity: 45,
          value: '$67,200',
          icon: 'material-symbols:queue',
        },
      ],
    },
    inventory: {
      new: [
        {
          label: 'New Orders',
          quantity: 56,
          value: '$123,400',
          icon: 'material-symbols:shopping-cart-outline',
        },
        {
          label: 'New Products',
          quantity: 12,
          value: '$45,600',
          icon: 'material-symbols:add-shopping-cart',
        },
      ],
      inProgress: [
        {
          label: 'Pending Orders',
          quantity: 34,
          value: '$89,700',
          icon: 'material-symbols:local-shipping-outline',
        },
        {
          label: 'Low Stock Items',
          quantity: 23,
          value: '$12,300',
          icon: 'material-symbols:warning-outline',
        },
      ],
      pipeline: [
        {
          label: 'Orders in Pipeline',
          quantity: 78,
          value: '$234,500',
          icon: 'material-symbols:inventory',
        },
        {
          label: 'Incoming Shipments',
          quantity: 15,
          value: '$567,800',
          icon: 'material-symbols:package-2-outline',
        },
      ],
    },
  };

  return baseMetrics[deskType] || baseMetrics.business;
};

export const getSideDeskMetrics = (deskType) => {
  return generateMockMetrics(deskType);
};
