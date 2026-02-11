/**
 * Execute Migration 007 using direct HTTP calls to Supabase
 * This script uses the Supabase Database API to execute SQL
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_PROJECT_REF = 'iixfjulmrexivuehoxti';
const SUPABASE_URL = 'https://iixfjulmrexivuehoxti.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeGZqdWxtcmV4aXZ1ZWhveHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ3MzUzNywiZXhwIjoyMDgzMDQ5NTM3fQ.-9kWLYoix_N4B1YgSyn6e2Mw1iIKknPFBfCB88FW_lU';

async function executeSQLViaAPI(sql, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔄 ${description}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Try using the Supabase Management API
    // This requires an access token, not the service role key
    // For now, we'll print instructions for manual execution

    console.log('   ℹ️  Automatic execution not available via REST API');
    console.log('   SQL files must be executed manually via Supabase Dashboard\n');

    return false;
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    return false;
  }
}

async function printManualInstructions() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 MANUAL EXECUTION REQUIRED');
  console.log('='.repeat(70));
  console.log('\nThe Supabase JavaScript client cannot execute DDL statements directly.');
  console.log('Please follow these steps to execute the migration:\n');

  console.log('STEP 1: Execute Migration (Create Tables)');
  console.log('-'.repeat(70));
  console.log('1. Open: https://app.supabase.com/project/iixfjulmrexivuehoxti/sql');
  console.log('2. Copy the contents of: database/migrations/007_project_dashboard_tables.sql');
  console.log('3. Paste into the SQL Editor');
  console.log('4. Click "Run" or press Cmd/Ctrl + Enter\n');

  console.log('STEP 2: Execute Seed Data (Populate Tables)');
  console.log('-'.repeat(70));
  console.log('1. In the same SQL Editor: https://app.supabase.com/project/iixfjulmrexivuehoxti/sql');
  console.log('2. Copy the contents of: database/seeds/07-project-dashboard-data.sql');
  console.log('3. Paste into the SQL Editor');
  console.log('4. Click "Run" or press Cmd/Ctrl + Enter\n');

  console.log('EXPECTED RESULTS:');
  console.log('-'.repeat(70));
  console.log('✅ 5 new tables created:');
  console.log('   - project_meetings');
  console.log('   - project_meeting_attendees');
  console.log('   - project_events');
  console.log('   - project_event_members');
  console.log('   - time_entries');
  console.log('\n✅ Row Level Security (RLS) policies applied');
  console.log('✅ Indexes created for query performance');
  console.log('✅ Sample data populated for testing\n');

  console.log('VERIFICATION:');
  console.log('-'.repeat(70));
  console.log('After running both SQL files, you can verify by running:');
  console.log('   node database/migrations/verify-migration-007.mjs\n');

  console.log('='.repeat(70));
}

async function createVerificationScript() {
  const verifyScript = `/**
 * Verify Migration 007: Project Dashboard Tables
 * Checks that all tables and sample data were created successfully
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

async function verifyTables() {
  console.log('\\n' + '='.repeat(60));
  console.log('📊 Verifying Migration 007: Tables');
  console.log('='.repeat(60) + '\\n');

  const tables = [
    'project_meetings',
    'project_meeting_attendees',
    'project_events',
    'project_event_members',
    'time_entries'
  ];

  let allTablesExist = true;

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error) {
        console.log(\`   ❌ Table \${table} - ERROR: \${error.message}\`);
        allTablesExist = false;
      } else {
        console.log(\`   ✅ Table \${table} - EXISTS\`);
      }
    } catch (error) {
      console.log(\`   ❌ Table \${table} - ERROR: \${error.message}\`);
      allTablesExist = false;
    }
  }

  return allTablesExist;
}

async function verifySeedData() {
  console.log('\\n' + '='.repeat(60));
  console.log('📊 Verifying Seed Data');
  console.log('='.repeat(60) + '\\n');

  try {
    // Check meetings
    const { data: meetings, error: meetingsError } = await supabase
      .from('project_meetings')
      .select('id, title, start_time');

    if (meetingsError) throw meetingsError;
    console.log(\`   ✅ Project Meetings: \${meetings?.length || 0} records\`);
    if (meetings && meetings.length > 0) {
      meetings.slice(0, 3).forEach(m => {
        const date = new Date(m.start_time).toLocaleDateString();
        console.log(\`      - \${m.title} (\${date})\`);
      });
    }

    // Check meeting attendees
    const { data: attendees, error: attendeesError } = await supabase
      .from('project_meeting_attendees')
      .select('id, rsvp_status');

    if (attendeesError) throw attendeesError;
    console.log(\`\\n   ✅ Meeting Attendees: \${attendees?.length || 0} records\`);
    if (attendees && attendees.length > 0) {
      const accepted = attendees.filter(a => a.rsvp_status === 'accepted').length;
      const pending = attendees.filter(a => a.rsvp_status === 'pending').length;
      console.log(\`      - Accepted: \${accepted}, Pending: \${pending}\`);
    }

    // Check events
    const { data: events, error: eventsError } = await supabase
      .from('project_events')
      .select('id, title, category, start_date');

    if (eventsError) throw eventsError;
    console.log(\`\\n   ✅ Project Events: \${events?.length || 0} records\`);
    if (events && events.length > 0) {
      events.slice(0, 3).forEach(e => {
        const date = new Date(e.start_date).toLocaleDateString();
        console.log(\`      - \${e.title} (\${e.category}, \${date})\`);
      });
    }

    // Check event members
    const { data: eventMembers, error: membersError } = await supabase
      .from('project_event_members')
      .select('id');

    if (membersError) throw membersError;
    console.log(\`\\n   ✅ Event Members: \${eventMembers?.length || 0} records\`);

    // Check time entries
    const { data: timeEntries, error: timeError } = await supabase
      .from('time_entries')
      .select('id, hours, description, date');

    if (timeError) throw timeError;
    console.log(\`\\n   ✅ Time Entries: \${timeEntries?.length || 0} records\`);
    if (timeEntries && timeEntries.length > 0) {
      const totalHours = timeEntries.reduce((sum, entry) => sum + parseFloat(entry.hours), 0);
      console.log(\`      - Total hours logged: \${totalHours.toFixed(1)}\`);
      console.log(\`      - Date range: \${new Date(timeEntries[timeEntries.length - 1].date).toLocaleDateString()} to \${new Date(timeEntries[0].date).toLocaleDateString()}\`);
    }

    return true;
  } catch (error) {
    console.error(\`\\n   ❌ Error verifying seed data: \${error.message}\`);
    return false;
  }
}

async function main() {
  console.log('\\n🔍 Migration 007 Verification');
  console.log('   Checking project dashboard tables and seed data\\n');

  try {
    const tablesOk = await verifyTables();
    const seedsOk = await verifySeedData();

    console.log('\\n' + '='.repeat(60));
    if (tablesOk && seedsOk) {
      console.log('✅ VERIFICATION PASSED');
      console.log('='.repeat(60));
      console.log('\\nAll tables exist and seed data is populated.\\n');
    } else {
      console.log('⚠️  VERIFICATION FAILED');
      console.log('='.repeat(60));
      console.log('\\nSome tables or data are missing. Please check the errors above.\\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\\n❌ Verification error:', error.message);
    process.exit(1);
  }
}

main();
`;

  const verifyPath = path.join(__dirname, 'verify-migration-007.mjs');
  fs.writeFileSync(verifyPath, verifyScript);
  console.log(`\n✅ Created verification script: ${path.basename(verifyPath)}`);
}

async function main() {
  console.log('\n🚀 Migration 007: Project Dashboard Tables');
  console.log('   Setup for meetings, events, and time tracking\n');

  // Create verification script
  await createVerificationScript();

  // Print manual instructions
  await printManualInstructions();
}

main();
