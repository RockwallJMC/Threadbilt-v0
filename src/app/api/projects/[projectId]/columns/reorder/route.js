import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

// ============================================================================
// PATCH /api/projects/[projectId]/columns/reorder
// Reorder columns by updating sort_order
// ============================================================================
export async function PATCH(request, { params }) {
  try {
    const supabase = createApiClient(request);

    // Validate JWT token server-side
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = (await params).projectId;
    const body = await request.json();

    // Verify project exists and user has access (via RLS)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Validate columns array
    if (!body.columns || !Array.isArray(body.columns)) {
      return NextResponse.json(
        { error: 'columns array is required' },
        { status: 400 }
      );
    }

    // Validate each column entry
    for (const column of body.columns) {
      if (!column.id || typeof column.sort_order !== 'number') {
        return NextResponse.json(
          { error: 'Each column must have id and sort_order' },
          { status: 400 }
        );
      }
    }

    // Update columns in a transaction-like manner
    // Note: Supabase doesn't support true transactions via REST API,
    // but we can batch update each column
    const updatePromises = body.columns.map((column) =>
      supabase
        .from('project_columns')
        .update({ sort_order: column.sort_order })
        .eq('id', column.id)
        .eq('project_id', projectId)
        .is('deleted_at', null)
    );

    const results = await Promise.all(updatePromises);

    // Check for errors
    const errors = results.filter((result) => result.error);
    if (errors.length > 0) {
      console.error('Error reordering columns:', errors);
      return NextResponse.json({ error: 'Failed to reorder columns' }, { status: 500 });
    }

    // Fetch updated columns
    const { data: columns, error: fetchError } = await supabase
      .from('project_columns')
      .select('id, name, color, card_limit, sort_order')
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true });

    if (fetchError) {
      console.error('Error fetching updated columns:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch updated columns' }, { status: 500 });
    }

    return NextResponse.json({ columns });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
