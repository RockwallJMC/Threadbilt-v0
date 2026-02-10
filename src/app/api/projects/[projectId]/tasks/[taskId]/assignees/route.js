import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

// ============================================================================
// POST /api/projects/[projectId]/tasks/[taskId]/assignees
// Add assignee to task
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

    const { projectId, taskId } = await params;
    const body = await request.json();

    // Validate user_id
    if (!body.user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Verify task exists and user has access (via RLS)
    const { data: task, error: taskError } = await supabase
      .from('project_tasks')
      .select('id')
      .eq('id', taskId)
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify user is a project member
    const { data: member, error: memberError } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', body.user_id)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'User is not a member of this project' },
        { status: 400 }
      );
    }

    // Check if assignee already exists
    const { data: existingAssignee } = await supabase
      .from('project_task_assignees')
      .select('id')
      .eq('task_id', taskId)
      .eq('user_id', body.user_id)
      .single();

    if (existingAssignee) {
      return NextResponse.json({ error: 'User is already assigned to this task' }, { status: 400 });
    }

    // Add assignee
    const { data: assignee, error: createError } = await supabase
      .from('project_task_assignees')
      .insert([{ task_id: taskId, user_id: body.user_id }])
      .select(
        `
        id,
        user:user_profiles(id, full_name, avatar_url, email)
      `
      )
      .single();

    if (createError) {
      console.error('Error adding assignee:', createError);
      return NextResponse.json({ error: 'Failed to add assignee' }, { status: 500 });
    }

    return NextResponse.json(assignee, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// DELETE /api/projects/[projectId]/tasks/[taskId]/assignees
// Remove assignee from task
// ============================================================================
export async function DELETE(request, { params }) {
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

    const { projectId, taskId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    // Validate user_id
    if (!userId) {
      return NextResponse.json({ error: 'user_id query parameter is required' }, { status: 400 });
    }

    // Verify task exists and user has access (via RLS)
    const { data: task, error: taskError } = await supabase
      .from('project_tasks')
      .select('id')
      .eq('id', taskId)
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check if assignee exists
    const { data: existingAssignee, error: fetchError } = await supabase
      .from('project_task_assignees')
      .select('id')
      .eq('task_id', taskId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingAssignee) {
      return NextResponse.json({ error: 'Assignee not found' }, { status: 404 });
    }

    // Remove assignee
    const { error: deleteError } = await supabase
      .from('project_task_assignees')
      .delete()
      .eq('task_id', taskId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error removing assignee:', deleteError);
      return NextResponse.json({ error: 'Failed to remove assignee' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Assignee removed successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
