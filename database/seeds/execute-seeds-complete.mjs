/**
 * Complete Database Seed Executor
 * Executes all seed data including accounts, contacts, leads, opportunities, proposals
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

async function seedContacts() {
  console.log('   Seeding contacts...');

  const contacts = [
    // Org 1 contacts
    {
      id: '31000000-0000-0000-0000-000000000001',
      organization_id: '00000000-0000-0000-0000-000000000001',
      account_id: '30000000-0000-0000-0000-000000000001',
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@globalbank.com',
      phone: '555-0101',
      mobile: '555-0201',
      title: 'VP of Security',
      department: 'Operations',
      is_primary: true,
      created_by: 'a2222222-2222-2222-2222-222222222222'
    },
    {
      id: '31000000-0000-0000-0000-000000000002',
      organization_id: '00000000-0000-0000-0000-000000000001',
      account_id: '30000000-0000-0000-0000-000000000001',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@globalbank.com',
      phone: '555-0102',
      mobile: '555-0202',
      title: 'IT Manager',
      department: 'IT',
      is_primary: false,
      created_by: 'a2222222-2222-2222-2222-222222222222'
    },
    {
      id: '31000000-0000-0000-0000-000000000003',
      organization_id: '00000000-0000-0000-0000-000000000001',
      account_id: '30000000-0000-0000-0000-000000000002',
      first_name: 'Mike',
      last_name: 'Williams',
      email: 'mike.williams@megaretail.com',
      phone: '555-0103',
      mobile: '555-0203',
      title: 'Director of Facilities',
      department: 'Operations',
      is_primary: true,
      created_by: 'a2222222-2222-2222-2222-222222222222'
    },
    {
      id: '31000000-0000-0000-0000-000000000004',
      organization_id: '00000000-0000-0000-0000-000000000001',
      account_id: '30000000-0000-0000-0000-000000000003',
      first_name: 'Emily',
      last_name: 'Davis',
      email: 'emily.davis@techventures.com',
      phone: '555-0104',
      mobile: '555-0204',
      title: 'CTO',
      department: 'Technology',
      is_primary: true,
      created_by: 'a3333333-3333-3333-3333-333333333333'
    },
    // Org 2 contacts
    {
      id: '41000000-0000-0000-0000-000000000001',
      organization_id: '00000000-0000-0000-0000-000000000002',
      account_id: '40000000-0000-0000-0000-000000000001',
      first_name: 'Patricia',
      last_name: 'Garcia',
      email: 'patricia.garcia@securebuildings.com',
      phone: '555-1101',
      mobile: '555-1201',
      title: 'Director of Security',
      department: 'Operations',
      is_primary: true,
      created_by: 'b2222222-2222-2222-2222-222222222222'
    },
    {
      id: '41000000-0000-0000-0000-000000000002',
      organization_id: '00000000-0000-0000-0000-000000000002',
      account_id: '40000000-0000-0000-0000-000000000002',
      first_name: 'James',
      last_name: 'Rodriguez',
      email: 'james.rodriguez@healthcaresys.com',
      phone: '555-1102',
      mobile: '555-1202',
      title: 'Facilities Manager',
      department: 'Facilities',
      is_primary: true,
      created_by: 'b2222222-2222-2222-2222-222222222222'
    }
  ];

  let count = 0;
  for (const contact of contacts) {
    const { error } = await supabase
      .from('contacts')
      .upsert(contact, { onConflict: 'id' });

    if (error) {
      console.log(`     ⚠️  Error with ${contact.first_name} ${contact.last_name}: ${error.message}`);
    } else {
      count++;
    }
  }
  console.log(`     ✅ Contacts: ${count} records`);
  return count;
}

async function seedLeads() {
  console.log('   Seeding leads...');

  const leads = [
    // Org 1 leads
    {
      id: '32000000-0000-0000-0000-000000000001',
      organization_id: '00000000-0000-0000-0000-000000000001',
      first_name: 'Robert',
      last_name: 'Brown',
      email: 'robert.brown@newco.com',
      phone: '555-0301',
      company: 'NewCo Industries',
      title: 'Security Manager',
      source: 'Website',
      status: 'new',
      lead_score: 75,
      assigned_to: 'a2222222-2222-2222-2222-222222222222',
      created_by: 'a1111111-1111-1111-1111-111111111111'
    },
    {
      id: '32000000-0000-0000-0000-000000000002',
      organization_id: '00000000-0000-0000-0000-000000000001',
      first_name: 'Lisa',
      last_name: 'Martinez',
      email: 'lisa.martinez@startup.io',
      phone: '555-0302',
      company: 'Startup.io',
      title: 'Founder',
      source: 'Referral',
      status: 'contacted',
      lead_score: 85,
      assigned_to: 'a2222222-2222-2222-2222-222222222222',
      created_by: 'a1111111-1111-1111-1111-111111111111'
    },
    {
      id: '32000000-0000-0000-0000-000000000003',
      organization_id: '00000000-0000-0000-0000-000000000001',
      first_name: 'Tom',
      last_name: 'Wilson',
      email: 'tom.wilson@enterprise.com',
      phone: '555-0303',
      company: 'Enterprise Solutions',
      title: 'VP Operations',
      source: 'Trade Show',
      status: 'qualified',
      lead_score: 90,
      assigned_to: 'a3333333-3333-3333-3333-333333333333',
      created_by: 'a2222222-2222-2222-2222-222222222222'
    },
    // Org 2 leads
    {
      id: '42000000-0000-0000-0000-000000000001',
      organization_id: '00000000-0000-0000-0000-000000000002',
      first_name: 'Jennifer',
      last_name: 'Lee',
      email: 'jennifer.lee@innovate.com',
      phone: '555-1301',
      company: 'Innovate Corp',
      title: 'COO',
      source: 'LinkedIn',
      status: 'new',
      lead_score: 70,
      assigned_to: 'b2222222-2222-2222-2222-222222222222',
      created_by: 'b1111111-1111-1111-1111-111111111111'
    },
    {
      id: '42000000-0000-0000-0000-000000000002',
      organization_id: '00000000-0000-0000-0000-000000000002',
      first_name: 'David',
      last_name: 'Chen',
      email: 'david.chen@growth.io',
      phone: '555-1302',
      company: 'Growth.io',
      title: 'VP Security',
      source: 'Email Campaign',
      status: 'contacted',
      lead_score: 80,
      assigned_to: 'b2222222-2222-2222-2222-222222222222',
      created_by: 'b1111111-1111-1111-1111-111111111111'
    }
  ];

  let count = 0;
  for (const lead of leads) {
    const { error } = await supabase
      .from('leads')
      .upsert(lead, { onConflict: 'id' });

    if (error) {
      console.log(`     ⚠️  Error with ${lead.first_name} ${lead.last_name}: ${error.message}`);
    } else {
      count++;
    }
  }
  console.log(`     ✅ Leads: ${count} records`);
  return count;
}

async function seedOpportunities() {
  console.log('   Seeding opportunities...');

  const opportunities = [
    // Org 1 opportunities
    {
      id: '33000000-0000-0000-0000-000000000001',
      organization_id: '00000000-0000-0000-0000-000000000001',
      account_id: '30000000-0000-0000-0000-000000000001',
      primary_contact_id: '31000000-0000-0000-0000-000000000001',
      name: 'Global Bank HQ Security Upgrade',
      description: 'Complete security system overhaul for headquarters building',
      value: 250000.00,
      currency: 'USD',
      probability: 75,
      stage: 'Proposal',
      expected_close_date: '2026-03-15',
      owner_id: 'a2222222-2222-2222-2222-222222222222',
      created_by: 'a2222222-2222-2222-2222-222222222222'
    },
    {
      id: '33000000-0000-0000-0000-000000000002',
      organization_id: '00000000-0000-0000-0000-000000000001',
      account_id: '30000000-0000-0000-0000-000000000002',
      primary_contact_id: '31000000-0000-0000-0000-000000000003',
      name: 'MegaRetail Store Expansion',
      description: 'Security systems for 5 new retail locations',
      value: 180000.00,
      currency: 'USD',
      probability: 60,
      stage: 'Qualification',
      expected_close_date: '2026-04-20',
      owner_id: 'a2222222-2222-2222-2222-222222222222',
      created_by: 'a2222222-2222-2222-2222-222222222222'
    },
    {
      id: '33000000-0000-0000-0000-000000000003',
      organization_id: '00000000-0000-0000-0000-000000000001',
      account_id: '30000000-0000-0000-0000-000000000003',
      primary_contact_id: '31000000-0000-0000-0000-000000000004',
      name: 'TechVentures Data Center',
      description: 'Physical security for new data center facility',
      value: 320000.00,
      currency: 'USD',
      probability: 85,
      stage: 'Negotiation',
      expected_close_date: '2026-02-28',
      owner_id: 'a3333333-3333-3333-3333-333333333333',
      created_by: 'a3333333-3333-3333-3333-333333333333'
    },
    // Org 2 opportunities
    {
      id: '43000000-0000-0000-0000-000000000001',
      organization_id: '00000000-0000-0000-0000-000000000002',
      account_id: '40000000-0000-0000-0000-000000000001',
      primary_contact_id: '41000000-0000-0000-0000-000000000001',
      name: 'SecureBuildings Office Tower',
      description: 'Security system for new 20-story office building',
      value: 450000.00,
      currency: 'USD',
      probability: 90,
      stage: 'Negotiation',
      expected_close_date: '2026-03-01',
      owner_id: 'b2222222-2222-2222-2222-222222222222',
      created_by: 'b2222222-2222-2222-2222-222222222222'
    },
    {
      id: '43000000-0000-0000-0000-000000000002',
      organization_id: '00000000-0000-0000-0000-000000000002',
      account_id: '40000000-0000-0000-0000-000000000002',
      primary_contact_id: '41000000-0000-0000-0000-000000000002',
      name: 'HealthCare Campus Security',
      description: 'Multi-building healthcare campus security',
      value: 600000.00,
      currency: 'USD',
      probability: 65,
      stage: 'Proposal',
      expected_close_date: '2026-05-15',
      owner_id: 'b2222222-2222-2222-2222-222222222222',
      created_by: 'b1111111-1111-1111-1111-111111111111'
    }
  ];

  let count = 0;
  for (const opp of opportunities) {
    const { error } = await supabase
      .from('opportunities')
      .upsert(opp, { onConflict: 'id' });

    if (error) {
      console.log(`     ⚠️  Error with ${opp.name}: ${error.message}`);
    } else {
      count++;
    }
  }
  console.log(`     ✅ Opportunities: ${count} records`);
  return count;
}

async function seedProposals() {
  console.log('   Seeding proposals...');

  const proposals = [
    {
      id: '34000000-0000-0000-0000-000000000001',
      organization_id: '00000000-0000-0000-0000-000000000001',
      opportunity_id: '33000000-0000-0000-0000-000000000001',
      proposal_number: 'PROP-2026-0001',
      title: 'Global Bank HQ Security - Proposal',
      status: 'sent',
      total_amount: 250000.00,
      currency: 'USD',
      valid_until: '2026-02-28',
      created_by: 'a2222222-2222-2222-2222-222222222222'
    },
    {
      id: '34000000-0000-0000-0000-000000000002',
      organization_id: '00000000-0000-0000-0000-000000000001',
      opportunity_id: '33000000-0000-0000-0000-000000000003',
      proposal_number: 'PROP-2026-0002',
      title: 'TechVentures Data Center - Proposal',
      status: 'draft',
      total_amount: 320000.00,
      currency: 'USD',
      valid_until: '2026-03-15',
      created_by: 'a3333333-3333-3333-3333-333333333333'
    },
    {
      id: '44000000-0000-0000-0000-000000000001',
      organization_id: '00000000-0000-0000-0000-000000000002',
      opportunity_id: '43000000-0000-0000-0000-000000000001',
      proposal_number: 'PROP-TS-2026-001',
      title: 'SecureBuildings Office Tower - Security Proposal',
      status: 'sent',
      total_amount: 450000.00,
      currency: 'USD',
      valid_until: '2026-03-15',
      created_by: 'b2222222-2222-2222-2222-222222222222'
    }
  ];

  let count = 0;
  for (const proposal of proposals) {
    const { error } = await supabase
      .from('proposals')
      .upsert(proposal, { onConflict: 'id' });

    if (error) {
      console.log(`     ⚠️  Error with ${proposal.title}: ${error.message}`);
    } else {
      count++;
    }
  }
  console.log(`     ✅ Proposals: ${count} records`);
  return count;
}

async function seedProposalLineItems() {
  console.log('   Seeding proposal line items...');

  const lineItems = [
    // Proposal 1 line items
    {
      id: '35000000-0000-0000-0000-000000000001',
      organization_id: '00000000-0000-0000-0000-000000000001',
      proposal_id: '34000000-0000-0000-0000-000000000001',
      sort_order: 1,
      description: 'IP Security Cameras (4K)',
      quantity: 25,
      unit_price: 800.00,
      total: 20000.00
    },
    {
      id: '35000000-0000-0000-0000-000000000002',
      organization_id: '00000000-0000-0000-0000-000000000001',
      proposal_id: '34000000-0000-0000-0000-000000000001',
      sort_order: 2,
      description: 'Network Video Recorder (NVR)',
      quantity: 2,
      unit_price: 5000.00,
      total: 10000.00
    },
    {
      id: '35000000-0000-0000-0000-000000000003',
      organization_id: '00000000-0000-0000-0000-000000000001',
      proposal_id: '34000000-0000-0000-0000-000000000001',
      sort_order: 3,
      description: 'Access Control System',
      quantity: 1,
      unit_price: 45000.00,
      total: 45000.00
    },
    {
      id: '35000000-0000-0000-0000-000000000004',
      organization_id: '00000000-0000-0000-0000-000000000001',
      proposal_id: '34000000-0000-0000-0000-000000000001',
      sort_order: 4,
      description: 'Installation & Configuration',
      quantity: 1,
      unit_price: 75000.00,
      total: 75000.00
    },
    {
      id: '35000000-0000-0000-0000-000000000005',
      organization_id: '00000000-0000-0000-0000-000000000001',
      proposal_id: '34000000-0000-0000-0000-000000000001',
      sort_order: 5,
      description: '3-Year Maintenance Contract',
      quantity: 1,
      unit_price: 100000.00,
      total: 100000.00
    },
    // Proposal 2 line items
    {
      id: '35000000-0000-0000-0000-000000000006',
      organization_id: '00000000-0000-0000-0000-000000000001',
      proposal_id: '34000000-0000-0000-0000-000000000002',
      sort_order: 1,
      description: 'Biometric Access Control',
      quantity: 1,
      unit_price: 65000.00,
      total: 65000.00
    },
    {
      id: '35000000-0000-0000-0000-000000000007',
      organization_id: '00000000-0000-0000-0000-000000000001',
      proposal_id: '34000000-0000-0000-0000-000000000002',
      sort_order: 2,
      description: 'Surveillance System (Enterprise)',
      quantity: 1,
      unit_price: 120000.00,
      total: 120000.00
    },
    {
      id: '35000000-0000-0000-0000-000000000008',
      organization_id: '00000000-0000-0000-0000-000000000001',
      proposal_id: '34000000-0000-0000-0000-000000000002',
      sort_order: 3,
      description: 'Intrusion Detection System',
      quantity: 1,
      unit_price: 55000.00,
      total: 55000.00
    },
    {
      id: '35000000-0000-0000-0000-000000000009',
      organization_id: '00000000-0000-0000-0000-000000000001',
      proposal_id: '34000000-0000-0000-0000-000000000002',
      sort_order: 4,
      description: 'Installation & Integration',
      quantity: 1,
      unit_price: 80000.00,
      total: 80000.00
    },
    // Proposal 3 line items (Org 2)
    {
      id: '45000000-0000-0000-0000-000000000001',
      organization_id: '00000000-0000-0000-0000-000000000002',
      proposal_id: '44000000-0000-0000-0000-000000000001',
      sort_order: 1,
      description: 'IP Cameras (Enterprise Grade)',
      quantity: 50,
      unit_price: 1200.00,
      total: 60000.00
    },
    {
      id: '45000000-0000-0000-0000-000000000002',
      organization_id: '00000000-0000-0000-0000-000000000002',
      proposal_id: '44000000-0000-0000-0000-000000000001',
      sort_order: 2,
      description: 'Central Monitoring System',
      quantity: 1,
      unit_price: 85000.00,
      total: 85000.00
    },
    {
      id: '45000000-0000-0000-0000-000000000003',
      organization_id: '00000000-0000-0000-0000-000000000002',
      proposal_id: '44000000-0000-0000-0000-000000000001',
      sort_order: 3,
      description: 'Access Control (Multi-Building)',
      quantity: 1,
      unit_price: 120000.00,
      total: 120000.00
    },
    {
      id: '45000000-0000-0000-0000-000000000004',
      organization_id: '00000000-0000-0000-0000-000000000002',
      proposal_id: '44000000-0000-0000-0000-000000000001',
      sort_order: 4,
      description: 'Fire & Intrusion Detection',
      quantity: 1,
      unit_price: 95000.00,
      total: 95000.00
    },
    {
      id: '45000000-0000-0000-0000-000000000005',
      organization_id: '00000000-0000-0000-0000-000000000002',
      proposal_id: '44000000-0000-0000-0000-000000000001',
      sort_order: 5,
      description: 'Professional Installation',
      quantity: 1,
      unit_price: 90000.00,
      total: 90000.00
    }
  ];

  let count = 0;
  for (const item of lineItems) {
    const { error } = await supabase
      .from('proposal_line_items')
      .upsert(item, { onConflict: 'id' });

    if (error) {
      console.log(`     ⚠️  Error with line item: ${error.message}`);
    } else {
      count++;
    }
  }
  console.log(`     ✅ Proposal Line Items: ${count} records`);
  return count;
}

async function runSeeds() {
  console.log('🌱 Seeding complete CRM entities...\n');

  try {
    console.log('📄 Seeding CRM entities (continuing from previous seed):\n');

    const contactCount = await seedContacts();
    const leadCount = await seedLeads();
    const oppCount = await seedOpportunities();
    const proposalCount = await seedProposals();
    const lineItemCount = await seedProposalLineItems();

    console.log('\n📊 Summary of newly inserted records:');
    console.log(`   Contacts: ${contactCount}`);
    console.log(`   Leads: ${leadCount}`);
    console.log(`   Opportunities: ${oppCount}`);
    console.log(`   Proposals: ${proposalCount}`);
    console.log(`   Proposal Line Items: ${lineItemCount}`);

    console.log('\n✨ Complete CRM seeding finished!\n');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

runSeeds();
