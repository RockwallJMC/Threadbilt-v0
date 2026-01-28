'use client';

import { useParams } from 'next/navigation';
import { Button, Chip, FormControl, MenuItem, Select, Skeleton, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { contactInfoData, ongoingDealsData } from 'data/crm/lead-details';
import { useLead, useUpdateLead } from 'services/swr/api-hooks/useLeadApi';
import ActivityTabs from 'components/sections/crm/common/ActivityTabs';
import IconifyIcon from 'components/base/IconifyIcon';
import ContactInfo from 'components/sections/crm/lead-details/ContactInfo';
import LeadDetailsHeader from 'components/sections/crm/lead-details/LeadDetailsHeader';
import OngoingDeals from 'components/sections/crm/lead-details/OngoingDeals';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'default' },
  { value: 'contacted', label: 'Contacted', color: 'info' },
  { value: 'qualified', label: 'Qualified', color: 'success' },
  { value: 'unqualified', label: 'Unqualified', color: 'error' },
  { value: 'converted', label: 'Converted', color: 'success' },
];

const getStatusColor = (status) => {
  const option = STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.color || 'default';
};

const LeadDetails = () => {
  const params = useParams();
  const leadId = params?.id;

  // Fetch lead data
  const { data: lead, error, isLoading, mutate } = useLead(leadId);
  const { trigger: updateLead, isMutating } = useUpdateLead();

  // Handle status change with optimistic UI update
  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    const previousLead = lead;

    // Optimistic update
    mutate({ ...lead, status: newStatus }, false);

    try {
      await updateLead({
        id: leadId,
        updates: { status: newStatus },
      });
      // Revalidate after successful update
      mutate();
    } catch (error) {
      // Rollback on error
      mutate(previousLead, false);
      console.error('Failed to update lead status:', error);
    }
  };

  // Handle convert to opportunity
  const handleConvertToOpportunity = () => {
    // TODO: Open ConvertLeadModal (will be implemented in Phase 1.5)
    console.log('Convert to opportunity clicked for lead:', leadId);
  };

  // Loading state
  if (isLoading) {
    return (
      <Stack direction="column" spacing={2}>
        <Skeleton variant="rectangular" height={120} />
        <Skeleton variant="rectangular" height={400} />
      </Stack>
    );
  }

  // Error state
  if (error || !lead) {
    return (
      <Paper background={1} sx={{ p: { xs: 3, md: 5 } }}>
        <Typography variant="h6" color="error">
          {error?.message || 'Lead not found'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack direction="column">
      <LeadDetailsHeader />

      {/* Status Dropdown and Convert Button Section */}
      <Paper background={1} sx={{ px: { xs: 3, md: 5 }, py: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          {/* Status Dropdown */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Status:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={lead.status}
                onChange={handleStatusChange}
                disabled={isMutating}
                data-testid="lead-status-select"
                renderValue={(value) => (
                  <Chip
                    label={STATUS_OPTIONS.find((opt) => opt.value === value)?.label || value}
                    color={getStatusColor(value)}
                    size="small"
                  />
                )}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Chip label={option.label} color={option.color} size="small" />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Convert to Opportunity Button - Hidden if status is 'converted' */}
          {lead.status !== 'converted' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<IconifyIcon icon="material-symbols:arrow-forward" />}
              onClick={handleConvertToOpportunity}
            >
              Convert to Opportunity
            </Button>
          )}
        </Stack>
      </Paper>

      <Grid container>
        {contactInfoData.map((item) => (
          <Grid key={item.attribute} size={{ xs: 12, sm: 6, md: 4, xl: 2 }}>
            <ContactInfo attribute={item.attribute} value={item.value} />
          </Grid>
        ))}

        <Grid size={{ xs: 12, lg: 6 }}>
          <OngoingDeals ongoingDeals={ongoingDealsData} />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ px: { xs: 3, md: 5 }, py: 5, height: 1 }}>
            <ActivityTabs />
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default LeadDetails;
