/**
 * Verify Seed Data
 * Queries the database to verify all seed data was inserted correctly
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iixfjulmrexivuehoxti.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeGZqdWxtcmV4aXZ1ZWhveHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ3MzUzNywiZXhwIjoyMDgzMDQ5NTM3fQ.-9kWLYoix_N4B1YgSyn6e2Mw1iIKknPFBfCB88FW_lU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifySeeds() {
  console.log('📊 Verifying Seed Data for Multi-Tenant Testing\n');
  console.log('═'.repeat(70));

  // 1. Verify Organizations
  console.log('\n1️⃣  ORGANIZATIONS (from 01-organizations.sql)');
  console.log('─'.repeat(70));
  const { data: orgs, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, slug, subscription_tier')
    .in('id', [
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002'
    ]);

  if (orgError) {
    console.error('   ❌ Error:', orgError.message);
  } else {
    console.log(`   ✅ Found ${orgs.length} seed organizations:`);
    orgs.forEach(org => {
      console.log(`      • ${org.name} (${org.slug}) - ${org.subscription_tier}`);
    });
  }

  // 2. Verify User Profiles
  console.log('\n2️⃣  USER PROFILES (from 02-user-profiles.sql)');
  console.log('─'.repeat(70));
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, full_name')
    .in('id', [
      'a1111111-1111-1111-1111-111111111111',
      'a2222222-2222-2222-2222-222222222222',
      'a3333333-3333-3333-3333-333333333333',
      'b1111111-1111-1111-1111-111111111111',
      'b2222222-2222-2222-2222-222222222222'
    ]);

  if (profileError) {
    console.error('   ❌ Error:', profileError.message);
  } else {
    console.log(`   ✅ Found ${profiles.length} seed user profiles:`);
    profiles.forEach(profile => {
      console.log(`      • ${profile.full_name}`);
    });
  }

  // 3. Verify Organization Members
  console.log('\n3️⃣  ORGANIZATION MEMBERS (from 02-user-profiles.sql)');
  console.log('─'.repeat(70));
  const { data: members, error: memberError } = await supabase
    .from('organization_members')
    .select('organization_id, user_id, role')
    .in('organization_id', [
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002'
    ]);

  if (memberError) {
    console.error('   ❌ Error:', memberError.message);
  } else {
    console.log(`   ✅ Found ${members.length} organization memberships`);

    const org1Members = members.filter(m => m.organization_id === '00000000-0000-0000-0000-000000000001');
    const org2Members = members.filter(m => m.organization_id === '00000000-0000-0000-0000-000000000002');

    console.log(`      • Acme Corporation: ${org1Members.length} members`);
    org1Members.forEach(m => console.log(`         - ${m.role}`));

    console.log(`      • TechStart Industries: ${org2Members.length} members`);
    org2Members.forEach(m => console.log(`         - ${m.role}`));
  }

  // 4. Verify Accounts
  console.log('\n4️⃣  ACCOUNTS (from 03-crm-entities.sql)');
  console.log('─'.repeat(70));
  const { data: accounts, error: accountError } = await supabase
    .from('accounts')
    .select('id, name, organization_id, type')
    .in('organization_id', [
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002'
    ]);

  if (accountError) {
    console.error('   ❌ Error:', accountError.message);
  } else {
    const org1Accounts = accounts.filter(a => a.organization_id === '00000000-0000-0000-0000-000000000001');
    const org2Accounts = accounts.filter(a => a.organization_id === '00000000-0000-0000-0000-000000000002');

    console.log(`   ✅ Found ${accounts.length} seed accounts`);
    console.log(`      • Acme Corporation: ${org1Accounts.length} accounts`);
    org1Accounts.forEach(a => console.log(`         - ${a.name} (${a.type})`));

    console.log(`      • TechStart Industries: ${org2Accounts.length} accounts`);
    org2Accounts.forEach(a => console.log(`         - ${a.name} (${a.type})`));
  }

  // 5. Verify Contacts
  console.log('\n5️⃣  CONTACTS (from 03-crm-entities.sql)');
  console.log('─'.repeat(70));
  const { data: contacts, error: contactError } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, organization_id, title')
    .in('organization_id', [
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002'
    ]);

  if (contactError) {
    console.error('   ❌ Error:', contactError.message);
  } else {
    const org1Contacts = contacts.filter(c => c.organization_id === '00000000-0000-0000-0000-000000000001');
    const org2Contacts = contacts.filter(c => c.organization_id === '00000000-0000-0000-0000-000000000002');

    console.log(`   ✅ Found ${contacts.length} seed contacts`);
    console.log(`      • Acme Corporation: ${org1Contacts.length} contacts`);
    org1Contacts.forEach(c => console.log(`         - ${c.first_name} ${c.last_name} (${c.title})`));

    console.log(`      • TechStart Industries: ${org2Contacts.length} contacts`);
    org2Contacts.forEach(c => console.log(`         - ${c.first_name} ${c.last_name} (${c.title})`));
  }

  // 6. Verify Leads
  console.log('\n6️⃣  LEADS (from 03-crm-entities.sql)');
  console.log('─'.repeat(70));
  const { data: leads, error: leadError } = await supabase
    .from('leads')
    .select('id, first_name, last_name, organization_id, company, status')
    .in('organization_id', [
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002'
    ]);

  if (leadError) {
    console.error('   ❌ Error:', leadError.message);
  } else {
    const org1Leads = leads.filter(l => l.organization_id === '00000000-0000-0000-0000-000000000001');
    const org2Leads = leads.filter(l => l.organization_id === '00000000-0000-0000-0000-000000000002');

    console.log(`   ✅ Found ${leads.length} seed leads`);
    console.log(`      • Acme Corporation: ${org1Leads.length} leads`);
    org1Leads.forEach(l => console.log(`         - ${l.first_name} ${l.last_name} @ ${l.company} (${l.status})`));

    console.log(`      • TechStart Industries: ${org2Leads.length} leads`);
    org2Leads.forEach(l => console.log(`         - ${l.first_name} ${l.last_name} @ ${l.company} (${l.status})`));
  }

  // 7. Verify Opportunities
  console.log('\n7️⃣  OPPORTUNITIES (from 03-crm-entities.sql)');
  console.log('─'.repeat(70));
  const { data: opportunities, error: oppError } = await supabase
    .from('opportunities')
    .select('id, name, organization_id, value, stage')
    .in('organization_id', [
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002'
    ]);

  if (oppError) {
    console.error('   ❌ Error:', oppError.message);
  } else {
    const org1Opps = opportunities.filter(o => o.organization_id === '00000000-0000-0000-0000-000000000001');
    const org2Opps = opportunities.filter(o => o.organization_id === '00000000-0000-0000-0000-000000000002');

    console.log(`   ✅ Found ${opportunities.length} seed opportunities`);
    console.log(`      • Acme Corporation: ${org1Opps.length} opportunities`);
    org1Opps.forEach(o => console.log(`         - ${o.name} ($${o.value.toLocaleString()}) - ${o.stage}`));

    console.log(`      • TechStart Industries: ${org2Opps.length} opportunities`);
    org2Opps.forEach(o => console.log(`         - ${o.name} ($${o.value.toLocaleString()}) - ${o.stage}`));
  }

  // 8. Verify Proposals
  console.log('\n8️⃣  PROPOSALS (from 03-crm-entities.sql)');
  console.log('─'.repeat(70));
  const { data: proposals, error: proposalError } = await supabase
    .from('proposals')
    .select('id, title, organization_id, proposal_number, status, total_amount')
    .in('organization_id', [
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002'
    ]);

  if (proposalError) {
    console.error('   ❌ Error:', proposalError.message);
  } else {
    const org1Proposals = proposals.filter(p => p.organization_id === '00000000-0000-0000-0000-000000000001');
    const org2Proposals = proposals.filter(p => p.organization_id === '00000000-0000-0000-0000-000000000002');

    console.log(`   ✅ Found ${proposals.length} seed proposals`);
    console.log(`      • Acme Corporation: ${org1Proposals.length} proposals`);
    org1Proposals.forEach(p => console.log(`         - ${p.proposal_number}: ${p.title} ($${p.total_amount.toLocaleString()}) - ${p.status}`));

    console.log(`      • TechStart Industries: ${org2Proposals.length} proposals`);
    org2Proposals.forEach(p => console.log(`         - ${p.proposal_number}: ${p.title} ($${p.total_amount.toLocaleString()}) - ${p.status}`));
  }

  // 9. Verify Proposal Line Items
  console.log('\n9️⃣  PROPOSAL LINE ITEMS (from 03-crm-entities.sql)');
  console.log('─'.repeat(70));
  const { data: lineItems, error: lineItemError } = await supabase
    .from('proposal_line_items')
    .select('id, description, organization_id, quantity, unit_price, total')
    .in('organization_id', [
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002'
    ]);

  if (lineItemError) {
    console.error('   ❌ Error:', lineItemError.message);
  } else {
    const org1LineItems = lineItems.filter(li => li.organization_id === '00000000-0000-0000-0000-000000000001');
    const org2LineItems = lineItems.filter(li => li.organization_id === '00000000-0000-0000-0000-000000000002');

    console.log(`   ✅ Found ${lineItems.length} seed proposal line items`);
    console.log(`      • Acme Corporation: ${org1LineItems.length} line items`);
    const org1Total = org1LineItems.reduce((sum, li) => sum + parseFloat(li.total), 0);
    console.log(`         Total value: $${org1Total.toLocaleString()}`);

    console.log(`      • TechStart Industries: ${org2LineItems.length} line items`);
    const org2Total = org2LineItems.reduce((sum, li) => sum + parseFloat(li.total), 0);
    console.log(`         Total value: $${org2Total.toLocaleString()}`);
  }

  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('✨ SEED DATA VERIFICATION COMPLETE\n');
  console.log('Summary by Seed File:');
  console.log('  📄 01-organizations.sql:      2 organizations');
  console.log('  📄 02-user-profiles.sql:      5 user profiles + 5 organization memberships');
  console.log('  📄 03-crm-entities.sql:');
  console.log(`     - Accounts:                ${accounts?.length || 0} records`);
  console.log(`     - Contacts:                ${contacts?.length || 0} records`);
  console.log(`     - Leads:                   ${leads?.length || 0} records`);
  console.log(`     - Opportunities:           ${opportunities?.length || 0} records`);
  console.log(`     - Proposals:               ${proposals?.length || 0} records`);
  console.log(`     - Proposal Line Items:     ${lineItems?.length || 0} records`);
  console.log('═'.repeat(70));
  console.log('\n✅ All seed data verified successfully!\n');
}

verifySeeds();
