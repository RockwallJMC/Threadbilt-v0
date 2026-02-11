'use client';

import { supabase } from 'lib/supabase/client';
import { mutate } from 'swr';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

// ============================================================================
// FETCHERS - Query Supabase directly with RLS
// ============================================================================

/**
 * Fetcher function for drawing annotations
 *
 * @param {string} drawingId - The drawing ID
 * @returns {Promise<Array>} Array of drawing annotations
 */
const annotationsFetcher = async (drawingId) => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Fetch all annotations for the drawing
  const { data, error } = await supabase
    .from('drawing_annotations')
    .select('*')
    .eq('drawing_id', drawingId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch annotations: ${error.message}`);
  }

  return data || [];
};

/**
 * Fetcher function for drawing calibration
 *
 * @param {string} drawingId - The drawing ID
 * @returns {Promise<Object>} Calibration data object
 */
const calibrationFetcher = async (drawingId) => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Fetch calibration data for the drawing
  const { data, error } = await supabase
    .from('project_drawings')
    .select('calibration')
    .eq('id', drawingId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch calibration: ${error.message}`);
  }

  return { calibration: data?.calibration || null };
};

// ============================================================================
// READ HOOKS - useSWR for caching
// ============================================================================

/**
 * Hook to fetch all annotations for a drawing
 *
 * @param {string} drawingId - The drawing ID
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with annotations data
 *
 * @example
 * const { data: annotations, error, isLoading, mutate } = useDrawingAnnotations('drawing_001');
 */
export const useDrawingAnnotations = (drawingId, config) => {
  return useSWR(
    drawingId ? ['drawing-annotations', drawingId] : null,
    () => annotationsFetcher(drawingId),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );
};

/**
 * Hook to fetch calibration data for a drawing
 *
 * @param {string} drawingId - The drawing ID
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with calibration data
 *
 * @example
 * const { data, error, isLoading } = useDrawingCalibration('drawing_001');
 * // data = { calibration: { point_a, point_b, distance, unit, pixels_per_unit } }
 */
export const useDrawingCalibration = (drawingId, config) => {
  return useSWR(
    drawingId ? ['drawing-calibration', drawingId] : null,
    () => calibrationFetcher(drawingId),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );
};

// ============================================================================
// MUTATION HOOKS - useSWRMutation for create/update/delete
// ============================================================================

/**
 * Create a new annotation
 *
 * @param {string} drawingId - The drawing ID
 * @returns {Object} SWR mutation hook
 *
 * @example
 * const { trigger: createAnnotation, isMutating } = useCreateAnnotation('drawing_001');
 * const newAnnotation = await createAnnotation({
 *   type: 'measurement',
 *   geometry: { type: 'LineString', coordinates: [[0, 0], [100, 100]] },
 *   properties: { label: '10 ft', color: '#FF0000' }
 * });
 */
export const useCreateAnnotation = (drawingId) => {
  return useSWRMutation(
    drawingId ? ['drawing-annotations', drawingId] : null,
    async (key, { arg }) => {
      const { type, geometry, properties } = arg;

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(authError?.message || 'Not authenticated');
      }

      // Validate required fields
      if (!type || !geometry) {
        throw new Error('Type and geometry are required');
      }

      // Insert annotation record into database
      const { data, error } = await supabase
        .from('drawing_annotations')
        .insert([
          {
            drawing_id: drawingId,
            type,
            geometry,
            properties: properties || {},
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create annotation: ${error.message}`);
      }

      // Revalidate annotations list
      mutate(['drawing-annotations', drawingId]);

      return data;
    },
    {
      populateCache: false,
      revalidate: true,
    }
  );
};

/**
 * Update an existing annotation
 *
 * @param {string} drawingId - The drawing ID
 * @returns {Object} SWR mutation hook
 *
 * @example
 * const { trigger: updateAnnotation } = useUpdateAnnotation('drawing_001');
 * await updateAnnotation({
 *   annotationId: 'annotation_001',
 *   geometry: { type: 'LineString', coordinates: [[0, 0], [150, 150]] },
 *   properties: { label: '15 ft', color: '#00FF00' }
 * });
 */
export const useUpdateAnnotation = (drawingId) => {
  return useSWRMutation(
    drawingId ? ['drawing-annotations', drawingId] : null,
    async (key, { arg }) => {
      const { annotationId, geometry, properties } = arg;

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(authError?.message || 'Not authenticated');
      }

      if (!annotationId) {
        throw new Error('Annotation ID is required');
      }

      // Build update object with only provided fields
      const updateData = {
        updated_at: new Date().toISOString(),
      };
      if (geometry !== undefined) updateData.geometry = geometry;
      if (properties !== undefined) updateData.properties = properties;

      // Update annotation record
      const { data, error } = await supabase
        .from('drawing_annotations')
        .update(updateData)
        .eq('id', annotationId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update annotation: ${error.message}`);
      }

      // Revalidate annotations list
      mutate(['drawing-annotations', drawingId]);

      return data;
    },
    {
      populateCache: false,
      revalidate: true,
    }
  );
};

/**
 * Delete an annotation
 *
 * @param {string} drawingId - The drawing ID
 * @returns {Object} SWR mutation hook
 *
 * @example
 * const { trigger: deleteAnnotation } = useDeleteAnnotation('drawing_001');
 * await deleteAnnotation({
 *   annotationId: 'annotation_001'
 * });
 */
export const useDeleteAnnotation = (drawingId) => {
  return useSWRMutation(
    drawingId ? ['drawing-annotations', drawingId] : null,
    async (key, { arg }) => {
      const { annotationId } = arg;

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(authError?.message || 'Not authenticated');
      }

      if (!annotationId) {
        throw new Error('Annotation ID is required');
      }

      // Delete from database
      const { error } = await supabase
        .from('drawing_annotations')
        .delete()
        .eq('id', annotationId);

      if (error) {
        throw new Error(`Failed to delete annotation: ${error.message}`);
      }

      // Revalidate annotations list
      mutate(['drawing-annotations', drawingId]);

      return { annotationId };
    },
    {
      populateCache: false,
      revalidate: true,
    }
  );
};

/**
 * Update drawing calibration
 *
 * @param {string} drawingId - The drawing ID
 * @returns {Object} SWR mutation hook
 *
 * @example
 * const { trigger: updateCalibration } = useUpdateCalibration('drawing_001');
 * await updateCalibration({
 *   calibration: {
 *     point_a: { x: 100, y: 100 },
 *     point_b: { x: 300, y: 100 },
 *     distance: 50,
 *     unit: 'ft',
 *     pixels_per_unit: 4
 *   }
 * });
 */
export const useUpdateCalibration = (drawingId) => {
  return useSWRMutation(
    drawingId ? ['drawing-calibration', drawingId] : null,
    async (key, { arg }) => {
      const { calibration } = arg;

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(authError?.message || 'Not authenticated');
      }

      // Validate calibration object
      if (!calibration) {
        throw new Error('Calibration data is required');
      }

      // Update calibration in project_drawings
      const { data, error } = await supabase
        .from('project_drawings')
        .update({ calibration })
        .eq('id', drawingId)
        .select('calibration')
        .single();

      if (error) {
        throw new Error(`Failed to update calibration: ${error.message}`);
      }

      // Revalidate calibration data
      mutate(['drawing-calibration', drawingId]);

      return { calibration: data.calibration };
    },
    {
      populateCache: false,
      revalidate: true,
    }
  );
};
