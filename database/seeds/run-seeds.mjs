/**
 * Database Seed Runner for Multi-Tenant Testing
 * Executes SQL seed files against Supabase database
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration from environment
const supabaseUrl = 'https://iixfjulmrexivuehoxti.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeGZqdWxtcmV4aXZ1ZWhveHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ3MzUzNywiZXhwIjoyMDgzMDQ5NTM3fQ.-9kWLYoix_N4B1YgSyn6e2Mw1iIKknPFBfCB88FW_lU';

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const seedFiles = [
  '01-organizations.sql',
  '02-user-profiles.sql',
  '03-crm-entities.sql'
];

async function executeSQLFile(filename) {
  const filePath = path.join(__dirname, filename);
  const sql = fs.readFileSync(filePath, 'utf8');

  console.log(`\n📄 Executing: ${filename}`);
  console.log(`   File size: ${sql.length} bytes`);

  try {
    // Execute SQL using Supabase RPC or direct query
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql RPC doesn't exist, try direct execution
      console.log('   Trying direct SQL execution...');
      const { data: directData, error: directError } = await supabase
        .from('_temp_')
        .select('*')
        .limit(0);

      // Use PostgREST to execute SQL (requires special configuration)
      throw new Error('Direct SQL execution via Supabase client is not supported. Use Supabase SQL Editor or migration system.');
    }

    console.log(`   ✅ Success!`);
    return data;
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`);
    throw err;
  }
}

async function runSeeds() {
  console.log('🌱 Starting database seeding for multi-tenant testing...');
  console.log(`   Supabase URL: ${supabaseUrl}\n`);

  for (const file of seedFiles) {
    try {
      await executeSQLFile(file);
    } catch (error) {
      console.error(`\n❌ Failed to execute ${file}`);
      console.error(`   Error: ${error.message}`);
      process.exit(1);
    }
  }

  console.log('\n✅ All seed files executed successfully!');
  console.log('\n📊 Verifying data...');

  // Verify organizations
  const { data: orgs, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, slug');

  if (!orgError && orgs) {
    console.log(`   Organizations: ${orgs.length} records`);
    orgs.forEach(org => console.log(`     - ${org.name} (${org.slug})`));
  }

  // Verify organization members
  const { data: members, error: memberError } = await supabase
    .from('organization_members')
    .select('organization_id, user_id, role');

  if (!memberError && members) {
    console.log(`   Organization Members: ${members.length} records`);
  }

  // Verify accounts
  const { data: accounts, error: accountError } = await supabase
    .from('accounts')
    .select('id, name, organization_id');

  if (!accountError && accounts) {
    console.log(`   Accounts: ${accounts.length} records`);
  }

  // Verify contacts
  const { data: contacts, error: contactError } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, organization_id');

  if (!contactError && contacts) {
    console.log(`   Contacts: ${contacts.length} records`);
  }

  console.log('\n✨ Database seeding complete!');
}

runSeeds().catch(console.error);
