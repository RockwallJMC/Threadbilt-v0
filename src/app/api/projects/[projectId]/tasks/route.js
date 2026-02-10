import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

// ============================================================================
// GET /api/projects/[projectId]/tasks
// List tasks for a project with optional filters
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
    const { searchParams } = new URL(request.url);

    // Build query
    let query = supabase
      .from('project_tasks')
      .select(
        `
        id,
        title,
        description,
        priority,
        due_date,
        completed,
        cover_image_url,
        attachment_count,
        sort_order,
        column_id,
        label:project_labels(id, name, color),
        assignees:project_task_assignees(
          user:user_profiles(id, full_name, avatar_url)
        ),
        subtasks:task_subtasks(id, title, checked, position)
      `
      )
      .eq('project_id', projectId)
      .is('deleted_at', null);

    // Apply filters
    const columnId = searchParams.get('column_id');
    const completed = searchParams.get('completed');
    const priority = searchParams.get('priority');

    if (columnId) {
      query = query.eq('column_id', columnId);
    }

    if (completed !== null) {
      query = query.eq('completed', completed === 'true');
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    // Order by sort_order
    query = query.order('sort_order', { ascending: true });

    const { data: tasks, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    // Sort subtasks by position
    tasks.forEach((task) => {
      if (task.subtasks) {
        task.subtasks.sort((a, b) => a.position - b.position);
      }
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// POST /api/projects/[projectId]/tasks
// Create new task
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
    const allowedFields = [
      'title',
      'description',
      'column_id',
      'priority',
      'due_date',
      'label_id',
      'cover_image_url',
      'sort_order',
    ];

    const sanitizedData = { project_id: projectId };
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        sanitizedData[field] = body[field];
      }
    }

    // Validate required fields
    if (!sanitizedData.title || typeof sanitizedData.title !== 'string') {
      return NextResponse.json({ error: 'title is required and must be a string' }, { status: 400 });
    }

    if (!sanitizedData.column_id) {
      return NextResponse.json({ error: 'column_id is required' }, { status: 400 });
    }

    // Validate string fields
    if (sanitizedData.title.length > 500) {
      return NextResponse.json({ error: 'title is too long (max 500 characters)' }, { status: 400 });
    }

    if (sanitizedData.description && typeof sanitizedData.description !== 'string') {
      return NextResponse.json({ error: 'description must be a string' }, { status: 400 });
    }

    // Set defaults
    sanitizedData.completed = false;
    sanitizedData.attachment_count = 0;

    // If sort_order not provided, get the max sort_order for the column and add 1
    if (sanitizedData.sort_order === undefined) {
      const { data: maxSortOrder } = await supabase
        .from('project_tasks')
        .select('sort_order')
        .eq('column_id', sanitizedData.column_id)
        .order('sort_order', { ascending: false })
        .limit(1)
        .single();

      sanitizedData.sort_order = maxSortOrder ? maxSortOrder.sort_order + 1 : 0;
    }

    // Create task
    const { data: task, error: createError } = await supabase
      .from('project_tasks')
      .insert([sanitizedData])
      .select(
        `
        id,
        title,
        description,
        priority,
        due_date,
        completed,
        cover_image_url,
        attachment_count,
        sort_order,
        column_id,
        label:project_labels(id, name, color),
        assignees:project_task_assignees(
          user:user_profiles(id, full_name, avatar_url)
        )
      `
      )
      .single();

    if (createError) {
      console.error('Error creating task:', createError);
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
