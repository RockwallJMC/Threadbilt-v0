'use client';

import { Box, Button, Card, CardContent, Divider, Popover, Stack, Typography } from '@mui/material';
import { getServicePropertyById } from 'data/service/service-properties';
import dayjs from 'dayjs';

const TicketPopover = ({ anchorEl, open, onClose, task, onOpenDrawer }) => {
  if (!task) return null;

  const property = getServicePropertyById(task.pipelineData?.id);
  const startTime = dayjs(task.from).format('h:mm A');
  const endTime = dayjs(task.to).format('h:mm A');
  const duration = Math.round((task.to - task.from) / 60000);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            boxShadow: 6,
            mt: -1,
          },
        },
      }}
    >
      <Card sx={{ minWidth: 280, maxWidth: 360 }}>
        <CardContent sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                {task.label || property?.name || 'Service Ticket'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {task.status || 'Pending'}
              </Typography>
            </Box>

            <Divider />

            <Stack spacing={0.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Start:
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {startTime}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  End:
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {endTime}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Duration:
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {duration} min
                </Typography>
              </Box>
            </Stack>

            {task.amountDone !== undefined && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Progress: {Math.round(task.amountDone)}%
                </Typography>
                <Box
                  sx={{
                    width: 1,
                    height: 6,
                    bgcolor: 'grey.200',
                    borderRadius: 1,
                    mt: 0.5,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      width: `${task.amountDone}%`,
                      height: 1,
                      bgcolor: 'success.main',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
              </Box>
            )}

            <Divider />

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={onClose}
                sx={{ fontSize: 11, fontWeight: 700 }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                size="small"
                fullWidth
                onClick={() => {
                  onClose();
                  onOpenDrawer?.();
                }}
                sx={{ fontSize: 11, fontWeight: 700 }}
              >
                Full Details
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Popover>
  );
};

export default TicketPopover;
