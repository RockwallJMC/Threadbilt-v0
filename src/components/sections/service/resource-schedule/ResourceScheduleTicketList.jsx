'use client';

import Stack from '@mui/material/Stack';
import ResourceScheduleTicketItem from './ResourceScheduleTicketItem';

const ResourceScheduleTicketList = ({
  ganttInstance,
  onDropToGantt,
  snapMs,
  durationMs,
  lanes = [],
  activeLane = 0,
}) => {
  const currentLane = lanes[activeLane] ?? lanes[0];

  return (
    <Stack direction="column" gap={1} sx={{ width: 1, pb: 2, pt: 1 }}>
      {currentLane ? (
        <Stack direction="column" gap={1} sx={{ width: 1 }}>
          {currentLane.items.map((pipeline) => (
            <ResourceScheduleTicketItem
              key={pipeline.id}
              pipeline={pipeline}
              ganttInstance={ganttInstance}
              onDropToGantt={onDropToGantt}
              snapMs={snapMs}
              durationMs={durationMs}
            />
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
};

export default ResourceScheduleTicketList;
