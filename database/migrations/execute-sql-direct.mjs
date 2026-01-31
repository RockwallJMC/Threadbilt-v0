/**
 * Execute SQL migration using Supabase Management API
 * This uses the service role key to execute raw SQL
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://iixfjulmrexivuehoxti.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeGZqdWxtcmV4aXZ1ZWhveHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ3MzUzNywiZXhwIjoyMDgzMDQ5NTM3fQ.-9kWLYoix_N4B1YgSyn6e2Mw1iIKknPFBfCB88FW_lU';

async function executeSQLStatements() {
  console.log('🔄 Executing migration 003 via SQL statements...\n');

  // Read migration file
  const migrationPath = path.join(__dirname, '003_add_contact_form_fields.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  // Parse SQL into individual statements
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--') && s !== '' && !s.match(/^\s*$/));

  console.log(`Parsed ${statements.length} SQL statements\n`);

  // Execute each statement using fetch to Supabase database
  const projectRef = 'iixfjulmrexivuehoxti';
  let successCount = 0;
  let errors = [];

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    console.log(`[${i + 1}/${statements.length}] ${stmt.substring(0, 60)}...`);

    try {
      // Try using PostgREST stored procedure approach
      // We'll need to create a helper function first
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ sql: stmt + ';' })
      });

      if (response.ok) {
        console.log(`   ✅ Success`);
        successCount++;
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Error: ${errorText.substring(0, 100)}`);
        errors.push({ statement: i + 1, error: errorText });
      }
    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`);
      errors.push({ statement: i + 1, error: error.message });
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Success: ${successCount}/${statements.length}`);
  console.log(`   Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log(`\n❌ Execution had errors. This is expected if exec_sql function doesn't exist.`);
    console.log(`   We'll try an alternative approach...\n`);
    return false;
  }

  return true;
}

// Alternative: Execute using Supabase client with schema changes
async function executeViaSchemaChanges() {
  console.log('🔄 Attempting alternative execution method...\n');

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // We can't directly execute DDL via the Supabase client
  // But we can try to use the underlying connection
  console.log('ℹ️  Direct DDL execution not available via Supabase JS client\n');
  console.log('Recommendation: Use Supabase Dashboard SQL Editor or psql\n');

  return false;
}

async function main() {
  const success = await executeSQLStatements();

  if (!success) {
    await executeViaSchemaChanges();
  }
}

main();
