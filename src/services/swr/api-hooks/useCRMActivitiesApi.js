'use client';

import axiosInstance from 'services/axios/axiosInstance';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

/**
 * Fetcher function for activities filtered by contact ID and optional activity type
 * Fetches activities from API route with entity_type=contact
 *
 * @param {string} contactId - Contact ID (entity_id)
 * @param {string|null} activityType - Optional activity type filter ('call', 'email', 'meeting', 'note', 'task')
 * @returns {Promise<Array>} Array of activity objects
 */
const crmActivitiesFetcher = async (contactId, activityType = null) => {
  const params = new URLSearchParams({
    entity_type: 'contact',
    entity_id: contactId,
  });

  if (activityType) {
    params.append('activity_type', activityType);
  }

  const response = await axiosInstance.get(`/api/crm/activities?${params.toString()}`);
  return response;
};

/**
 * Hook to fetch activities for a specific contact
 * Optionally filters by activity type for tab-based filtering
 *
 * @param {string} contactId - Contact ID to fetch activities for
 * @param {string|null} activityType - Optional activity type filter ('call', 'email', 'meeting', 'note', 'task')
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with activities data
 *
 * @example
 * // Fetch all activities for a contact
 * const { data: activities, error, isLoading, mutate } = useCRMActivities('contact_001');
 *
 * // Fetch only call activities for tab filtering
 * const { data: callActivities } = useCRMActivities('contact_001', 'call');
 *
 * // Fetch email activities
 * const { data: emailActivities } = useCRMActivities('contact_001', 'email');
 */
export const useCRMActivities = (contactId, activityType = null, config) => {
  const swr = useSWR(
    contactId ? ['crm-activities', contactId, activityType] : null,
    () => crmActivitiesFetcher(contactId, activityType),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );

  return swr;
};

/**
 * Mutation function to create a new activity
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {Object} options.arg - Activity data to create
 * @param {string} options.arg.entity_id - Contact ID (required)
 * @param {string} options.arg.activity_type - Activity type (required: 'call', 'email', 'meeting', 'note', 'task')
 * @param {string} options.arg.subject - Activity subject (required)
 * @param {string} options.arg.description - Activity description (optional)
 * @param {string} options.arg.activity_date - ISO date string (optional, defaults to now)
 * @param {number} options.arg.duration_minutes - Duration in minutes (optional)
 * @param {string} options.arg.outcome - Activity outcome (optional)
 * @param {string} options.arg.next_action - Next action (optional)
 * @returns {Promise<Object>} Created activity object
 */
const createCRMActivityMutation = async (url, { arg }) => {
  const response = await axiosInstance.post('/api/crm/activities', arg);
  return response;
};

/**
 * Hook to create a new activity for a contact
 * Automatically revalidates the activities list after creation
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger: createActivity, isMutating } = useCreateCRMActivity();
 * const newActivity = await createActivity({
 *   entity_id: 'contact_001',
 *   activity_type: 'call',
 *   subject: 'Follow-up call regarding proposal',
 *   description: 'Discussed pricing and timeline',
 *   activity_date: '2025-02-01T10:00:00Z',
 *   duration_minutes: 30,
 *   outcome: 'positive',
 *   next_action: 'Send updated proposal by Friday'
 * });
 */
export const useCreateCRMActivity = () => {
  const mutation = useSWRMutation('create-crm-activity', createCRMActivityMutation, {
    // Revalidate activities list after creating
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};
