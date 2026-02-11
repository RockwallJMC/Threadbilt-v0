#!/usr/bin/env node

/**
 * Script to update ACME organization member names from placeholders to realistic names
 * Run with: node scripts/update-acme-members.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ACME_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function main() {
  console.log('🔍 Querying current ACME organization members...\n');

  // Step 1: Get current members
  const { data: members, error: queryError } = await supabase
    .from('organization_members')
    .select(`
      id,
      user_id,
      role,
      user_profiles (
        id,
        full_name,
        email
      )
    `)
    .eq('organization_id', ACME_ORG_ID)
    .order('role');

  if (queryError) {
    console.error('❌ Error querying members:', queryError);
    process.exit(1);
  }

  console.log('📊 Current members:');
  console.table(
    members.map(m => ({
      user_id: m.user_id,
      role: m.role,
      full_name: m.user_profiles?.full_name || '(none)',
      email: m.user_profiles?.email || '(none)'
    }))
  );

  // Step 2: Define name mappings
  const nameMapping = {
    'Alice Admin (Acme)': 'Alice Johnson',
    'Bob Manager (Acme)': 'Bob Martinez',
    'Charlie Member (Acme)': 'Charlie Williams',
    'User test-existing': 'Sarah Chen',
    'User test-single-org': 'Marcus Rivera',
  };

  // Step 3: Update each member with placeholder or missing names
  const updates = [];

  for (const member of members) {
    const profile = member.user_profiles;
    if (!profile) {
      console.log(`⚠️  Skipping member ${member.user_id} - no profile found`);
      continue;
    }

    const currentName = profile.full_name || '';
    let newName = null;

    // Check if name is in our mapping
    if (nameMapping[currentName]) {
      newName = nameMapping[currentName];
    }
    // Check if name looks like an email
    else if (currentName.includes('@')) {
      const emailPrefix = currentName.split('@')[0];
      // Generate a name from email (capitalize first letter)
      const parts = emailPrefix.split(/[._-]/);
      newName = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }
    // Check if name is empty
    else if (!currentName.trim()) {
      newName = 'User ' + profile.email.split('@')[0];
    }

    if (newName) {
      updates.push({
        user_id: profile.id,
        old_name: currentName || '(empty)',
        new_name: newName,
      });
    }
  }

  if (updates.length === 0) {
    console.log('\n✅ No updates needed - all names look good!');
    return;
  }

  console.log('\n📝 Planned updates:');
  console.table(updates);

  // Step 4: Execute updates
  console.log('\n🔄 Executing updates...\n');

  for (const update of updates) {
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ full_name: update.new_name })
      .eq('id', update.user_id);

    if (updateError) {
      console.error(`❌ Error updating ${update.user_id}:`, updateError);
    } else {
      console.log(`✅ Updated: "${update.old_name}" → "${update.new_name}"`);
    }
  }

  // Step 5: Verify updates
  console.log('\n🔍 Verifying updates...\n');

  const { data: verifyMembers, error: verifyError } = await supabase
    .from('organization_members')
    .select(`
      id,
      user_id,
      role,
      user_profiles (
        id,
        full_name,
        email
      )
    `)
    .eq('organization_id', ACME_ORG_ID)
    .order('role');

  if (verifyError) {
    console.error('❌ Error verifying updates:', verifyError);
    process.exit(1);
  }

  console.log('📊 Updated members:');
  console.table(
    verifyMembers.map(m => ({
      user_id: m.user_id,
      role: m.role,
      full_name: m.user_profiles?.full_name || '(none)',
      email: m.user_profiles?.email || '(none)'
    }))
  );

  console.log('\n✅ All updates completed successfully!');
}

main().catch(console.error);
