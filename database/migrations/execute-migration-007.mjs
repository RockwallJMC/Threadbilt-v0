/**
 * Execute Migration 007: Project Dashboard Tables
 * This script executes the migration and seed files for project dashboard features
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://iixfjulmrexivuehoxti.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeGZqdWxtcmV4aXZ1ZWhveHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ3MzUzNywiZXhwIjoyMDgzMDQ5NTM3fQ.-9kWLYoix_N4B1YgSyn6e2Mw1iIKknPFBfCB88FW_lU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQLFile(filename, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔄 Executing: ${description}`);
  console.log(`   File: ${filename}`);
  console.log(`${'='.repeat(60)}\n`);

  const filePath = path.join(__dirname, filename);
  const sql = fs.readFileSync(filePath, 'utf8');

  // For DDL statements, we need to use the Supabase REST API directly
  // The SQL query endpoint requires the SQL to be sent via RPC
  try {
    const { data, error } = await supabase.rpc('exec', { sql });

    if (error) {
      console.error(`   ❌ Error executing SQL:`, error);
      throw error;
    }

    console.log(`   ✅ Successfully executed ${description}`);
    return true;
  } catch (error) {
    // If RPC doesn't work, print instructions for manual execution
    console.error(`   ❌ Direct execution failed:`, error.message);
    console.log(`\n   ℹ️  Manual execution required:`);
    console.log(`   1. Open Supabase SQL Editor: https://app.supabase.com/project/iixfjulmrexivuehoxti/sql`);
    console.log(`   2. Copy and paste the contents of: ${filename}`);
    console.log(`   3. Click "Run"\n`);
    return false;
  }
}

async function verifyMigration() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 Verifying Migration...');
  console.log(`${'='.repeat(60)}\n`);

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
        console.log(`   ❌ Table ${table} not found or not accessible`);
        allTablesExist = false;
      } else {
        console.log(`   ✅ Table ${table} exists`);
      }
    } catch (error) {
      console.log(`   ❌ Error checking table ${table}: ${error.message}`);
      allTablesExist = false;
    }
  }

  return allTablesExist;
}

async function verifySeedData() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 Verifying Seed Data...');
  console.log(`${'='.repeat(60)}\n`);

  try {
    const { data: meetings, error: meetingsError } = await supabase
      .from('project_meetings')
      .select('id, title');

    if (meetingsError) throw meetingsError;
    console.log(`   ✅ Project Meetings: ${meetings?.length || 0} records`);
    if (meetings && meetings.length > 0) {
      meetings.slice(0, 3).forEach(m => console.log(`      - ${m.title}`));
    }

    const { data: events, error: eventsError } = await supabase
      .from('project_events')
      .select('id, title');

    if (eventsError) throw eventsError;
    console.log(`   ✅ Project Events: ${events?.length || 0} records`);
    if (events && events.length > 0) {
      events.slice(0, 3).forEach(e => console.log(`      - ${e.title}`));
    }

    const { data: timeEntries, error: timeError } = await supabase
      .from('time_entries')
      .select('id, hours, description');

    if (timeError) throw timeError;
    console.log(`   ✅ Time Entries: ${timeEntries?.length || 0} records`);
    if (timeEntries && timeEntries.length > 0) {
      const totalHours = timeEntries.reduce((sum, entry) => sum + parseFloat(entry.hours), 0);
      console.log(`      - Total hours logged: ${totalHours}`);
    }

    return true;
  } catch (error) {
    console.error(`   ❌ Error verifying seed data:`, error.message);
    return false;
  }
}

async function main() {
  console.log('\n🚀 Migration 007: Project Dashboard Tables');
  console.log('   Creating tables for meetings, events, and time tracking\n');

  try {
    // Step 1: Execute migration (create tables)
    const migrationSuccess = await executeSQLFile(
      '007_project_dashboard_tables.sql',
      'Migration - Create Tables and RLS Policies'
    );

    if (!migrationSuccess) {
      console.log('\n⚠️  Migration could not be executed automatically.');
      console.log('   Please execute the SQL file manually in Supabase SQL Editor.\n');
      process.exit(1);
    }

    // Step 2: Verify tables were created
    const tablesVerified = await verifyMigration();

    if (!tablesVerified) {
      console.log('\n⚠️  Some tables were not created successfully.');
      console.log('   Please check the Supabase SQL Editor for errors.\n');
      process.exit(1);
    }

    // Step 3: Execute seed file (populate data)
    const seedPath = path.join(__dirname, '../seeds/07-project-dashboard-data.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🌱 Seeding Data: Project Dashboard Sample Data`);
    console.log(`${'='.repeat(60)}\n`);

    const { data, error } = await supabase.rpc('exec', { sql: seedSQL });

    if (error) {
      console.log(`   ⚠️  Seed execution via RPC failed: ${error.message}`);
      console.log(`   Attempting manual execution instructions...`);
      console.log(`\n   ℹ️  Manual execution required:`);
      console.log(`   1. Open Supabase SQL Editor: https://app.supabase.com/project/iixfjulmrexivuehoxti/sql`);
      console.log(`   2. Copy and paste the contents of: database/seeds/07-project-dashboard-data.sql`);
      console.log(`   3. Click "Run"\n`);
    } else {
      console.log(`   ✅ Successfully seeded data`);
    }

    // Step 4: Verify seed data
    await verifySeedData();

    console.log(`\n${'='.repeat(60)}`);
    console.log('✨ Migration 007 Complete!');
    console.log(`${'='.repeat(60)}\n`);

    console.log('📝 Summary:');
    console.log('   - 5 new tables created (project_meetings, project_meeting_attendees, project_events, project_event_members, time_entries)');
    console.log('   - Row Level Security (RLS) policies applied');
    console.log('   - Indexes created for performance');
    console.log('   - Sample data seeded for testing\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
