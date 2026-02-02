const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

export const serviceTimelineData = [
  {
    id: 1,
    label: 'Design new app',
    status: 'ongoing',
    tasks: [
      {
        id: 1,
        label: 'Research User Needs',
        amountDone: 100,
        startDate: new Date(currentYear, currentMonth, 1).getTime(),
        endDate: new Date(currentYear, currentMonth, 10).getTime(),
      },
      {
        id: 2,
        label: 'Create Wireframe Layouts',
        amountDone: 100,
        startDate: new Date(currentYear, currentMonth, 11).getTime(),
        endDate: new Date(currentYear, currentMonth, 20).getTime(),
      },
      {
        id: 15,
        label: 'Post-Deployment Monitoring',
        amountDone: 0,
        startDate: new Date(currentYear, currentMonth, 22).getTime(),
        endDate: new Date(currentYear, currentMonth + 1, 10).getTime(),
      },
      {
        id: 16,
        label: 'Final System Optimizations',
        amountDone: 0,
        startDate: new Date(currentYear, currentMonth + 1, 11).getTime(),
        endDate: new Date(currentYear, currentMonth + 1, 26).getTime(),
      },
    ],
  },
  {
    id: 2,
    label: 'New dashboard',
    status: 'ongoing',
    tasks: [
      {
        id: 3,
        label: 'Finish designing',
        amountDone: 90,
        startDate: new Date(currentYear, currentMonth, 1).getTime(),
        endDate: new Date(currentYear, currentMonth, 5).getTime(),
      },
      {
        id: 4,
        label: 'System Deployment',
        amountDone: 90,
        startDate: new Date(currentYear, currentMonth, 6).getTime(),
        endDate: new Date(currentYear, currentMonth, 24).getTime(),
      },
      {
        id: 13,
        label: 'User Testing and Feedback',
        amountDone: 0,
        startDate: new Date(currentYear, currentMonth, 25).getTime(),
        endDate: new Date(currentYear, currentMonth + 1, 15).getTime(),
      },
      {
        id: 14,
        label: 'Design Finalization',
        amountDone: 0,
        startDate: new Date(currentYear, currentMonth + 1, 16).getTime(),
        endDate: new Date(currentYear, currentMonth + 1, 27).getTime(),
      },
    ],
  },
  {
    id: 3,
    label: 'Falcon Development',
    status: 'due',
    tasks: [
      {
        id: 5,
        label: 'Analyze Competitor Apps',
        amountDone: 0,
        startDate: new Date(currentYear, currentMonth, 1).getTime(),
        endDate: new Date(currentYear, currentMonth, 9).getTime(),
      },
      {
        id: 6,
        label: 'Design Database Schema',
        amountDone: 0,
        startDate: new Date(currentYear, currentMonth, 10).getTime(),
        endDate: new Date(currentYear, currentMonth, 27).getTime(),
      },
      {
        id: 17,
        label: 'Setup Development Environment',
        amountDone: 0,
        startDate: new Date(currentYear, currentMonth, 28).getTime(),
        endDate: new Date(currentYear, currentMonth + 1, 10).getTime(),
      },
      {
        id: 18,
        label: 'Begin Core Development',
        amountDone: 0,
        startDate: new Date(currentYear, currentMonth + 1, 11).getTime(),
        endDate: new Date(currentYear, currentMonth + 1, 28).getTime(),
      },
    ],
  },
  {
    id: 4,
    label: 'Phoenix Travel App ',
    status: 'complete',
    tasks: [
      {
        id: 7,
        label: 'Develop Backend Services',
        amountDone: 100,
        startDate: new Date(currentYear, currentMonth, 1).getTime(),
        endDate: new Date(currentYear, currentMonth, 3).getTime(),
      },
      {
        id: 8,
        label: 'Gather User Requirements',
        amountDone: 100,
        startDate: new Date(currentYear, currentMonth, 4).getTime(),
        endDate: new Date(currentYear, currentMonth, 31).getTime(),
      },
    ],
  },
];
