import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * GET /api/projects/[projectId]/drawings
 * Fetch all drawings for a project with signed URLs for images
 */
export async function GET(request, { params }) {
  try {
    const supabase = createApiClient(request);
    const { projectId } = await params;

    // Validate JWT token server-side
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query project_drawings table
    const { data: drawings, error } = await supabase
      .from('project_drawings')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        {
          error: 'Failed to fetch drawings',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Generate signed URLs for images
    const drawingsWithUrls = await Promise.all(
      drawings.map(async (drawing) => {
        if (drawing.storage_path && drawing.mime_type?.startsWith('image/')) {
          const { data: signedUrlData, error: urlError } = await supabase.storage
            .from('project-drawings')
            .createSignedUrl(drawing.storage_path, 3600); // 1 hour expiry

          if (!urlError && signedUrlData) {
            return {
              ...drawing,
              signed_url: signedUrlData.signedUrl,
            };
          }
        }
        return drawing;
      })
    );

    return NextResponse.json(drawingsWithUrls, { status: 200 });
  } catch (error) {
    console.error('Get drawings error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[projectId]/drawings
 * Upload a new drawing (image or PDF)
 */
export async function POST(request, { params }) {
  try {
    const supabase = createApiClient(request);
    const { projectId } = await params;

    // Validate JWT token server-side
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file');
    const title = formData.get('title');
    const drawingType = formData.get('drawing_type');
    const version = formData.get('version');

    // Validate required fields
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!drawingType) {
      return NextResponse.json({ error: 'Drawing type is required' }, { status: 400 });
    }

    if (!version) {
      return NextResponse.json({ error: 'Version is required' }, { status: 400 });
    }

    // Validate mime type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          details: `Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'File too large',
          details: 'Maximum file size is 50MB',
        },
        { status: 400 }
      );
    }

    // Generate drawing ID
    const drawingId = crypto.randomUUID();

    // Generate storage path: {projectId}/{drawingId}/{originalFilename}
    const storagePath = `${projectId}/${drawingId}/${file.name}`;

    // Upload to Supabase Storage bucket 'project-drawings'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-drawings')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        {
          error: 'Upload failed',
          details: uploadError.message,
        },
        { status: 500 }
      );
    }

    // Set thumbnail_path based on file type
    const thumbnailPath = file.type.startsWith('image/') ? storagePath : null;

    // Insert row into project_drawings table
    const { data: drawingData, error: insertError } = await supabase
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

    if (insertError) {
      // Cleanup: delete uploaded file if DB insert fails
      await supabase.storage.from('project-drawings').remove([storagePath]);

      return NextResponse.json(
        {
          error: 'Failed to create drawing record',
          details: insertError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(drawingData, { status: 201 });
  } catch (error) {
    console.error('Upload drawing error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
