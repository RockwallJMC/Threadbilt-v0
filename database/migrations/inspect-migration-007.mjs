/**
 * Inspect Migration 007 Data
 * Detailed inspection of the project dashboard tables
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iixfjulmrexivuehoxti.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeGZqdWxtcmV4aXZ1ZWhveHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ3MzUzNywiZXhwIjoyMDgzMDQ5NTM3fQ.-9kWLYoix_N4B1YgSyn6e2Mw1iIKknPFBfCB88FW_lU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function inspectMeetings() {
  console.log('\n' + '='.repeat(80));
  console.log('📅 PROJECT MEETINGS');
  console.log('='.repeat(80) + '\n');

  const { data: meetings, error } = await supabase
    .from('project_meetings')
    .select(`
      id,
      title,
      description,
      start_time,
      end_time,
      meeting_link,
      location,
      project:projects(name),
      attendees:project_meeting_attendees(count)
    `)
    .order('start_time', { ascending: true })
    .limit(10);

  if (error) {
    console.error('   ❌ Error:', error.message);
    return;
  }

  console.log(`   Total meetings: ${meetings.length}`);
  console.log('');

  meetings.forEach((meeting, index) => {
    const startTime = new Date(meeting.start_time);
    const endTime = meeting.end_time ? new Date(meeting.end_time) : null;
    const duration = endTime ? ((endTime - startTime) / (1000 * 60 * 60)).toFixed(1) : 'N/A';

    console.log(`   ${index + 1}. ${meeting.title}`);
    console.log(`      Project: ${meeting.project?.name || 'N/A'}`);
    console.log(`      Start: ${startTime.toLocaleString()}`);
    console.log(`      Duration: ${duration} hours`);
    console.log(`      Type: ${meeting.meeting_link ? 'Virtual' : meeting.location ? 'Physical' : 'TBD'}`);
    if (meeting.meeting_link) console.log(`      Link: ${meeting.meeting_link}`);
    if (meeting.location) console.log(`      Location: ${meeting.location}`);
    console.log('');
  });
}

async function inspectEvents() {
  console.log('\n' + '='.repeat(80));
  console.log('📆 PROJECT EVENTS');
  console.log('='.repeat(80) + '\n');

  const { data: events, error } = await supabase
    .from('project_events')
    .select(`
      id,
      title,
      category,
      all_day_event,
      start_date,
      start_time,
      end_date,
      end_time,
      event_type,
      virtual_link,
      physical_location,
      color,
      project:projects(name),
      members:project_event_members(count)
    `)
    .order('start_date', { ascending: true })
    .limit(10);

  if (error) {
    console.error('   ❌ Error:', error.message);
    return;
  }

  console.log(`   Total events: ${events.length}`);
  console.log('');

  const categoryEmojis = {
    my_events: '👤',
    upcoming: '📅',
    important: '⭐'
  };

  events.forEach((event, index) => {
    const categoryEmoji = categoryEmojis[event.category] || '📌';
    const startDate = new Date(event.start_date).toLocaleDateString();
    const typeEmoji = event.event_type === 'physical' ? '📍' : event.event_type === 'online' ? '💻' : '🔀';

    console.log(`   ${index + 1}. ${categoryEmoji} ${event.title}`);
    console.log(`      Project: ${event.project?.name || 'N/A'}`);
    console.log(`      Date: ${startDate}${event.all_day_event ? ' (All Day)' : ''}`);
    console.log(`      Type: ${typeEmoji} ${event.event_type}`);
    console.log(`      Category: ${event.category}`);
    if (event.virtual_link) console.log(`      Link: ${event.virtual_link}`);
    if (event.physical_location) console.log(`      Location: ${event.physical_location}`);
    console.log('');
  });
}

async function inspectTimeEntries() {
  console.log('\n' + '='.repeat(80));
  console.log('⏱️  TIME ENTRIES');
  console.log('='.repeat(80) + '\n');

  const { data: entries, error } = await supabase
    .from('time_entries')
    .select(`
      id,
      hours,
      date,
      description,
      project:projects(name),
      user:user_profiles(full_name)
    `)
    .order('date', { ascending: false })
    .limit(15);

  if (error) {
    console.error('   ❌ Error:', error.message);
    return;
  }

  console.log(`   Total time entries: ${entries.length}`);
  console.log('');

  // Group by date
  const byDate = entries.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  Object.keys(byDate).sort().reverse().forEach(date => {
    const dateEntries = byDate[date];
    const totalHours = dateEntries.reduce((sum, e) => sum + parseFloat(e.hours), 0);
    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString();

    console.log(`   📅 ${formattedDate} - ${totalHours.toFixed(1)} hours`);
    dateEntries.forEach(entry => {
      console.log(`      • ${entry.hours}h - ${entry.description}`);
      console.log(`        User: ${entry.user?.full_name || 'Unknown'}`);
      console.log(`        Project: ${entry.project?.name || 'Unknown'}`);
    });
    console.log('');
  });
}

async function inspectSummary() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY STATISTICS');
  console.log('='.repeat(80) + '\n');

  // Total counts
  const { data: meetings } = await supabase.from('project_meetings').select('id', { count: 'exact' });
  const { data: attendees } = await supabase.from('project_meeting_attendees').select('id', { count: 'exact' });
  const { data: events } = await supabase.from('project_events').select('id', { count: 'exact' });
  const { data: eventMembers } = await supabase.from('project_event_members').select('id', { count: 'exact' });
  const { data: timeEntries } = await supabase.from('time_entries').select('hours');

  const totalHours = timeEntries ? timeEntries.reduce((sum, e) => sum + parseFloat(e.hours), 0) : 0;

  console.log('   📅 Meetings:');
  console.log(`      Total: ${meetings?.length || 0}`);
  console.log(`      Attendees: ${attendees?.length || 0}`);
  console.log(`      Avg attendees per meeting: ${meetings?.length ? (attendees.length / meetings.length).toFixed(1) : 0}`);

  console.log('\n   📆 Events:');
  console.log(`      Total: ${events?.length || 0}`);
  console.log(`      Members: ${eventMembers?.length || 0}`);
  console.log(`      Avg members per event: ${events?.length ? (eventMembers.length / events.length).toFixed(1) : 0}`);

  console.log('\n   ⏱️  Time Tracking:');
  console.log(`      Total entries: ${timeEntries?.length || 0}`);
  console.log(`      Total hours: ${totalHours.toFixed(1)}h`);
  console.log(`      Avg hours per entry: ${timeEntries?.length ? (totalHours / timeEntries.length).toFixed(1) : 0}h`);

  // RSVP status breakdown
  const { data: rsvpBreakdown } = await supabase
    .from('project_meeting_attendees')
    .select('rsvp_status');

  if (rsvpBreakdown) {
    const rsvpCounts = rsvpBreakdown.reduce((acc, a) => {
      acc[a.rsvp_status] = (acc[a.rsvp_status] || 0) + 1;
      return acc;
    }, {});

    console.log('\n   🎯 RSVP Status:');
    Object.entries(rsvpCounts).forEach(([status, count]) => {
      console.log(`      ${status}: ${count}`);
    });
  }

  // Event categories
  const { data: eventCategories } = await supabase
    .from('project_events')
    .select('category');

  if (eventCategories) {
    const categoryCounts = eventCategories.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1;
      return acc;
    }, {});

    console.log('\n   📊 Event Categories:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`      ${category}: ${count}`);
    });
  }

  console.log('');
}

async function main() {
  console.log('\n🔍 Migration 007: Data Inspection');
  console.log('   Detailed view of project dashboard data\n');

  try {
    await inspectMeetings();
    await inspectEvents();
    await inspectTimeEntries();
    await inspectSummary();

    console.log('='.repeat(80));
    console.log('✅ Inspection Complete');
    console.log('='.repeat(80) + '\n');
  } catch (error) {
    console.error('\n❌ Inspection error:', error.message);
    process.exit(1);
  }
}

main();
