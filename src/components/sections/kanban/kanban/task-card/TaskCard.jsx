import { memo, useMemo } from 'react';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import TicketCard from 'components/common/TicketCard';

const getLabelColorHex = (val) => {
  switch (val) {
    case 'feature':
      return '#1E88E5';
    case 'issue':
      return '#FB8C00';
    case 'bug':
      return '#E53935';
    default:
      return '#455A64';
  }
};

const TaskCard = memo(({ task }) => {
  const assignee = useMemo(() => task.assignee?.[0], [task.assignee]);
  const dueLabel = useMemo(
    () => (task.dueDate ? dayjs(task.dueDate).format('D MMM, YYYY') : null),
    [task.dueDate],
  );

  return (
    <Box
      data-draggable-ticket
      data-ticket-id={task.id}
      data-ticket-title={task.title}
      data-ticket-address={task.label || 'unlabeled'}
      data-ticket-city={task.priority || 'priority'}
      data-ticket-state={dueLabel || 'No due date'}
      data-ticket-zip=""
      data-ticket-techname={assignee?.name || ''}
      data-ticket-techavatar={assignee?.avatar || ''}
      data-ticket-color={getLabelColorHex(task.label)}
      sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
    >
      <TicketCard
        title={task.title}
        address={task.label || 'unlabeled'}
        city={task.priority || 'priority'}
        state={dueLabel || 'No due date'}
        zip=""
        chipName={assignee?.name}
        chipAvatar={assignee?.avatar}
        laneColor={getLabelColorHex(task.label)}
      />
    </Box>
  );
});

export default TaskCard;
