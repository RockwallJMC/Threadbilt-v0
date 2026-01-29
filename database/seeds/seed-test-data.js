/**
 * Database Seed Runner for Multi-Tenant Testing
 *
 * Uses Supabase MCP tools to execute seed SQL files.
 * Run this after Phase 1.2 auth is complete.
 *
 * Usage:
 *   node database/seeds/seed-test-data.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedFiles = [
  '01-organizations.sql',
  '02-user-profiles.sql',
  '03-crm-entities.sql'
];

async function runSeeds() {
  console.log('🌱 Starting database seeding for multi-tenant testing...\n');

  for (const file of seedFiles) {
    const filePath = path.join(__dirname, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`📄 Executing: ${file}`);
    console.log('   Use Supabase MCP tool: mcp__plugin_supabase_supabase__execute_sql');
    console.log(`   SQL: ${sql.substring(0, 100)}...\n`);

    // Note: This script provides SQL for manual execution via Supabase MCP tools
    // Agent should use: mcp__plugin_supabase_supabase__execute_sql(project_id, query)
  }

  console.log('✅ Seed script generation complete.');
  console.log('⚠️  Execute SQL via Supabase MCP tools with project_id from .env');
}

runSeeds();
