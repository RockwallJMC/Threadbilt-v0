'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardActionArea,
  Stack,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import DashboardWidgetContainer from '../../DashboardWidgetContainer';
import { recentProposals } from 'data/crm/dashboard-metrics';

/**
 * RecentProposalsWidget - Dashboard widget showing recent proposals with status
 *
 * Phase 1.7.5: Card list of proposals with status chips and links to detail pages
 *
 * @param {Array} proposals - Proposal data (defaults to mock data)
 * @param {boolean} loading - Loading state
 * @param {string} error - Error message
 */
const RecentProposalsWidget = ({
  proposals = recentProposals,
  loading = false,
  error = null,
}) => {
  const statusConfig = {
    draft: { color: 'default', label: 'Draft' },
    sent: { color: 'info', label: 'Sent' },
    accepted: { color: 'success', label: 'Accepted' },
    declined: { color: 'error', label: 'Declined' },
  };

  // Format currency
  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  // Sort by created date (most recent first)
  const sortedProposals = useMemo(() => {
    if (!proposals) return [];

    return [...proposals]
      .sort((a, b) => {
        const dateA = parseISO(a.createdDate);
        const dateB = parseISO(b.createdDate);
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [proposals]);

  return (
    <DashboardWidgetContainer
      title="Recent Proposals"
      subtitle="Last 10 proposals"
      loading={loading}
      error={error}
      minHeight={400}
    >
      {sortedProposals.length > 0 ? (
        <Stack spacing={2}>
          {sortedProposals.map((proposal) => (
            <Card
              key={proposal.id}
              variant="outlined"
              sx={{
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 2,
                  borderColor: 'primary.main',
                },
              }}
            >
              <CardActionArea
                component={Link}
                href={`/crm/proposals/${proposal.id}`}
                sx={{ p: 0 }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    {/* Title and Status */}
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="flex-start"
                      justifyContent="space-between"
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          flexGrow: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {proposal.title}
                      </Typography>
                      <Chip
                        label={statusConfig[proposal.status].label}
                        color={statusConfig[proposal.status].color}
                        size="small"
                        sx={{ flexShrink: 0 }}
                      />
                    </Stack>

                    {/* Account and Value */}
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="body2" color="text.secondary">
                        {proposal.account}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: 'text.primary' }}
                      >
                        {formatCurrency(proposal.value)}
                      </Typography>
                    </Stack>

                    {/* Date and Owner */}
                    <Stack direction="row" spacing={1}>
                      <Typography variant="caption" color="text.disabled">
                        {format(parseISO(proposal.createdDate), 'MMM d, yyyy')}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        •
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {proposal.owner}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 200,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No recent proposals
          </Typography>
        </Box>
      )}
    </DashboardWidgetContainer>
  );
};

export default RecentProposalsWidget;
