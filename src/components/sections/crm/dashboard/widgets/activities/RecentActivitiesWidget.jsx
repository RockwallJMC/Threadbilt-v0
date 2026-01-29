'use client';

import { useMemo } from 'react';
import { Stack, Typography, Box } from '@mui/material';
import { format, parseISO } from 'date-fns';
import DashboardWidgetContainer from '../../DashboardWidgetContainer';
import ActivityTimeline from '../../../opportunity-details/activity-summary/ActivityTimeline';
import { recentActivities } from 'data/crm/dashboard-metrics';

/**
 * RecentActivitiesWidget - Dashboard widget showing recent activities timeline
 *
 * Phase 1.7.5: Reuses existing ActivityTimeline component (DRY principle)
 * Displays last 10-20 activities with formatted dates
 *
 * @param {Array} activities - Activity data (defaults to mock data)
 * @param {boolean} loading - Loading state
 * @param {string} error - Error message
 */
const RecentActivitiesWidget = ({
  activities = recentActivities,
  loading = false,
  error = null,
}) => {
  // Transform activity data for ActivityTimeline component
  const timelineData = useMemo(() => {
    if (!activities) return [];

    return activities.slice(0, 10).map((activity) => ({
      id: activity.id,
      title: activity.title,
      date: format(parseISO(activity.timestamp), 'MMM d, h:mm a'),
      description: `${activity.user} • ${activity.type.replace('_', ' ')}`,
    }));
  }, [activities]);

  return (
    <DashboardWidgetContainer
      title="Recent Activities"
      subtitle="Last 10 activities"
      loading={loading}
      error={error}
      minHeight={400}
    >
      {timelineData.length > 0 ? (
        <ActivityTimeline timeline={timelineData} />
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
            No recent activities
          </Typography>
        </Box>
      )}
    </DashboardWidgetContainer>
  );
};

export default RecentActivitiesWidget;
