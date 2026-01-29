'use client';

import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import DashboardMenu from 'components/common/DashboardMenu';
import { useOpportunities } from 'services/swr/api-hooks/useOpportunitiesApi';
import OpportunityCard from './OpportunityCard';

const OngoingOpportunities = ({ leadId }) => {
  // Fetch opportunities converted from this lead
  // TODO Phase 1.2: Add converted_from_lead_id filter when Supabase integration is complete
  // For now, showing all opportunities as mock data doesn't have converted_from_lead_id field
  const { data: opportunities, error, isLoading } = useOpportunities();

  // Filter opportunities by converted_from_lead_id
  // TODO Phase 1.2: This will properly filter when converted_from_lead_id is added to schema
  const filteredOpportunities = opportunities?.filter(
    (opp) => opp.converted_from_lead_id === leadId
  ) || [];

  // TEMPORARY: For Phase 1.4 UI demonstration, show all opportunities if filter returns empty
  // This will be removed once Phase 1.2 Supabase integration adds converted_from_lead_id
  const displayOpportunities = filteredOpportunities.length > 0 ? filteredOpportunities : (opportunities || []);

  return (
    <Paper sx={{ px: { xs: 3, md: 5 }, py: 5, flex: 1, height: 1 }}>
      <Stack sx={{ mb: 4, justifyContent: 'space-between' }}>
        <Typography variant="h6">Ongoing Opportunities</Typography>
        <Stack gap={1}>
          <Button
            variant="contained"
            href={paths.opportunities}
            startIcon={<IconifyIcon icon="material-symbols:add" />}
          >
            New Opportunity
          </Button>
          <DashboardMenu size="medium" />
        </Stack>
      </Stack>

      {/* Loading State */}
      {isLoading && (
        <Typography variant="body2" color="text.secondary">
          Loading opportunities...
        </Typography>
      )}

      {/* Error State */}
      {error && (
        <Typography variant="body2" color="error">
          Failed to load opportunities
        </Typography>
      )}

      {/* Opportunities List */}
      {!isLoading && !error && (
        <Stack direction="column" gap={2}>
          {displayOpportunities.length > 0 ? (
            displayOpportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))
          ) : (
            // Empty State
            <Stack
              spacing={2}
              sx={{
                alignItems: 'center',
                justifyContent: 'center',
                py: 6,
                textAlign: 'center',
              }}
            >
              <IconifyIcon
                icon="material-symbols:lightbulb-outline"
                sx={{ fontSize: 48, color: 'text.secondary' }}
              />
              <div>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  No opportunities yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Convert this lead to create an opportunity
                </Typography>
              </div>
            </Stack>
          )}
        </Stack>
      )}
    </Paper>
  );
};

export default OngoingOpportunities;
