const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

// Resource Schedule (Technician rows)
// Note: `rowClass` drives row styling (left color + avatar), `taskClass` drives bar color.
export const resourceScheduleTimelineData = [
  {
    id: 'tech-1',
    label: 'Alex Rivera',
    rowClass: 'tech-blue',
    taskClass: 'tech-blue',
    tasks: [
      {
        id: 't-101',
        label: 'PM: HVAC Tune-Up',
        amountDone: 100,
        startDate: new Date(currentYear, currentMonth, 1, 8).getTime(),
        endDate: new Date(currentYear, currentMonth, 1, 12).getTime(),
      },
      {
        id: 't-102',
        label: 'Service Call: No Heat',
        amountDone: 75,
        startDate: new Date(currentYear, currentMonth, 2, 9).getTime(),
        endDate: new Date(currentYear, currentMonth, 2, 15).getTime(),
      },
      {
        id: 't-103',
        label: 'Install: Smart Thermostat',
        amountDone: 0,
        startDate: new Date(currentYear, currentMonth, 4, 10).getTime(),
        endDate: new Date(currentYear, currentMonth, 4, 13).getTime(),
      },
    ],
  },
  {
    id: 'tech-2',
    label: 'Brooke Chen',
    rowClass: 'tech-orange',
    taskClass: 'tech-orange',
    tasks: [
      {
        id: 't-201',
        label: 'Estimate: Panel Upgrade',
        amountDone: 100,
        startDate: new Date(currentYear, currentMonth, 1, 9).getTime(),
        endDate: new Date(currentYear, currentMonth, 1, 11).getTime(),
      },
      {
        id: 't-202',
        label: 'Repair: Outlet Short',
        amountDone: 30,
        startDate: new Date(currentYear, currentMonth, 3, 8).getTime(),
        endDate: new Date(currentYear, currentMonth, 3, 12).getTime(),
      },
      {
        id: 't-203',
        label: 'Install: EV Charger',
        amountDone: 0,
        startDate: new Date(currentYear, currentMonth, 6, 10).getTime(),
        endDate: new Date(currentYear, currentMonth, 6, 16).getTime(),
      },
    ],
  },
  {
    id: 'tech-3',
    label: 'Carlos Diaz',
    rowClass: 'tech-green',
    taskClass: 'tech-green',
    tasks: [
      {
        id: 't-301',
        label: 'Install: Water Heater',
        amountDone: 100,
        startDate: new Date(currentYear, currentMonth, 2, 8).getTime(),
        endDate: new Date(currentYear, currentMonth, 2, 14).getTime(),
      },
      {
        id: 't-302',
        label: 'Leak Check + Repair',
        amountDone: 60,
        startDate: new Date(currentYear, currentMonth, 5, 9).getTime(),
        endDate: new Date(currentYear, currentMonth, 5, 13).getTime(),
      },
      {
        id: 't-303',
        label: 'Install: Garbage Disposal',
        amountDone: 0,
        startDate: new Date(currentYear, currentMonth, 7, 11).getTime(),
        endDate: new Date(currentYear, currentMonth, 7, 14).getTime(),
      },
    ],
  },
  {
    id: 'tech-4',
    label: 'Dana Patel',
    rowClass: 'tech-purple',
    taskClass: 'tech-purple',
    tasks: [
      {
        id: 't-401',
        label: 'Maintenance: Filter Swap',
        amountDone: 100,
        startDate: new Date(currentYear, currentMonth, 1, 13).getTime(),
        endDate: new Date(currentYear, currentMonth, 1, 16).getTime(),
      },
      {
        id: 't-402',
        label: 'Repair: Blower Motor',
        amountDone: 20,
        startDate: new Date(currentYear, currentMonth, 4, 8).getTime(),
        endDate: new Date(currentYear, currentMonth, 4, 12).getTime(),
      },
      {
        id: 't-403',
        label: 'Install: Duct Sealing',
        amountDone: 0,
        startDate: new Date(currentYear, currentMonth, 8, 10).getTime(),
        endDate: new Date(currentYear, currentMonth, 8, 15).getTime(),
      },
    ],
  },
  {
    id: 'tech-5',
    label: 'Evan Thompson',
    rowClass: 'tech-red',
    taskClass: 'tech-red',
    tasks: [
      {
        id: 't-501',
        label: 'Emergency: Burst Pipe',
        amountDone: 90,
        startDate: new Date(currentYear, currentMonth, 3, 7).getTime(),
        endDate: new Date(currentYear, currentMonth, 3, 11).getTime(),
      },
      {
        id: 't-502',
        label: 'Follow-up: Pressure Test',
        amountDone: 0,
        startDate: new Date(currentYear, currentMonth, 6, 9).getTime(),
        endDate: new Date(currentYear, currentMonth, 6, 12).getTime(),
      },
      {
        id: 't-503',
        label: 'Install: Sump Pump',
        amountDone: 0,
        startDate: new Date(currentYear, currentMonth, 10, 10).getTime(),
        endDate: new Date(currentYear, currentMonth, 10, 15).getTime(),
      },
    ],
  },
  {
    id: 'tech-6',
    label: 'Farah Johnson',
    rowClass: 'tech-cyan',
    taskClass: 'tech-cyan',
    tasks: [
      {
        id: 't-601',
        label: 'PM: Unit Inspection',
        amountDone: 100,
        startDate: new Date(currentYear, currentMonth, 2, 13).getTime(),
        endDate: new Date(currentYear, currentMonth, 2, 16).getTime(),
      },
      {
        id: 't-602',
        label: 'Repair: Capacitor Swap',
        amountDone: 40,
        startDate: new Date(currentYear, currentMonth, 5, 8).getTime(),
        endDate: new Date(currentYear, currentMonth, 5, 12).getTime(),
      },
      {
        id: 't-603',
        label: 'Install: UV Air Purifier',
        amountDone: 0,
        startDate: new Date(currentYear, currentMonth, 9, 9).getTime(),
        endDate: new Date(currentYear, currentMonth, 9, 13).getTime(),
      },
    ],
  },
];
