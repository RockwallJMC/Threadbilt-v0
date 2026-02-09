'use client';

import { useMemo } from 'react';
import Grid from '@mui/material/Grid';
import TicketCard from './TicketCard';

const TicketCardGrid = ({ data, filterModel }) => {
  const filteredData = useMemo(() => {
    if (!filterModel?.items?.length) {
      return data;
    }

    return data.filter((ticket) => {
      return filterModel.items.every((filter) => {
        if (filter.field === 'status' && filter.operator === 'equals') {
          return ticket.status === filter.value;
        }
        return true;
      });
    });
  }, [data, filterModel]);

  return (
    <Grid container spacing={3}>
      {filteredData.map((ticket) => (
        <Grid key={ticket.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <TicketCard ticket={ticket} />
        </Grid>
      ))}
    </Grid>
  );
};

export default TicketCardGrid;
