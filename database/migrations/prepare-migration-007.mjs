/**
 * Prepare Migration 007 for Manual Execution
 * Displays the SQL content for easy copy-paste to Supabase Dashboard
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATION_FILE = '007_project_dashboard_tables.sql';
const SEED_FILE = '../seeds/07-project-dashboard-data.sql';

function printSQLFile(filename, title) {
  const filePath = path.join(__dirname, filename);
  const sql = fs.readFileSync(filePath, 'utf8');

  console.log('\n' + '='.repeat(80));
  console.log(`📄 ${title}`);
  console.log('='.repeat(80));
  console.log('\n' + sql);
  console.log('\n' + '='.repeat(80));
  console.log(`END OF ${title}`);
  console.log('='.repeat(80) + '\n');
}

function main() {
  console.log('\n🚀 Migration 007: Project Dashboard Tables');
  console.log('   Preparation for manual execution\n');

  console.log('📋 INSTRUCTIONS:');
  console.log('-'.repeat(80));
  console.log('1. Open Supabase SQL Editor: https://app.supabase.com/project/iixfjulmrexivuehoxti/sql');
  console.log('2. Copy the SQL from STEP 1 below');
  console.log('3. Paste into SQL Editor and click "Run"');
  console.log('4. Copy the SQL from STEP 2 below');
  console.log('5. Paste into SQL Editor and click "Run"');
  console.log('6. Run verification: node database/migrations/verify-migration-007.mjs\n');

  printSQLFile(MIGRATION_FILE, 'STEP 1: MIGRATION SQL (Create Tables & RLS)');
  printSQLFile(SEED_FILE, 'STEP 2: SEED DATA SQL (Sample Data)');

  console.log('✅ SQL files displayed above');
  console.log('   Copy each section and execute in Supabase SQL Editor\n');
}

main();
