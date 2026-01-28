#!/usr/bin/env node

/**
 * Create Playwright Test Users via Supabase Admin API
 *
 * This script creates test users using the Supabase service role key
 * and links them to test organizations.
 *
 * Run with: node scripts/create-test-users.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read credentials from .env.local
const envPath = join(__dirname, '..', '.env.local');
const envContent = await readFile(envPath, 'utf-8');

const getEnvVar = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : null;
};

const SUPABASE_URL = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_ROLE_KEY = getEnvVar('NEXT_SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test users configuration
const TEST_USERS = [
  {
    email: 'test-existing@piercedesk.test',
    password: 'TestPassword123!',
    metadata: { name: 'Test Existing User' }
  },
  {
    email: 'test-single-org@piercedesk.test',
    password: 'TestPassword123!',
    metadata: { name: 'Test Single Org User' }
  },
  {
    email: 'test-multi-org@piercedesk.test',
    password: 'TestPassword123!',
    metadata: { name: 'Test Multi Org User' }
  }
];

// Organization IDs
const ORG_A = '00000000-0000-0000-0000-000000000001';
const ORG_B = '00000000-0000-0000-0000-000000000002';

console.log('🚀 Creating Playwright test users...\n');

// Step 1: Create auth users
const createdUsers = [];

for (const user of TEST_USERS) {
  console.log(`Creating user: ${user.email}`);

  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: user.metadata
  });

  if (error) {
    if (error.message.includes('already registered')) {
      console.log(`  ⚠️  User already exists: ${user.email}`);
      // Get existing user ID
      const { data: existing } = await supabase.auth.admin.listUsers();
      const existingUser = existing?.users?.find(u => u.email === user.email);
      if (existingUser) {
        createdUsers.push({ email: user.email, id: existingUser.id });
        console.log(`  ℹ️  Using existing user ID: ${existingUser.id}`);
      }
    } else {
      console.error(`  ❌ Error creating ${user.email}:`, error.message);
    }
  } else {
    console.log(`  ✅ Created with ID: ${data.user.id}`);
    createdUsers.push({ email: user.email, id: data.user.id });
  }
}

console.log('\n📊 Created users:', createdUsers.length);

// Step 2: Link users to organizations
console.log('\n🔗 Linking users to organizations...\n');

const getUserId = (email) => {
  const user = createdUsers.find(u => u.email === email);
  return user?.id;
};

const memberships = [
  // test-existing@piercedesk.test → Test Org A
  {
    organization_id: ORG_A,
    user_id: getUserId('test-existing@piercedesk.test'),
    role: 'member'
  },
  // test-single-org@piercedesk.test → Test Org A
  {
    organization_id: ORG_A,
    user_id: getUserId('test-single-org@piercedesk.test'),
    role: 'member'
  },
  // test-multi-org@piercedesk.test → Test Org A
  {
    organization_id: ORG_A,
    user_id: getUserId('test-multi-org@piercedesk.test'),
    role: 'member'
  },
  // test-multi-org@piercedesk.test → Test Org B
  {
    organization_id: ORG_B,
    user_id: getUserId('test-multi-org@piercedesk.test'),
    role: 'member'
  }
];

for (const membership of memberships) {
  if (!membership.user_id) {
    console.log('  ⚠️  Skipping membership (no user ID)');
    continue;
  }

  const { error } = await supabase
    .from('organization_members')
    .upsert(membership, {
      onConflict: 'organization_id,user_id',
      ignoreDuplicates: true
    });

  if (error) {
    console.error(`  ❌ Error linking user:`, error.message);
  } else {
    const userEmail = createdUsers.find(u => u.id === membership.user_id)?.email;
    const orgName = membership.organization_id === ORG_A ? 'Test Org A' : 'Test Org B';
    console.log(`  ✅ Linked ${userEmail} → ${orgName}`);
  }
}

// Step 3: Verify memberships
console.log('\n✅ Verifying memberships...\n');

const { data: membershipsData, error: verifyError } = await supabase
  .from('organization_members')
  .select(`
    id,
    role,
    organization:organizations(name, slug),
    user:auth.users(email)
  `)
  .in('user_id', createdUsers.map(u => u.id));

if (verifyError) {
  console.error('❌ Error verifying memberships:', verifyError.message);
} else {
  console.log('📋 Current memberships:');
  membershipsData.forEach(m => {
    console.log(`  • ${m.user?.email} → ${m.organization?.name} (${m.role})`);
  });
}

console.log('\n🎉 Test users setup complete!\n');
console.log('Test credentials:');
TEST_USERS.forEach(u => {
  console.log(`  ${u.email} / ${u.password}`);
});
