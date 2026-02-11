'use client';

import { supabase } from 'lib/supabase/client';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

// ============================================================================
// FETCHERS - Query Supabase directly with RLS
// ============================================================================

/**
 * Fetcher function for project drawings
 *
 * @param {string} projectId - The project ID
 * @returns {Promise<Array>} Array of project drawings
 */
const drawingsFetcher = async (projectId) => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Fetch all drawings for the project
  const { data, error } = await supabase
    .from('project_drawings')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch drawings: ${error.message}`);
  }

  // Batch-generate signed URLs for image drawings
  const drawingsWithUrls = await Promise.all(
    (data || []).map(async (drawing) => {
      if (drawing.mime_type?.startsWith('image/') && drawing.storage_path) {
        const { data: urlData } = await supabase.storage
          .from('project-drawings')
          .createSignedUrl(drawing.storage_path, 3600);
        return { ...drawing, signed_url: urlData?.signedUrl || null };
      }
      return { ...drawing, signed_url: null };
    })
  );

  return drawingsWithUrls;
};

// ============================================================================
// READ HOOKS - useSWR for caching
// ============================================================================

/**
 * Hook to fetch all drawings for a project
 *
 * @param {string} projectId - The project ID
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with drawings data
 *
 * @example
 * const { data: drawings, error, isLoading, mutate } = useProjectDrawings('project_001');
 */
export const useProjectDrawings = (projectId, config) => {
  return useSWR(
    projectId ? ['project-drawings', projectId] : null,
    () => drawingsFetcher(projectId),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );
};

// ============================================================================
// MUTATION HOOKS - useSWRMutation for create/delete
// ============================================================================

/**
 * Create a new drawing
 *
 * @param {string} projectId - The project ID
 * @returns {Object} SWR mutation hook
 *
 * @example
 * const { trigger: createDrawing, isMutating } = useCreateDrawing('project_001');
 * const newDrawing = await createDrawing({
 *   title: 'Floor Plan',
 *   drawingType: 'architectural',
 *   version: '1.0',
 *   file: fileObject
 * });
 */
export const useCreateDrawing = (projectId) => {
  return useSWRMutation(
    projectId ? ['create-drawing', projectId] : null,
    async (key, { arg }) => {
      const { title, drawingType, version, file } = arg;

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(authError?.message || 'Not authenticated');
      }

      // Validate required fields
      if (!file || !title || !drawingType || !version) {
        throw new Error('File, title, drawing type, and version are required');
      }

      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
      }

      // Validate file size (50MB max)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File size exceeds 50MB limit');
      }

      // Generate drawing ID
      const drawingId = crypto.randomUUID();

      // Generate storage path: {projectId}/{drawingId}/{filename}
      const storagePath = `${projectId}/${drawingId}/${file.name}`;

      // Upload file to storage bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-drawings')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Set thumbnail_path based on file type
      const thumbnailPath = file.type.startsWith('image/') ? storagePath : null;

      // Insert drawing record into database
      const { data, error } = await supabase
        .from('project_drawings')
        .insert([
          {
            id: drawingId,
            project_id: projectId,
            title,
            drawing_type: drawingType,
            version,
            file_name: file.name,
            storage_path: storagePath,
            thumbnail_path: thumbnailPath,
            mime_type: file.type,
            file_size: file.size,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        // Cleanup: delete uploaded file if DB insert fails
        await supabase.storage.from('project-drawings').remove([storagePath]);
        throw new Error(`Failed to create drawing: ${error.message}`);
      }

      return data;
    },
    {
      populateCache: false,
      revalidate: true,
    }
  );
};

/**
 * Delete a drawing (removes from storage and database)
 *
 * @param {string} projectId - The project ID
 * @returns {Object} SWR mutation hook
 *
 * @example
 * const { trigger: deleteDrawing } = useDeleteDrawing('project_001');
 * await deleteDrawing({
 *   drawingId: 'drawing_001',
 *   storagePath: 'project_001/drawing_001/file.pdf'
 * });
 */
export const useDeleteDrawing = (projectId) => {
  return useSWRMutation(
    projectId ? ['delete-drawing', projectId] : null,
    async (key, { arg }) => {
      const { drawingId, storagePath } = arg;

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(authError?.message || 'Not authenticated');
      }

      // Delete from storage bucket first
      if (storagePath) {
        const { error: storageError } = await supabase.storage
          .from('project-drawings')
          .remove([storagePath]);

        if (storageError) {
          console.warn('Failed to delete file from storage:', storageError.message);
          // Continue with DB deletion even if storage deletion fails
        }
      }

      // Delete from database
      const { error } = await supabase.from('project_drawings').delete().eq('id', drawingId);

      if (error) {
        throw new Error(`Failed to delete drawing: ${error.message}`);
      }

      return { drawingId };
    },
    {
      populateCache: false,
      revalidate: true,
    }
  );
};
