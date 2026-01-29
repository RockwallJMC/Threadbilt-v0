'use client';

import { Chip } from '@mui/material';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import useNumberFormat from 'hooks/useNumberFormat';
import paths from 'routes/paths';
import { OPPORTUNITY_STAGES } from 'data/crm/opportunities';

// Helper to get stage color based on stage value
const getStageColor = (stage) => {
  const stageConfig = OPPORTUNITY_STAGES.find((s) => s.value === stage);
  if (!stageConfig) return 'default';

  switch (stage) {
    case 'qualification':
      return 'info';
    case 'proposal':
      return 'warning';
    case 'negotiation':
      return 'primary';
    case 'closed_won':
      return 'success';
    case 'closed_lost':
      return 'error';
    default:
      return 'default';
  }
};

const OpportunityCard = ({ opportunity }) => {
  const { currencyFormat } = useNumberFormat();

  // Get stage configuration
  const stageConfig = OPPORTUNITY_STAGES.find((s) => s.value === opportunity.stage);
  const stageLabel = stageConfig?.label || opportunity.stage;
  const probability = opportunity.probability ?? stageConfig?.probability ?? 0;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor:
          opportunity.stage === 'closed_won' || opportunity.stage === 'closed_lost'
            ? 'background.elevation2'
            : 'background.elevation1',
      }}
    >
      <Stack direction="column" gap={2}>
        {/* Opportunity Name */}
        <Typography
          variant="body2"
          component={Link}
          href={`/apps/crm/opportunities/${opportunity.id}`}
          sx={{ fontWeight: 700 }}
        >
          {opportunity.name}
        </Typography>

        {/* Account Name */}
        <Typography variant="body2" color="text.secondary">
          <Box component="span" sx={{ fontWeight: 600 }}>
            Account:
          </Box>{' '}
          {opportunity.company?.name || 'N/A'}
        </Typography>

        {/* Value and Stage Row */}
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Value */}
          <Typography variant="body2">
            <Box component="span" sx={{ fontWeight: 600 }}>
              Value:
            </Box>{' '}
            {currencyFormat(opportunity.amount, {
              style: 'currency',
              maximumFractionDigits: 0,
              useGrouping: true,
            })}
          </Typography>

          {/* Stage Chip */}
          <Chip label={stageLabel} color={getStageColor(opportunity.stage)} size="small" />
        </Stack>

        {/* Probability and Expected Close Date Row */}
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Probability */}
          <Typography variant="body2">
            <Box component="span" sx={{ fontWeight: 600 }}>
              Probability:
            </Box>{' '}
            {probability}%
          </Typography>

          {/* Expected Close Date */}
          <Typography variant="body2">
            <Box component="span" sx={{ fontWeight: 600 }}>
              Expected Close:
            </Box>{' '}
            {opportunity.closeDate
              ? dayjs(opportunity.closeDate).format('DD MMM, YYYY')
              : 'Not set'}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default OpportunityCard;
