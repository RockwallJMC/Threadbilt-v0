import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

// ============================================================================
// GET /api/projects/[projectId]/columns
// List columns for a project
// ============================================================================
export async function GET(request, { params }) {
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

    // Fetch columns
    const { data: columns, error } = await supabase
      .from('project_columns')
      .select('id, name, color, card_limit, sort_order')
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching columns:', error);
      return NextResponse.json({ error: 'Failed to fetch columns' }, { status: 500 });
    }

    return NextResponse.json({ columns });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// POST /api/projects/[projectId]/columns
// Create new column
// ============================================================================
export async function POST(request, { params }) {
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

    // Sanitize input - only allow specific fields
    const allowedFields = ['name', 'color', 'card_limit', 'sort_order'];

    const sanitizedData = { project_id: projectId };
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        sanitizedData[field] = body[field];
      }
    }

    // Validate required fields
    if (!sanitizedData.name || typeof sanitizedData.name !== 'string') {
      return NextResponse.json({ error: 'name is required and must be a string' }, { status: 400 });
    }

    if (sanitizedData.name.length > 100) {
      return NextResponse.json({ error: 'name is too long (max 100 characters)' }, { status: 400 });
    }

    // Validate card_limit if provided
    if (sanitizedData.card_limit !== undefined) {
      if (typeof sanitizedData.card_limit !== 'number' || sanitizedData.card_limit < 0) {
        return NextResponse.json(
          { error: 'card_limit must be a non-negative number' },
          { status: 400 }
        );
      }
    }

    // If sort_order not provided, get the max sort_order and add 1
    if (sanitizedData.sort_order === undefined) {
      const { data: maxSortOrder } = await supabase
        .from('project_columns')
        .select('sort_order')
        .eq('project_id', projectId)
        .is('deleted_at', null)
        .order('sort_order', { ascending: false })
        .limit(1)
        .single();

      sanitizedData.sort_order = maxSortOrder ? maxSortOrder.sort_order + 1 : 0;
    }

    // Create column
    const { data: column, error: createError } = await supabase
      .from('project_columns')
      .insert([sanitizedData])
      .select('id, name, color, card_limit, sort_order')
      .single();

    if (createError) {
      console.error('Error creating column:', createError);
      return NextResponse.json({ error: 'Failed to create column' }, { status: 500 });
    }

    return NextResponse.json(column, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
