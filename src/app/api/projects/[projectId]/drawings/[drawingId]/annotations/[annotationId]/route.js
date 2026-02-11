import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

/**
 * PATCH /api/projects/[projectId]/drawings/[drawingId]/annotations/[annotationId]
 * Update an existing annotation
 */
export async function PATCH(request, { params }) {
  try {
    const supabase = createApiClient(request);
    const { projectId, drawingId, annotationId } = await params;

    // Validate JWT token server-side
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { geometry, properties } = body;

    // Build update object with only provided fields
    const updateData = {
      updated_at: new Date().toISOString(),
    };
    if (geometry !== undefined) updateData.geometry = geometry;
    if (properties !== undefined) updateData.properties = properties;

    // Update annotation in database
    const { data: annotation, error: updateError } = await supabase
      .from('drawing_annotations')
      .update(updateData)
      .eq('id', annotationId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        {
          error: 'Failed to update annotation',
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(annotation, { status: 200 });
  } catch (error) {
    console.error('Update annotation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[projectId]/drawings/[drawingId]/annotations/[annotationId]
 * Delete an annotation
 */
export async function DELETE(request, { params }) {
  try {
    const supabase = createApiClient(request);
    const { projectId, drawingId, annotationId } = await params;

    // Validate JWT token server-side
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete annotation from database
    const { error: deleteError } = await supabase
      .from('drawing_annotations')
      .delete()
      .eq('id', annotationId);

    if (deleteError) {
      return NextResponse.json(
        {
          error: 'Failed to delete annotation',
          details: deleteError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Delete annotation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
