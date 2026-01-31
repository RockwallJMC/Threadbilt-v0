#!/usr/bin/env node

/**
 * Verify Admin User Setup
 *
 * Verifies that admin@acme-corp.com is properly configured
 */

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read credentials
let envPath = join(__dirname, '..', '.env.local');
let envContent;
try {
  envContent = await readFile(envPath, 'utf-8');
} catch {
  envPath = join(__dirname, '..', '.env');
  envContent = await readFile(envPath, 'utf-8');
}

const getEnvVar = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : null;
};

const SUPABASE_URL = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_ROLE_KEY = getEnvVar('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔍 Verifying admin@acme-corp.com setup...\n');

// 1. Check auth.users
console.log('1️⃣ Checking auth.users...');
const { data: users } = await supabase.auth.admin.listUsers();
const adminUser = users?.users?.find(u => u.email === 'admin@acme-corp.com');

if (adminUser) {
  console.log('  ✅ Auth user exists');
  console.log(`     User ID: ${adminUser.id}`);
  console.log(`     Email: ${adminUser.email}`);
  console.log(`     Email confirmed: ${adminUser.email_confirmed_at ? 'Yes' : 'No'}`);
  console.log(`     Created: ${new Date(adminUser.created_at).toLocaleString()}`);
} else {
  console.log('  ❌ Auth user not found');
  process.exit(1);
}

// 2. Check user_profiles
console.log('\n2️⃣ Checking user_profiles...');
const { data: profile, error: profileError } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', adminUser.id)
  .single();

if (profile) {
  console.log('  ✅ User profile exists');
  console.log(`     Full name: ${profile.full_name}`);
  console.log(`     Avatar URL: ${profile.avatar_url ? 'Set' : 'Not set'}`);
} else {
  console.log('  ❌ User profile not found');
  console.log(`     Error: ${profileError?.message}`);
}

// 3. Check organization_members
console.log('\n3️⃣ Checking organization_members...');
const { data: memberships, error: membershipError } = await supabase
  .from('organization_members')
  .select(`
    *,
    organization:organizations(name, slug)
  `)
  .eq('user_id', adminUser.id);

if (memberships && memberships.length > 0) {
  console.log(`  ✅ Found ${memberships.length} organization membership(s)`);
  memberships.forEach(m => {
    console.log(`     • ${m.organization.name} (${m.organization.slug})`);
    console.log(`       Role: ${m.role}`);
    console.log(`       Active: ${m.is_active}`);
    console.log(`       Joined: ${new Date(m.joined_at).toLocaleString()}`);
  });
} else {
  console.log('  ❌ No organization memberships found');
  console.log(`     Error: ${membershipError?.message}`);
}

// 4. Test authentication
console.log('\n4️⃣ Testing authentication...');
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: 'admin@acme-corp.com',
  password: 'TestPass123!'
});

if (authData.session) {
  console.log('  ✅ Authentication successful');
  console.log(`     Access token: ${authData.session.access_token.substring(0, 20)}...`);
  console.log(`     User ID: ${authData.session.user.id}`);
  console.log(`     Email: ${authData.session.user.email}`);
} else {
  console.log('  ❌ Authentication failed');
  console.log(`     Error: ${authError?.message}`);
}

// 5. Summary
console.log('\n📋 Summary:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Email:        admin@acme-corp.com`);
console.log(`Password:     TestPass123!`);
console.log(`User ID:      ${adminUser.id}`);
console.log(`Full Name:    ${profile?.full_name || 'N/A'}`);
console.log(`Organization: ${memberships?.[0]?.organization?.name || 'N/A'}`);
console.log(`Role:         ${memberships?.[0]?.role || 'N/A'}`);
console.log(`Status:       ${memberships?.[0]?.is_active ? 'Active' : 'Inactive'}`);
console.log(`Auth:         ${authData?.session ? 'Working ✅' : 'Failed ❌'}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('🎉 Verification complete!\n');
