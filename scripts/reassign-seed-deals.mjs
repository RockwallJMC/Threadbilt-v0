import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.test') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

async function reassignDeals() {
  // Get test user ID
  const testEmail = process.env.PLAYWRIGHT_SINGLE_ORG_EMAIL;
  const testPass = process.env.PLAYWRIGHT_SINGLE_ORG_PASSWORD;
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPass
  });
  
  if (authError) {
    console.error('Auth error:', authError.message);
    return;
  }
  
  const testUserId = authData.user.id;
  console.log(`Test user: ${testEmail}`);
  console.log(`Test user ID: ${testUserId}\n`);
  
  // Update all non-test deals to belong to test user
  const { data: deals, error: dealsError } = await supabase
    .from('deals')
    .update({ 
      user_id: testUserId,
      owner_id: testUserId,
      created_by: testUserId
    })
    .not('name', 'like', '%Test%')
    .select('id, name');
  
  if (dealsError) {
    console.error('Error updating deals:', dealsError);
    return;
  }
  
  console.log(`Updated ${deals.length} seed deals to test user`);
  
  // Update contacts too
  const { data: contacts, error: contactsError } = await supabase
    .from('crm_contacts')
    .update({ 
      user_id: testUserId,
      contact_owner_id: testUserId,
      created_by: testUserId
    })
    .not('last_name', 'like', '%Test%')
    .select('id, first_name, last_name');
  
  if (contactsError) {
    console.error('Error updating contacts:', contactsError);
    return;
  }
  
  console.log(`Updated ${contacts.length} seed contacts to test user`);
}

reassignDeals().then(() => process.exit(0));
