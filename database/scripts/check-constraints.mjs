import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://iixfjulmrexivuehoxti.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeGZqdWxtcmV4aXZ1ZWhveHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ3MzUzNywiZXhwIjoyMDgzMDQ5NTM3fQ.-9kWLYoix_N4B1YgSyn6e2Mw1iIKknPFBfCB88FW_lU'
);

// Check existing task priorities
const { data: tasks } = await supabase
  .from('project_tasks')
  .select('priority')
  .not('priority', 'is', null)
  .limit(20);

const priorities = [...new Set(tasks?.map(t => t.priority))];
console.log('Existing priorities in use:', priorities);

// Try inserting with different priorities to find valid ones
const testPriorities = ['urgent', 'high', 'medium', 'low', 'optional', 'critical', 'none'];
for (const p of testPriorities) {
  const { error } = await supabase.from('project_tasks').insert({
    project_id: 'de7be0a8-8f27-43e1-a9b8-16a2ff2f343e',
    column_id: '2137825a-d349-4df1-85ef-b0e3b189915a',
    title: `_test_priority_${p}`,
    priority: p,
    sort_order: 999,
  });
  if (error) {
    console.log(`Priority '${p}': INVALID - ${error.message}`);
  } else {
    console.log(`Priority '${p}': VALID`);
    // Clean up test row
    await supabase.from('project_tasks').delete().eq('title', `_test_priority_${p}`).eq('project_id', 'de7be0a8-8f27-43e1-a9b8-16a2ff2f343e');
  }
}
