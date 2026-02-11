import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://iixfjulmrexivuehoxti.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeGZqdWxtcmV4aXZ1ZWhveHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ3MzUzNywiZXhwIjoyMDgzMDQ5NTM3fQ.-9kWLYoix_N4B1YgSyn6e2Mw1iIKknPFBfCB88FW_lU'
);

const { data: projects, error: pErr } = await supabase
  .from('projects')
  .select('id, name, status')
  .ilike('name', '%zen aeon%')
  .is('deleted_at', null);

if (pErr) { console.error('Project error:', pErr.message); process.exit(1); }
console.log('Projects found:', JSON.stringify(projects, null, 2));

if (!projects?.length) { console.log('No Zen Aeon project found'); process.exit(0); }

const projectId = projects[0].id;
console.log('Project ID:', projectId);

const { data: columns } = await supabase
  .from('project_columns')
  .select('id, name, color, sort_order')
  .eq('project_id', projectId)
  .order('sort_order');

console.log('Columns:', JSON.stringify(columns, null, 2));

const { data: tasks } = await supabase
  .from('project_tasks')
  .select('id, title, column_id, due_date, priority, sort_order')
  .eq('project_id', projectId)
  .order('sort_order');

console.log('Tasks:', JSON.stringify(tasks, null, 2));
console.log('Summary: columns=' + (columns?.length || 0) + ', tasks=' + (tasks?.length || 0));
