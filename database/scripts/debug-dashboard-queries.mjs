import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://iixfjulmrexivuehoxti.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeGZqdWxtcmV4aXZ1ZWhveHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ3MzUzNywiZXhwIjoyMDgzMDQ5NTM3fQ.-9kWLYoix_N4B1YgSyn6e2Mw1iIKknPFBfCB88FW_lU'
);

const projectId = 'de7be0a8-8f27-43e1-a9b8-16a2ff2f343e';

// 1. Test Gantt query (same as projectGanttFetcher)
console.log('=== GANTT QUERY ===');
const { data: columns, error: colErr } = await supabase
  .from('project_columns')
  .select('id, name, color, sort_order')
  .eq('project_id', projectId)
  .order('sort_order');

console.log('Columns:', columns?.length, colErr?.message || 'OK');

const { data: tasks, error: taskErr } = await supabase
  .from('project_tasks')
  .select(`
    id, title, column_id, due_date, created_at, updated_at,
    assignee:user_profiles(full_name, avatar_url)
  `)
  .eq('project_id', projectId)
  .order('sort_order');

console.log('Tasks:', tasks?.length, taskErr?.message || 'OK');
if (tasks?.length) console.log('Sample task:', JSON.stringify(tasks[0], null, 2));

// 2. Test Roadmap query (same as projectRoadmapFetcher)
console.log('\n=== ROADMAP QUERY ===');
const { data: project, error: projErr } = await supabase
  .from('projects')
  .select(`
    id, name, status,
    columns:project_columns(id, name, color, sort_order),
    tasks:project_tasks(
      id, title, column_id, due_date, priority, sort_order,
      assignee:user_profiles(id, full_name, email, avatar_url)
    ),
    members:project_members(user_id, user:user_profiles(id, full_name, email, avatar_url))
  `)
  .eq('id', projectId)
  .single();

console.log('Project:', project?.name, projErr?.message || 'OK');
if (project) {
  console.log('  columns:', project.columns?.length);
  console.log('  tasks:', project.tasks?.length);
  console.log('  members:', project.members?.length);
}

// 3. Check RLS policies on project_tasks
console.log('\n=== RLS CHECK ===');
// Try with anon key to simulate browser client (no auth)
const anonClient = createClient(
  'https://iixfjulmrexivuehoxti.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeGZqdWxtcmV4aXZ1ZWhveHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NzM1MzcsImV4cCI6MjA4MzA0OTUzN30.RRhTZ7_OJhsf8RtkqIc4V7kjSZrjkq7Ap2ropfWFx4U'
);

const { data: anonTasks, error: anonErr } = await anonClient
  .from('project_tasks')
  .select('id, title')
  .eq('project_id', projectId)
  .limit(5);

console.log('Anon tasks (no auth):', anonTasks?.length, anonErr?.message || 'OK');

const { data: anonMeetings, error: anonMtgErr } = await anonClient
  .from('project_meetings')
  .select('id, title')
  .eq('project_id', projectId)
  .limit(5);

console.log('Anon meetings (no auth):', anonMeetings?.length, anonMtgErr?.message || 'OK');

// 4. Check project_members
console.log('\n=== PROJECT MEMBERS ===');
const { data: members } = await supabase
  .from('project_members')
  .select('user_id, user:user_profiles(full_name, email)')
  .eq('project_id', projectId);

console.log('Members:', JSON.stringify(members, null, 2));
