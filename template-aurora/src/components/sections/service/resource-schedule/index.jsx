'use client';

import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DataGrid } from '@mui/x-data-grid';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import IconifyIcon from 'components/base/IconifyIcon';

const HOURS = Array.from({ length: 10 }, (_, index) => {
  const hour = 8 + index;
  const label = `${hour.toString().padStart(2, '0')}:00`;
  return { id: label, label };
});

const TECHNICIANS = [
  {
    id: 'tech-1',
    name: 'Avery Chen',
    role: 'Senior Tech',
    zone: 'North',
    avatar: 'https://i.pravatar.cc/80?img=12',
  },
  {
    id: 'tech-2',
    name: 'Jordan Blake',
    role: 'Field Tech',
    zone: 'West',
    avatar: 'https://i.pravatar.cc/80?img=32',
  },
  {
    id: 'tech-3',
    name: 'Riley Patel',
    role: 'Field Tech',
    zone: 'Central',
    avatar: 'https://i.pravatar.cc/80?img=47',
  },
  {
    id: 'tech-4',
    name: 'Morgan Lee',
    role: 'Apprentice',
    zone: 'South',
    avatar: 'https://i.pravatar.cc/80?img=14',
  },
];

const INITIAL_TICKETS = [
  {
    id: 'ticket-1004',
    title: 'AC unit short cycling',
    priority: 'High',
    address: '290 King St',
    status: 'unscheduled',
  },
  {
    id: 'ticket-1007',
    title: 'Water heater leak',
    priority: 'Urgent',
    address: '14 Waverly Ave',
    status: 'unscheduled',
  },
  {
    id: 'ticket-1012',
    title: 'Install smart thermostat',
    priority: 'Normal',
    address: '77 Mission Blvd',
    status: 'unscheduled',
  },
  {
    id: 'ticket-1018',
    title: 'Breaker panel inspection',
    priority: 'Normal',
    address: '501 Oak Ridge',
    status: 'unscheduled',
  },
  {
    id: 'ticket-1023',
    title: 'Gas line pressure check',
    priority: 'High',
    address: '1887 Harbor Dr',
    status: 'unscheduled',
  },
];

const priorityColor = {
  Urgent: 'error',
  High: 'warning',
  Normal: 'info',
};

const TicketCard = ({ ticket, compact = false }) => (
  <Paper
    elevation={0}
    sx={(theme) => ({
      p: compact ? 0.75 : 1.25,
      borderRadius: 2,
      border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
      background: alpha(theme.palette.primary.main, 0.06),
    })}
  >
    <Stack spacing={0.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Typography variant="subtitle2" fontWeight={600} noWrap>
          {ticket.title}
        </Typography>
        <Chip
          size="small"
          color={priorityColor[ticket.priority] || 'default'}
          label={ticket.priority}
          sx={{ textTransform: 'uppercase', letterSpacing: 0.4, fontSize: 10 }}
        />
      </Stack>
      <Typography variant="caption" color="text.secondary" noWrap>
        {ticket.address}
      </Typography>
      {!compact && (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <IconifyIcon icon="material-symbols:confirmation-number-outline" fontSize={14} />
          <Typography variant="caption" color="text.secondary">
            {ticket.id}
          </Typography>
        </Stack>
      )}
    </Stack>
  </Paper>
);

const DraggableTicket = ({ ticket }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ticket.id,
  });

  return (
    <Box
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      sx={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : 'translate3d(0,0,0)',
        opacity: isDragging ? 0.4 : 1,
        cursor: 'grab',
      }}
    >
      <TicketCard ticket={ticket} />
    </Box>
  );
};

