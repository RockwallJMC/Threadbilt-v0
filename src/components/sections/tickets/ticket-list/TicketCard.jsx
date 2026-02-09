'use client';

import { useState } from 'react';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  IconButton,
  Typography,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import TicketCardMap from './TicketCardMap';

const statusColors = {
  emergency: 'error',
  'in-progress': 'warning',
  scheduled: 'info',
  complete: 'success',
};

const priorityColors = {
  high: 'error.main',
  medium: 'warning.main',
  low: 'success.main',
};

const TicketCard = ({ ticket }) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: 4,
        borderLeftColor: priorityColors[ticket.priority] || 'grey.300',
      }}
    >
      <CardHeader
        title={`Ticket #${ticket.id}`}
        subheader={ticket.customer.address}
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
        subheaderTypographyProps={{ variant: 'body2', noWrap: true }}
        action={
          <Chip
            label={ticket.status}
            color={statusColors[ticket.status] || 'default'}
            size="small"
            sx={{ textTransform: 'capitalize' }}
          />
        }
        sx={{ pb: 1 }}
      />
      <TicketCardMap address={ticket.customer.address} height={200} />
      <CardContent sx={{ flexGrow: 1, py: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          {ticket.serviceType}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
          {ticket.scheduledDate.date} at {ticket.scheduledDate.time}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites" size="small">
          <IconifyIcon icon="material-symbols-light:favorite" fontSize={20} />
        </IconButton>
        <IconButton aria-label="share" size="small">
          <IconifyIcon icon="material-symbols-light:share" fontSize={20} />
        </IconButton>
        <IconButton
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
          size="small"
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            marginLeft: 'auto',
            transition: (theme) =>
              theme.transitions.create('transform', {
                duration: theme.transitions.duration.shortest,
              }),
          }}
        >
          <IconifyIcon icon="material-symbols-light:expand-all" fontSize={20} />
        </IconButton>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Customer Details:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {ticket.customer.name}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            Assigned Technician:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {ticket.technician.name}
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default TicketCard;
