/**
 * Database Seed Executor using Supabase Client
 * Executes seed data by parsing SQL and using Supabase client methods
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = 'https://iixfjulmrexivuehoxti.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeGZqdWxtcmV4aXZ1ZWhveHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ3MzUzNywiZXhwIjoyMDgzMDQ5NTM3fQ.-9kWLYoix_N4B1YgSyn6e2Mw1iIKknPFBfCB88FW_lU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seed01Organizations() {
  console.log('\n📄 Seeding: 01-organizations.sql');

  const organizations = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Acme Corporation',
      slug: 'acme-corp',
      subscription_tier: 'professional',
      subscription_status: 'active',
      is_active: true
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'TechStart Industries',
      slug: 'techstart',
      subscription_tier: 'basic',
      subscription_status: 'active',
      is_active: true
    }
  ];

  for (const org of organizations) {
    const { data, error } = await supabase
      .from('organizations')
      .upsert(org, { onConflict: 'id' })
      .select();

    if (error) {
      console.error(`   ❌ Error inserting ${org.name}:`, error.message);
      throw error;
    }
    console.log(`   ✅ Inserted/Updated: ${org.name}`);
  }

  return organizations.length;
}

async function seed02UserProfiles() {
  console.log('\n📄 Seeding: 02-user-profiles.sql');

  // Update user profiles
  const profiles = [
    {
      id: 'a1111111-1111-1111-1111-111111111111',
      full_name: 'Alice Admin (Acme)',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AliceAdmin'
    },
    {
      id: 'a2222222-2222-2222-2222-222222222222',
      full_name: 'Bob Manager (Acme)',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BobManager'
    },
    {
      id: 'a3333333-3333-3333-3333-333333333333',
      full_name: 'Charlie Member (Acme)',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CharlieMember'
    },
    {
      id: 'b1111111-1111-1111-1111-111111111111',
      full_name: 'Frank CEO (TechStart)',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FrankCEO'
    },
    {
      id: 'b2222222-2222-2222-2222-222222222222',
      full_name: 'Grace Rep (TechStart)',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GraceRep'
    }
  ];

  let profileCount = 0;
  for (const profile of profiles) {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        full_name: profile.full_name,
        avatar_url: profile.avatar_url
      })
      .eq('id', profile.id);

    if (error) {
      console.log(`   ⚠️  Skipping profile ${profile.full_name}: ${error.message}`);
    } else {
      console.log(`   ✅ Updated: ${profile.full_name}`);
      profileCount++;
    }
  }

  // Insert organization members
  const members = [
    {
      organization_id: '00000000-0000-0000-0000-000000000001',
      user_id: 'a1111111-1111-1111-1111-111111111111',
      role: 'admin',
      is_active: true
    },
    {
      organization_id: '00000000-0000-0000-0000-000000000001',
      user_id: 'a2222222-2222-2222-2222-222222222222',
      role: 'manager',
      is_active: true
    },
    {
      organization_id: '00000000-0000-0000-0000-000000000001',
      user_id: 'a3333333-3333-3333-3333-333333333333',
      role: 'member',
      is_active: true
    },
    {
      organization_id: '00000000-0000-0000-0000-000000000002',
      user_id: 'b1111111-1111-1111-1111-111111111111',
      role: 'admin',
      is_active: true
    },
    {
      organization_id: '00000000-0000-0000-0000-000000000002',
      user_id: 'b2222222-2222-2222-2222-222222222222',
      role: 'member',
      is_active: true
    }
  ];

  let memberCount = 0;
  for (const member of members) {
    const { error } = await supabase
      .from('organization_members')
      .upsert(member, { onConflict: 'organization_id,user_id' });

    if (error) {
      console.log(`   ⚠️  Skipping member: ${error.message}`);
    } else {
      console.log(`   ✅ Inserted/Updated: organization member (${member.role})`);
      memberCount++;
    }
  }

  return profileCount + memberCount;
}

async function seed03CRMEntities() {
  console.log('\n📄 Seeding: 03-crm-entities.sql');

  let totalInserted = 0;

  // Accounts
  const accounts = [
    {
      id: '30000000-0000-0000-0000-000000000001',
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: 'Global Bank Corp',
      type: 'customer',
      status: 'active',
      industry: 'Finance',
      phone: '555-0101',
      email: 'contact@globalbank.com',
      website: 'https://globalbank.com',
      owner_id: 'a2222222-2222-2222-2222-222222222222',
      annual_revenue: 50000000,
      employees: 500,
      created_by: 'a1111111-1111-1111-1111-111111111111'
    },
    {
      id: '30000000-0000-0000-0000-000000000002',
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: 'MegaRetail Inc',
      type: 'prospect',
      status: 'active',
      industry: 'Retail',
      phone: '555-0102',
      email: 'hello@megaretail.com',
      website: 'https://megaretail.com',
      owner_id: 'a2222222-2222-2222-2222-222222222222',
      annual_revenue: 30000000,
      employees: 300,
      created_by: 'a1111111-1111-1111-1111-111111111111'
    },
    {
      id: '30000000-0000-0000-0000-000000000003',
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: 'TechVentures LLC',
      type: 'customer',
      status: 'active',
      industry: 'Technology',
      phone: '555-0103',
      email: 'info@techventures.com',
      website: 'https://techventures.com',
      owner_id: 'a3333333-3333-3333-3333-333333333333',
      annual_revenue: 15000000,
      employees: 150,
      created_by: 'a2222222-2222-2222-2222-222222222222'
    },
    {
      id: '40000000-0000-0000-0000-000000000001',
      organization_id: '00000000-0000-0000-0000-000000000002',
      name: 'SecureBuildings Co',
      type: 'customer',
      status: 'active',
      industry: 'Real Estate',
      phone: '555-1101',
      email: 'contact@securebuildings.com',
      website: 'https://securebuildings.com',
      owner_id: 'b2222222-2222-2222-2222-222222222222',
      annual_revenue: 25000000,
      employees: 200,
      created_by: 'b1111111-1111-1111-1111-111111111111'
    },
    {
      id: '40000000-0000-0000-0000-000000000002',
      organization_id: '00000000-0000-0000-0000-000000000002',
      name: 'HealthCare Systems',
      type: 'prospect',
      status: 'active',
      industry: 'Healthcare',
      phone: '555-1102',
      email: 'info@healthcaresys.com',
      website: 'https://healthcaresys.com',
      owner_id: 'b2222222-2222-2222-2222-222222222222',
      annual_revenue: 40000000,
      employees: 350,
      created_by: 'b1111111-1111-1111-1111-111111111111'
    }
  ];

  for (const account of accounts) {
    const { error } = await supabase
      .from('accounts')
      .upsert(account, { onConflict: 'id' });

    if (error) {
      console.log(`   ⚠️  Error with ${account.name}: ${error.message}`);
    } else {
      console.log(`   ✅ Account: ${account.name}`);
      totalInserted++;
    }
  }

  console.log(`   Inserted ${totalInserted} accounts`);

  return totalInserted;
}

async function runSeeds() {
  console.log('🌱 Starting database seeding for multi-tenant testing...');
  console.log(`   Supabase URL: ${supabaseUrl}\n`);

  try {
    const count1 = await seed01Organizations();
    console.log(`   ✅ Organizations: ${count1} records`);

    const count2 = await seed02UserProfiles();
    console.log(`   ✅ User Profiles & Members: ${count2} records`);

    const count3 = await seed03CRMEntities();
    console.log(`   ✅ CRM Entities: ${count3} records`);

    console.log('\n📊 Verifying data in database...\n');

    // Verify
    const { data: orgs } = await supabase.from('organizations').select('id, name, slug');
    console.log(`   Organizations: ${orgs?.length || 0} records`);
    orgs?.forEach(org => console.log(`     - ${org.name} (${org.slug})`));

    const { data: members } = await supabase.from('organization_members').select('*');
    console.log(`\n   Organization Members: ${members?.length || 0} records`);

    const { data: accounts } = await supabase.from('accounts').select('id, name');
    console.log(`\n   Accounts: ${accounts?.length || 0} records`);
    accounts?.forEach(acc => console.log(`     - ${acc.name}`));

    console.log('\n✨ Database seeding complete!\n');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

runSeeds();
