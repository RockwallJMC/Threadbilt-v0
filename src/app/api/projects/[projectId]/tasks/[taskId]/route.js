import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

// ============================================================================
// GET /api/projects/[projectId]/tasks/[taskId]
// Fetch single task with full details
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

    const { projectId, taskId } = await params;

    // Fetch task with full details (RLS ensures organization scoping)
    const { data: task, error } = await supabase
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
        project_id,
        created_at,
        updated_at,
        label:project_labels(id, name, color),
        assignees:project_task_assignees(
          user:user_profiles(id, full_name, avatar_url, email)
        ),
        subtasks:task_subtasks(id, title, checked, position)
      `
      )
      .eq('id', taskId)
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .single();

    if (error || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Sort subtasks by position
    if (task.subtasks) {
      task.subtasks.sort((a, b) => a.position - b.position);
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// PATCH /api/projects/[projectId]/tasks/[taskId]
// Update task fields
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

    const { projectId, taskId } = await params;
    const body = await request.json();

    // Check if task exists (RLS ensures organization scoping)
    const { data: existingTask, error: fetchError } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .single();

    if (fetchError || !existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Sanitize input - only allow specific fields
    const allowedFields = [
      'title',
      'description',
      'priority',
      'due_date',
      'completed',
      'column_id',
      'sort_order',
      'label_id',
      'cover_image_url',
      'attachment_count',
    ];

    const sanitizedData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        sanitizedData[field] = body[field];
      }
    }

    // Validate fields
    if (sanitizedData.title !== undefined) {
      if (typeof sanitizedData.title !== 'string') {
        return NextResponse.json({ error: 'title must be a string' }, { status: 400 });
      }
      if (sanitizedData.title.length === 0) {
        return NextResponse.json({ error: 'title cannot be empty' }, { status: 400 });
      }
      if (sanitizedData.title.length > 500) {
        return NextResponse.json({ error: 'title is too long (max 500 characters)' }, { status: 400 });
      }
    }

    if (sanitizedData.description !== undefined && typeof sanitizedData.description !== 'string') {
      return NextResponse.json({ error: 'description must be a string' }, { status: 400 });
    }

    if (sanitizedData.completed !== undefined && typeof sanitizedData.completed !== 'boolean') {
      return NextResponse.json({ error: 'completed must be a boolean' }, { status: 400 });
    }

    if (sanitizedData.attachment_count !== undefined && typeof sanitizedData.attachment_count !== 'number') {
      return NextResponse.json({ error: 'attachment_count must be a number' }, { status: 400 });
    }

    // Validate priority
    if (sanitizedData.priority !== undefined) {
      const validPriorities = ['low', 'medium', 'high'];
      if (!validPriorities.includes(sanitizedData.priority)) {
        return NextResponse.json(
          { error: 'priority must be one of: low, medium, high' },
          { status: 400 }
        );
      }
    }

    // Add updated_at timestamp
    sanitizedData.updated_at = new Date().toISOString();

    // Update task
    const { data: updatedTask, error: updateError } = await supabase
      .from('project_tasks')
      .update(sanitizedData)
      .eq('id', taskId)
      .eq('project_id', projectId)
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
        project_id,
        created_at,
        updated_at,
        label:project_labels(id, name, color),
        assignees:project_task_assignees(
          user:user_profiles(id, full_name, avatar_url)
        ),
        subtasks:task_subtasks(id, title, checked, position)
      `
      )
      .single();

    if (updateError) {
      console.error('Error updating task:', updateError);
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    // Sort subtasks by position
    if (updatedTask.subtasks) {
      updatedTask.subtasks.sort((a, b) => a.position - b.position);
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// DELETE /api/projects/[projectId]/tasks/[taskId]
// Soft delete task by setting deleted_at timestamp
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

    // Check if task exists (RLS ensures organization scoping)
    const { data: existingTask, error: fetchError } = await supabase
      .from('project_tasks')
      .select('id')
      .eq('id', taskId)
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .single();

    if (fetchError || !existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Soft delete by setting deleted_at
    const { error: deleteError } = await supabase
      .from('project_tasks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', taskId)
      .eq('project_id', projectId);

    if (deleteError) {
      console.error('Error deleting task:', deleteError);
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
