#!/usr/bin/env node

/**
 * Create Admin User for Acme Corporation
 *
 * Email: admin@acme-corp.com
 * Password: TestPass123!
 * Organization: Acme Corporation
 * Role: Admin
 *
 * Run with: node scripts/create-admin-user.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read credentials from .env or .env.local
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

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env or .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Admin user configuration
const ADMIN_USER = {
  email: 'admin@acme-corp.com',
  password: 'TestPass123!',
  metadata: {
    full_name: 'Admin User',
    name: 'Admin User'
  }
};

// Acme Corporation organization ID
const ACME_ORG_ID = '00000000-0000-0000-0000-000000000001';

console.log('🚀 Creating admin user for Acme Corporation...\n');

// Step 1: Create auth user
console.log(`Creating user: ${ADMIN_USER.email}`);

const { data, error } = await supabase.auth.admin.createUser({
  email: ADMIN_USER.email,
  password: ADMIN_USER.password,
  email_confirm: true,
  user_metadata: ADMIN_USER.metadata
});

let userId;

if (error) {
  if (error.message.includes('already registered')) {
    console.log(`  ⚠️  User already exists: ${ADMIN_USER.email}`);
    // Get existing user ID
    const { data: existing } = await supabase.auth.admin.listUsers();
    const existingUser = existing?.users?.find(u => u.email === ADMIN_USER.email);
    if (existingUser) {
      userId = existingUser.id;
      console.log(`  ℹ️  Using existing user ID: ${userId}`);
    } else {
      console.error('  ❌ Could not find existing user');
      process.exit(1);
    }
  } else {
    console.error(`  ❌ Error creating ${ADMIN_USER.email}:`, error.message);
    process.exit(1);
  }
} else {
  userId = data.user.id;
  console.log(`  ✅ Created with ID: ${userId}`);
}

// Step 2: Update user profile
console.log('\n📝 Updating user profile...');

const { error: profileError } = await supabase
  .from('user_profiles')
  .upsert({
    id: userId,
    full_name: 'Admin User',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminUser',
    updated_at: new Date().toISOString()
  }, {
    onConflict: 'id'
  });

if (profileError) {
  console.error('  ❌ Error updating profile:', profileError.message);
} else {
  console.log('  ✅ Profile updated');
}

// Step 3: Link to Acme Corporation with admin role
console.log('\n🔗 Linking to Acme Corporation as admin...');

const { error: membershipError } = await supabase
  .from('organization_members')
  .upsert({
    organization_id: ACME_ORG_ID,
    user_id: userId,
    role: 'admin',
    is_active: true,
    joined_at: new Date().toISOString()
  }, {
    onConflict: 'organization_id,user_id'
  });

if (membershipError) {
  console.error('  ❌ Error creating membership:', membershipError.message);
} else {
  console.log('  ✅ Linked as admin');
}

// Step 4: Verify the setup
console.log('\n✅ Verifying user setup...\n');

const { data: verification, error: verifyError } = await supabase
  .from('organization_members')
  .select(`
    id,
    role,
    is_active,
    organization:organizations(name, slug),
    user_profile:user_profiles(full_name, id)
  `)
  .eq('user_id', userId)
  .single();

if (verifyError) {
  console.error('❌ Error verifying setup:', verifyError.message);
} else {
  console.log('📋 User Details:');
  console.log(`  Email: ${ADMIN_USER.email}`);
  console.log(`  User ID: ${userId}`);
  console.log(`  Full Name: ${verification.user_profile?.full_name}`);
  console.log(`  Organization: ${verification.organization?.name} (${verification.organization?.slug})`);
  console.log(`  Role: ${verification.role}`);
  console.log(`  Active: ${verification.is_active}`);
}

// Step 5: Test authentication
console.log('\n🔐 Testing authentication...');

const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: ADMIN_USER.email,
  password: ADMIN_USER.password
});

if (authError) {
  console.error('  ❌ Authentication failed:', authError.message);
} else {
  console.log('  ✅ Authentication successful');
  console.log(`  Access token exists: ${!!authData.session?.access_token}`);
  console.log(`  Session user ID: ${authData.session?.user?.id}`);
}

console.log('\n🎉 Admin user setup complete!\n');
console.log('Login credentials:');
console.log(`  Email: ${ADMIN_USER.email}`);
console.log(`  Password: ${ADMIN_USER.password}`);
console.log(`  Organization: Acme Corporation (acme-corp)`);
console.log(`  Role: admin\n`);
