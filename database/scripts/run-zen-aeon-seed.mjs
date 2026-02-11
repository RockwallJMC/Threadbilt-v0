import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabase = createClient(
  'https://iixfjulmrexivuehoxti.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeGZqdWxtcmV4aXZ1ZWhveHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ3MzUzNywiZXhwIjoyMDgzMDQ5NTM3fQ.-9kWLYoix_N4B1YgSyn6e2Mw1iIKknPFBfCB88FW_lU'
);

const sql = readFileSync('database/seeds/08-zen-aeon-dashboard-seed.sql', 'utf-8');

console.log('Running Zen Aeon seed...');
const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

if (error) {
  // If exec_sql doesn't exist, try the REST API approach
  console.log('exec_sql not available, trying direct approach...');

  // Use the postgres endpoint
  const response = await fetch('https://iixfjulmrexivuehoxti.supabase.co/rest/v1/rpc/exec_sql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeGZqdWxtcmV4aXZ1ZWhveHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ3MzUzNywiZXhwIjoyMDgzMDQ5NTM3fQ.-9kWLYoix_N4B1YgSyn6e2Mw1iIKknPFBfCB88FW_lU',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeGZqdWxtcmV4aXZ1ZWhveHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ3MzUzNywiZXhwIjoyMDgzMDQ5NTM3fQ.-9kWLYoix_N4B1YgSyn6e2Mw1iIKknPFBfCB88FW_lU',
    },
    body: JSON.stringify({ sql_query: sql }),
  });

  if (!response.ok) {
    console.error('REST API error:', await response.text());
    console.log('\nFalling back to individual inserts...');
    await seedIndividually();
  } else {
    console.log('Seed executed successfully via REST');
  }
} else {
  console.log('Seed executed successfully:', data);
}

// Verify
console.log('\n--- Verification ---');
const projectId = 'de7be0a8-8f27-43e1-a9b8-16a2ff2f343e';

const { data: tasks, count: taskCount } = await supabase
  .from('project_tasks')
  .select('id, title, column_id', { count: 'exact' })
  .eq('project_id', projectId);

const { data: columns } = await supabase
  .from('project_columns')
  .select('id, name')
  .eq('project_id', projectId)
  .order('sort_order');

const { data: meetings } = await supabase
  .from('project_meetings')
  .select('id, title')
  .eq('project_id', projectId);

const { data: events } = await supabase
  .from('project_events')
  .select('id, title')
  .eq('project_id', projectId);

const { data: timeEntries } = await supabase
  .from('time_entries')
  .select('id')
  .eq('project_id', projectId);

console.log('Tasks:', tasks?.length || 0);
if (columns) {
  for (const col of columns) {
    const colTasks = tasks?.filter(t => t.column_id === col.id) || [];
    console.log(`  ${col.name}: ${colTasks.length} tasks`);
  }
}
console.log('Meetings:', meetings?.length || 0);
console.log('Events:', events?.length || 0);
console.log('Time entries:', timeEntries?.length || 0);