const UnscheduledLane = ({ id, children, count }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'unscheduled' },
  });

  return (
    <Paper
      ref={setNodeRef}
      background={1}
      elevation={0}
      sx={(theme) => ({
        p: { xs: 3, md: 5 },
        borderRadius: 6,
        border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
        backgroundColor: isOver ? alpha(theme.palette.primary.main, 0.12) : undefined,
        transition: 'background-color 150ms ease',
      })}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            Unscheduled
          </Typography>
          <Chip size="small" label={count} />
        </Stack>
        <Divider />
        <Box sx={{ overflowX: 'auto', pb: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="stretch">
            {children}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

const ScheduleCell = ({ techId, hour, ticket }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${techId}-${hour}`,
    data: { type: 'cell', techId, hour },
  });

  return (
    <Box
      ref={setNodeRef}
      sx={(theme) => ({
        minHeight: 96,
        p: 0.5,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
        backgroundColor: isOver ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
        transition: 'background-color 150ms ease',
      })}
    >
      {ticket ? <DraggableTicket ticket={ticket} /> : null}
    </Box>
  );
};

const ResourceSchedule = () => {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [priorityFilters, setPriorityFilters] = useState(['Urgent', 'High', 'Normal']);
  const [density, setDensity] = useState('compact');
  const [search, setSearch] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 80, tolerance: 5 } }),
  );

  const normalizedSearch = search.trim().toLowerCase();

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => priorityFilters.includes(ticket.priority));
  }, [tickets, priorityFilters]);

  const unscheduledTickets = useMemo(() => {
    const list = filteredTickets.filter((ticket) => ticket.status === 'unscheduled');
    if (!normalizedSearch) return list;
    return list.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(normalizedSearch) ||
        ticket.address.toLowerCase().includes(normalizedSearch) ||
        ticket.id.toLowerCase().includes(normalizedSearch),
    );
  }, [filteredTickets, normalizedSearch]);

  const scheduledTicketsCount = useMemo(() => {
    return filteredTickets.filter((ticket) => ticket.status === 'scheduled').length;
  }, [filteredTickets]);

  const scheduledMap = useMemo(() => {
    const map = new Map();
    filteredTickets.forEach((ticket) => {
      if (ticket.status === 'scheduled' && ticket.techId && ticket.hour) {
        map.set(`${ticket.techId}::${ticket.hour}`, ticket);
      }
    });
    return map;
  }, [filteredTickets]);

  const filteredTechs = useMemo(() => {
    if (!normalizedSearch) return TECHNICIANS;
    return TECHNICIANS.filter(
      (tech) =>
        tech.name.toLowerCase().includes(normalizedSearch) ||
        tech.role.toLowerCase().includes(normalizedSearch) ||
        tech.zone.toLowerCase().includes(normalizedSearch),
    );
  }, [normalizedSearch]);

  const handleDragStart = (event) => {
    setActiveTicketId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTicketId(null);

    if (!over) return;
    if (active.id === over.id) return;

    const targetType = over.data?.current?.type;

    if (targetType === 'unscheduled') {
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === active.id
            ? { ...ticket, status: 'unscheduled', techId: null, hour: null }
            : ticket,
        ),
      );
      return;
    }

    if (targetType === 'cell') {
      const { techId, hour } = over.data.current;
      const occupied = tickets.find(
        (ticket) => ticket.status === 'scheduled' && ticket.techId === techId && ticket.hour === hour,
      );

      setTickets((prev) =>
        prev.map((ticket) => {
          if (ticket.id === active.id) {
            return { ...ticket, status: 'scheduled', techId, hour };
          }
          if (occupied && ticket.id === occupied.id) {
            return { ...ticket, status: 'unscheduled', techId: null, hour: null };
          }
          return ticket;
        }),
      );
    }
  };

  const activeTicket = tickets.find((ticket) => ticket.id === activeTicketId);

  const columns = useMemo(() => {
    return [
      {
        field: 'technician',
        headerName: 'Technicians',
        flex: 1,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const tech = params.row;
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar src={tech.avatar} alt={tech.name} sx={{ width: 40, height: 40 }} />
              <Stack spacing={0.3}>
                <Typography variant="subtitle2" fontWeight={600} noWrap>
                  {tech.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {tech.role} - {tech.zone}
                </Typography>
              </Stack>
            </Stack>
          );
        },
      },
      ...HOURS.map((hour) => ({
        field: `hour_${hour.id}`,
        headerName: hour.label,
        flex: 1,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const techId = params.row.id;
          const ticket = scheduledMap.get(`${techId}::${hour.id}`);
          return <ScheduleCell techId={techId} hour={hour.id} ticket={ticket} />;
        },
      })),
    ];
  }, [scheduledMap]);

  const rows = filteredTechs.map((tech) => ({
    id: tech.id,
    technician: tech.name,
    ...tech,
  }));

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Stack spacing={{ xs: 2, md: 3 }}>
          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="stretch">
            <Grid size={{ xs: 12, lg: 4, xl: 3 }}>
              <Paper background={1} sx={{ p: { xs: 3, md: 5 }, borderRadius: 6, height: 1 }}>
                <Stack spacing={2}>
                  <Stack spacing={1}>
                    <Typography variant="h4" fontWeight={700}>
                      Resource Schedule
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Dispatch tickets across technicians and time slots for{' '}
                      {selectedDate.format('dddd, MMM D')}.
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip label={`${unscheduledTickets.length} Unscheduled`} size="small" />
                    <Chip label={`${scheduledTicketsCount} Scheduled`} size="small" variant="outlined" />
                  </Stack>

                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Density
                    </Typography>
                    <ToggleButtonGroup
                      size="small"
                      exclusive
                      value={density}
                      onChange={(_, value) => value && setDensity(value)}
                      sx={(theme) => ({
                        background: alpha(theme.palette.primary.main, 0.06),
                        borderRadius: 2,
                        p: 0.5,
                      })}
                    >
                      <ToggleButton value="compact" sx={{ px: 2, textTransform: 'none' }}>
                        Compact
                      </ToggleButton>
                      <ToggleButton value="comfortable" sx={{ px: 2, textTransform: 'none' }}>
                        Comfortable
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 8, xl: 9 }}>
              <Paper background={1} sx={{ p: { xs: 3, md: 5 }, borderRadius: 6, height: 1 }}>
                <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
                  <Grid size={{ xs: 12, md: 7 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {['Urgent', 'High', 'Normal'].map((priority) => (
                        <Chip
                          key={priority}
                          color={priorityColor[priority] || 'default'}
                          variant={priorityFilters.includes(priority) ? 'filled' : 'outlined'}
                          label={priority}
                          onClick={() => {
                            setPriorityFilters((prev) =>
                              prev.includes(priority)
                                ? prev.filter((value) => value !== priority)
                                : [...prev, priority],
                            );
                          }}
                        />
                      ))}
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                      flexWrap="wrap"
                    >
                      <TextField
                        size="small"
                        placeholder="Search techs or tickets"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        sx={{ minWidth: { xs: 1, sm: 220 } }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <IconifyIcon icon="material-symbols:search" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setSelectedDate(dayjs())}
                      >
                        Today
                      </Button>
                      <Button variant="outlined" size="small" sx={{ minWidth: 120 }}>
                        {selectedDate.format('MMMM')}
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => setSelectedDate((prev) => prev.subtract(1, 'day'))}
                      >
                        <IconifyIcon icon="material-symbols:chevron-left-rounded" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setSelectedDate((prev) => prev.add(1, 'day'))}
                      >
                        <IconifyIcon icon="material-symbols:chevron-right-rounded" />
                      </IconButton>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          <UnscheduledLane id="lane-unscheduled" count={unscheduledTickets.length}>
            {unscheduledTickets.map((ticket) => (
              <DraggableTicket key={ticket.id} ticket={ticket} />
            ))}
          </UnscheduledLane>

          <Paper background={1} sx={{ p: { xs: 3, md: 5 }, borderRadius: 6, width: 1 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Stack spacing={0.3}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Dispatch Board
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Assign tickets to technicians and hourly slots.
                  </Typography>
                </Stack>
                <Chip label={selectedDate.format('ddd, MMM D')} size="small" />
              </Stack>

              <Box
                sx={(theme) => ({
                  width: 1,
                  minWidth: { xs: 720, md: 960 },
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                })}
              >
                <DataGrid
                  autoHeight
                  rows={rows}
                  columns={columns}
                  disableColumnMenu
                  disableRowSelectionOnClick
                  hideFooter
                  density={density}
                  rowHeight={density === 'comfortable' ? 120 : 92}
                  columnHeaderHeight={56}
                  disableVirtualization
                  sx={(theme) => ({
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                    },
                    '& .MuiDataGrid-cell': {
                      py: 1,
                      borderColor: alpha(theme.palette.divider, 0.4),
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                    '& .MuiDataGrid-columnSeparator': {
                      color: alpha(theme.palette.divider, 0.3),
                    },
                  })}
                />
              </Box>
            </Stack>
          </Paper>
        </Stack>

        <DragOverlay>{activeTicket ? <TicketCard ticket={activeTicket} compact /> : null}</DragOverlay>
      </DndContext>
    </Box>
  );
};

export default ResourceSchedule;
