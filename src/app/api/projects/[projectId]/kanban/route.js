import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

// ============================================================================
// GET /api/projects/[projectId]/kanban
// Fetch full kanban board with columns, tasks, members, and labels
// ============================================================================
export async function GET(request, { params }) {
  try {
    const supabase = createApiClient(request);

    // Validate JWT token server-side (more secure than getSession)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = (await params).projectId;

    // Fetch project with columns, tasks, members, and labels
    // RLS ensures organization-level access control
    const { data: project, error } = await supabase
      .from('projects')
      .select(
        `
        id,
        name,
        background_image,
        background_color,
        columns:project_columns(
          id,
          name,
          color,
          card_limit,
          sort_order,
          tasks:project_tasks(
            id,
            title,
            description,
            priority,
            due_date,
            completed,
            cover_image_url,
            attachment_count,
            sort_order,
            label:project_labels(id, name, color),
            assignees:project_task_assignees(
              user:user_profiles(id, full_name, avatar_url)
            ),
            subtasks:task_subtasks(id, title, checked, position)
          )
        ),
        members:project_members(
          user:user_profiles(id, full_name, avatar_url)
        )
      `
      )
      .eq('id', projectId)
      .is('deleted_at', null)
      .single();

    if (error || !project) {
      console.error('Error fetching kanban board:', error);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Sort columns by sort_order
    if (project.columns) {
      project.columns.sort((a, b) => a.sort_order - b.sort_order);

      // Sort tasks within each column by sort_order
      project.columns.forEach((column) => {
        if (column.tasks) {
          column.tasks.sort((a, b) => a.sort_order - b.sort_order);

          // Sort subtasks by position
          column.tasks.forEach((task) => {
            if (task.subtasks) {
              task.subtasks.sort((a, b) => a.position - b.position);
            }
          });
        }
      });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
