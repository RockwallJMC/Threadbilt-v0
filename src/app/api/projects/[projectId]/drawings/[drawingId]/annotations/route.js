import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

/**
 * GET /api/projects/[projectId]/drawings/[drawingId]/annotations
 * Fetch all annotations for a drawing
 */
export async function GET(request, { params }) {
  try {
    const supabase = createApiClient(request);
    const { projectId, drawingId } = await params;

    // Validate JWT token server-side
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query drawing_annotations table
    const { data: annotations, error } = await supabase
      .from('drawing_annotations')
      .select('*')
      .eq('drawing_id', drawingId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        {
          error: 'Failed to fetch annotations',
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(annotations, { status: 200 });
  } catch (error) {
    console.error('Get annotations error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[projectId]/drawings/[drawingId]/annotations
 * Create a new annotation
 */
export async function POST(request, { params }) {
  try {
    const supabase = createApiClient(request);
    const { projectId, drawingId } = await params;

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
    const { type, geometry, properties } = body;

    // Validate required fields
    if (!type) {
      return NextResponse.json({ error: 'Type is required' }, { status: 400 });
    }

    if (!geometry) {
      return NextResponse.json({ error: 'Geometry is required' }, { status: 400 });
    }

    if (!properties) {
      return NextResponse.json({ error: 'Properties is required' }, { status: 400 });
    }

    // Insert annotation into database
    const { data: annotation, error: insertError } = await supabase
      .from('drawing_annotations')
      .insert([
        {
          drawing_id: drawingId,
          type,
          geometry,
          properties,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        {
          error: 'Failed to create annotation',
          details: insertError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(annotation, { status: 201 });
  } catch (error) {
    console.error('Create annotation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
