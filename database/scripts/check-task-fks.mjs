import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://iixfjulmrexivuehoxti.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeGZqdWxtcmV4aXZ1ZWhveHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ3MzUzNywiZXhwIjoyMDgzMDQ5NTM3fQ.-9kWLYoix_N4B1YgSyn6e2Mw1iIKknPFBfCB88FW_lU'
);

// Get one task with all columns to see what FK columns exist
const { data } = await supabase
  .from('project_tasks')
  .select('*')
  .limit(1)
  .single();

console.log('Task columns:', Object.keys(data || {}));

// Try with explicit FK hint
const { data: test1, error: err1 } = await supabase
  .from('project_tasks')
  .select('id, title, assignee:user_profiles!assignee_id(full_name)')
  .eq('project_id', 'de7be0a8-8f27-43e1-a9b8-16a2ff2f343e')
  .limit(1);

console.log('With !assignee_id hint:', test1?.length, err1?.message || 'OK');

const { data: test2, error: err2 } = await supabase
  .from('project_tasks')
  .select('id, title, creator:user_profiles!created_by(full_name)')
  .eq('project_id', 'de7be0a8-8f27-43e1-a9b8-16a2ff2f343e')
  .limit(1);

console.log('With !created_by hint:', test2?.length, err2?.message || 'OK');
