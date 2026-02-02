'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Collapse,
  Avatar,
  IconButton,
  Typography,
  Stack,
  Box,
} from '@mui/material';
import useNumberFormat from 'hooks/useNumberFormat';
import IconifyIcon from 'components/base/IconifyIcon';

const KPI = ({ title, subtitle, value, icon }) => {
  const { numberFormat } = useNumberFormat();
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card
      background={1}
      variant="outlined"
      sx={(theme) => ({
        boxShadow: `0 0 20px ${theme.vars.palette.divider}`,
        border: '0.5px solid white',
        borderRadius: '8px',
      })}
    >
      <CardHeader
        avatar={
          <Avatar
            sx={(theme) => ({
              bgcolor: 'transparent',
              border: `0.5px solid ${theme.vars.palette.primary.main}`,
              boxShadow: `inset 0 0 20px ${theme.vars.palette.divider}`
            })}
            aria-label={title}
          >
            <IconifyIcon icon={icon.name} sx={(theme) => ({ fontSize: 24, color: theme.vars.palette.primary.main })} />
          </Avatar>
        }
        action={
          <IconButton aria-label="settings">
            <IconifyIcon icon="material-symbols-light:more-vert" />
          </IconButton>
        }
        title={title}
        titleTypographyProps={{ noWrap: true }}
        subheader="Real-time"
      />
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
          {typeof value === 'number' ? numberFormat(value) : value}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {subtitle}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="customize view">
          <IconifyIcon icon="material-symbols-light:tune" />
        </IconButton>
        <IconButton aria-label="export data">
          <IconifyIcon icon="material-symbols-light:download" />
        </IconButton>
        <IconButton aria-label="set alert">
          <IconifyIcon icon="material-symbols-light:notifications" />
        </IconButton>
        <IconButton
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show details"
          sx={(theme) => ({
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            marginLeft: 'auto',
            border: expanded ? `0.8px solid ${theme.vars.palette.secondary.main}` : 'none',
            transition: theme.transitions.create(['transform', 'border'], {
              duration: theme.transitions.duration.shortest,
            }),
          })}
        >
          <IconifyIcon icon="material-symbols-light:expand-more" />
        </IconButton>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
            KPI Details
          </Typography>

          <Stack spacing={1.5}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Previous Period
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {typeof value === 'number' ? numberFormat(value * 0.93) : 'N/A'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Change
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                +7.2% ↑
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Target
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {typeof value === 'number' ? numberFormat(value * 1.1) : 'N/A'}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default KPI;