async function seedIndividually() {
  const projectId = 'de7be0a8-8f27-43e1-a9b8-16a2ff2f343e';
  const colTodo = '2137825a-d349-4df1-85ef-b0e3b189915a';
  const colProgress = '3b16c965-4a1b-4c1e-9631-ef54d1c0770e';
  const colReview = '42157e0b-3a4c-4a11-bbaa-3a68f7b98d4e';
  const colCompleted = 'a0dd5864-927e-49ce-bb23-8a40a38578d6';

  // Get a user
  const { data: users } = await supabase.from('user_profiles').select('id').limit(2);
  const userId = users?.[0]?.id;
  const user2Id = users?.[1]?.id || userId;
  if (!userId) { console.error('No users found'); return; }

  const today = new Date();
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r.toISOString().split('T')[0]; };
  const subDays = (d, n) => addDays(d, -n);

  // TO DO tasks
  const todoTasks = [
    { title: 'Performance benchmarking', description: 'Run load tests and establish baseline metrics', priority: 'high', due_date: addDays(today, 10), sort_order: 2, created_at: subDays(today, 2) },
    { title: 'Mobile responsive audit', description: 'Test all views on tablet and phone breakpoints', priority: 'medium', due_date: addDays(today, 14), sort_order: 3, created_at: subDays(today, 1) },
    { title: 'Accessibility compliance', description: 'WCAG 2.1 AA audit and remediation plan', priority: 'high', due_date: addDays(today, 18), sort_order: 4, created_at: addDays(today, 0) },
    { title: 'Data migration scripts', description: 'Write ETL scripts for legacy data import', priority: 'medium', due_date: addDays(today, 21), sort_order: 5, created_at: addDays(today, 0) },
  ].map(t => ({ ...t, project_id: projectId, column_id: colTodo, created_by: userId }));

  // IN PROGRESS tasks
  const progressTasks = [
    { title: 'Authentication flow redesign', description: 'Implement OAuth2 + MFA support', priority: 'high', due_date: addDays(today, 5), sort_order: 6, created_at: subDays(today, 12) },
    { title: 'Real-time notifications', description: 'WebSocket integration for live alerts', priority: 'high', due_date: addDays(today, 8), sort_order: 7, created_at: subDays(today, 8) },
    { title: 'Search indexing service', description: 'Elasticsearch integration for full-text search', priority: 'medium', due_date: addDays(today, 12), sort_order: 8, created_at: subDays(today, 6) },
  ].map(t => ({ ...t, project_id: projectId, column_id: colProgress, created_by: user2Id }));

  // REVIEW tasks
  const reviewTasks = [
    { title: 'Payment gateway integration', description: 'Stripe + PayPal checkout flow', priority: 'high', due_date: addDays(today, 2), sort_order: 0, created_at: subDays(today, 18) },
    { title: 'Email template system', description: 'Transactional email templates with SendGrid', priority: 'medium', due_date: addDays(today, 4), sort_order: 1, created_at: subDays(today, 14) },
    { title: 'CI/CD pipeline setup', description: 'GitHub Actions with staging + production deploys', priority: 'high', due_date: addDays(today, 3), sort_order: 2, created_at: subDays(today, 10) },
    { title: 'API rate limiting', description: 'Implement throttling middleware with Redis', priority: 'medium', due_date: addDays(today, 5), sort_order: 3, created_at: subDays(today, 9) },
  ].map(t => ({ ...t, project_id: projectId, column_id: colReview, created_by: userId }));

  // COMPLETED tasks
  const completedTasks = [
    { title: 'Database schema design', description: 'Designed and migrated all core tables', priority: 'high', due_date: subDays(today, 5), sort_order: 0, created_at: subDays(today, 25) },
    { title: 'Design system setup', description: 'MUI theme config, typography, color tokens', priority: 'high', due_date: subDays(today, 8), sort_order: 1, created_at: subDays(today, 22) },
    { title: 'Project scaffolding', description: 'Next.js App Router + folder structure + ESLint', priority: 'medium', due_date: subDays(today, 12), sort_order: 2, created_at: subDays(today, 30) },
    { title: 'User profile CRUD', description: 'Full create/read/update with avatar upload', priority: 'medium', due_date: subDays(today, 3), sort_order: 3, created_at: subDays(today, 15) },
    { title: 'Role-based permissions', description: 'RLS policies for admin/manager/member roles', priority: 'high', due_date: subDays(today, 6), sort_order: 4, created_at: subDays(today, 20) },
  ].map(t => ({ ...t, project_id: projectId, column_id: colCompleted, created_by: user2Id }));

  const allTasks = [...todoTasks, ...progressTasks, ...reviewTasks, ...completedTasks];

  // Check for existing tasks to avoid duplicates
  const { data: existingTasks } = await supabase
    .from('project_tasks')
    .select('title')
    .eq('project_id', projectId);

  const existingTitles = new Set((existingTasks || []).map(t => t.title));
  const newTasks = allTasks.filter(t => !existingTitles.has(t.title));

  if (newTasks.length > 0) {
    const { error: taskErr } = await supabase.from('project_tasks').insert(newTasks);
    if (taskErr) console.error('Task insert error:', taskErr.message);
    else console.log(`Inserted ${newTasks.length} new tasks`);
  } else {
    console.log('All tasks already exist');
  }

  // Meetings
  const meetingDefs = [
    { title: 'Zen Aeon Sprint Planning', description: 'Plan sprint 4 tasks', start_time: new Date(today.getTime() + 10 * 60000).toISOString(), end_time: new Date(today.getTime() + 70 * 60000).toISOString(), meeting_link: 'https://meet.google.com/zen-sprint-plan' },
    { title: 'Design Review - Dashboard V2', description: 'Walk through new mockups', start_time: new Date(today.getTime() + 86400000 + 50400000).toISOString(), end_time: new Date(today.getTime() + 86400000 + 54000000).toISOString(), meeting_link: 'https://meet.google.com/zen-design-review' },
    { title: 'Architecture Deep Dive', description: 'Review backend architecture decisions', start_time: new Date(today.getTime() + 3 * 86400000 + 36000000).toISOString(), end_time: new Date(today.getTime() + 3 * 86400000 + 43200000).toISOString(), location: 'Engineering Room B' },
    { title: 'Client Demo - Milestone 2', description: 'Present completed features', start_time: new Date(today.getTime() + 6 * 86400000 + 57600000).toISOString(), end_time: new Date(today.getTime() + 6 * 86400000 + 63000000).toISOString(), meeting_link: 'https://zoom.us/j/zen-aeon-demo' },
  ];

  // Check existing meetings
  const { data: existingMeetings } = await supabase
    .from('project_meetings')
    .select('title')
    .eq('project_id', projectId);

  const existingMeetingTitles = new Set((existingMeetings || []).map(m => m.title));

  for (const mtg of meetingDefs) {
    if (existingMeetingTitles.has(mtg.title)) continue;
    const { data: inserted, error: mErr } = await supabase
      .from('project_meetings')
      .insert({ ...mtg, project_id: projectId, created_by: userId })
      .select('id')
      .single();

    if (mErr) { console.error('Meeting insert error:', mErr.message); continue; }

    // Add attendees
    await supabase.from('project_meeting_attendees').insert([
      { meeting_id: inserted.id, user_id: userId, rsvp_status: 'accepted' },
      { meeting_id: inserted.id, user_id: user2Id, rsvp_status: 'accepted' },
    ]);
    console.log(`Inserted meeting: ${mtg.title}`);
  }

  // Events
  const eventDefs = [
    { title: 'Sprint 4 - Development Phase', all_day_event: true, category: 'important', start_date: addDays(today, 0), start_time: '09:00', end_date: addDays(today, 10), end_time: '17:00', event_type: 'physical', physical_location: 'Engineering Floor', color: 'warning' },
    { title: 'Zen Aeon Retrospective', all_day_event: false, category: 'upcoming', start_date: addDays(today, 10), start_time: '14:00', end_date: addDays(today, 10), end_time: '15:30', event_type: 'online', virtual_link: 'https://meet.google.com/zen-retro', color: 'success' },
    { title: 'Code Freeze - Release Candidate', all_day_event: false, category: 'important', start_date: addDays(today, 8), start_time: '18:00', event_type: 'physical', physical_location: 'All environments', color: 'error' },
    { title: 'Milestone 2 Launch Party', all_day_event: false, category: 'my_events', start_date: addDays(today, 14), start_time: '17:00', end_date: addDays(today, 14), end_time: '19:00', event_type: 'hybrid', virtual_link: 'https://zoom.us/j/zen-party', physical_location: 'Main Lounge', color: 'primary' },
  ];

  const { data: existingEvents } = await supabase
    .from('project_events')
    .select('title')
    .eq('project_id', projectId);

  const existingEventTitles = new Set((existingEvents || []).map(e => e.title));

  for (const evt of eventDefs) {
    if (existingEventTitles.has(evt.title)) continue;
    const { data: inserted, error: eErr } = await supabase
      .from('project_events')
      .insert({ ...evt, project_id: projectId, notification_minutes: 15, created_by: userId })
      .select('id')
      .single();

    if (eErr) { console.error('Event insert error:', eErr.message); continue; }

    await supabase.from('project_event_members').insert([
      { event_id: inserted.id, user_id: userId },
      { event_id: inserted.id, user_id: user2Id },
    ]);
    console.log(`Inserted event: ${evt.title}`);
  }

  // Time entries
  const { data: existingEntries } = await supabase
    .from('time_entries')
    .select('id')
    .eq('project_id', projectId);

  if (!existingEntries?.length) {
    const timeEntries = [];
    for (let i = 8; i >= 0; i--) {
      timeEntries.push(
        { project_id: projectId, user_id: userId, hours: 3 + Math.random() * 5, date: subDays(today, i), description: `Development work day ${9 - i}` },
        { project_id: projectId, user_id: user2Id, hours: 2 + Math.random() * 6, date: subDays(today, i), description: `Design and testing day ${9 - i}` },
      );
    }
    const { error: teErr } = await supabase.from('time_entries').insert(timeEntries);
    if (teErr) console.error('Time entries error:', teErr.message);
    else console.log(`Inserted ${timeEntries.length} time entries`);
  } else {
    console.log('Time entries already exist for this project');
  }
}
