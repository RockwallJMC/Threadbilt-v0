import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

/**
 * PATCH /api/projects/[projectId]/drawings/[drawingId]/calibration
 * Save or update calibration data for a drawing
 */
export async function PATCH(request, { params }) {
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
    const { point_a, point_b, distance, unit, pixels_per_unit } = body;

    // Validate required calibration fields
    if (!point_a) {
      return NextResponse.json({ error: 'point_a is required' }, { status: 400 });
    }

    if (!point_b) {
      return NextResponse.json({ error: 'point_b is required' }, { status: 400 });
    }

    if (distance === undefined || distance === null) {
      return NextResponse.json({ error: 'distance is required' }, { status: 400 });
    }

    if (!unit) {
      return NextResponse.json({ error: 'unit is required' }, { status: 400 });
    }

    if (pixels_per_unit === undefined || pixels_per_unit === null) {
      return NextResponse.json({ error: 'pixels_per_unit is required' }, { status: 400 });
    }

    // Update calibration data in project_drawings table
    const { data: drawing, error: updateError } = await supabase
      .from('project_drawings')
      .update({
        calibration: {
          point_a,
          point_b,
          distance,
          unit,
          pixels_per_unit,
        },
      })
      .eq('id', drawingId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        {
          error: 'Failed to save calibration',
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(drawing, { status: 200 });
  } catch (error) {
    console.error('Save calibration error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
