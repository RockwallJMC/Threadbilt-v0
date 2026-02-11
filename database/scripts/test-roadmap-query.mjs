import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://iixfjulmrexivuehoxti.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeGZqdWxtcmV4aXZ1ZWhveHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ3MzUzNywiZXhwIjoyMDgzMDQ5NTM3fQ.-9kWLYoix_N4B1YgSyn6e2Mw1iIKknPFBfCB88FW_lU'
);

const projectId = 'de7be0a8-8f27-43e1-a9b8-16a2ff2f343e';

// Test exact roadmap query with FK hint
const { data: project, error } = await supabase
  .from('projects')
  .select(`
    id, name,
    columns:project_columns(id, name, sort_order),
    tasks:project_tasks(
      id, title, column_id, due_date, priority,
      assignee:user_profiles!assignee_id(id, full_name, email, avatar_url)
    ),
    members:project_members(
      user_id, role,
      user:user_profiles(id, full_name, email, avatar_url)
    )
  `)
  .eq('id', projectId)
  .single();

if (error) {
  console.log('Roadmap query ERROR:', error.message);
} else {
  console.log('Roadmap query OK');
  console.log('  Project:', project.name);
  console.log('  Columns:', project.columns?.length);
  console.log('  Tasks:', project.tasks?.length);
  console.log('  Members:', project.members?.length);
}

// Test gantt query
const { data: cols, error: cErr } = await supabase
  .from('project_columns')
  .select('id, name, color, sort_order')
  .eq('project_id', projectId)
  .order('sort_order');

const { data: tasks, error: tErr } = await supabase
  .from('project_tasks')
  .select(`
    id, title, column_id, due_date, created_at, updated_at,
    assignee:user_profiles!assignee_id(full_name, avatar_url)
  `)
  .eq('project_id', projectId)
  .order('sort_order');

console.log('\nGantt columns:', cols?.length, cErr?.message || 'OK');
console.log('Gantt tasks:', tasks?.length, tErr?.message || 'OK');
