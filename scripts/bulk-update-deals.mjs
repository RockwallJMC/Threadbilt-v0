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

async function bulkUpdate() {
  const oldUserId = 'a2222222-2222-2222-2222-222222222222';
  const newUserId = '817d0f3f-f478-4691-972c-5238c6bc1ee7';
  
  console.log('Updating all seed deals...\n');
  
  // Update deals
  const { data, error } = await supabase
    .from('deals')
    .update({ 
      user_id: newUserId,
      owner_id: newUserId,
      created_by: newUserId
    })
    .eq('user_id', oldUserId)
    .select('id, name');
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`✅ Updated ${data.length} deals`);
  }
  
  // Update contacts
  const { data: contacts, error: contactError } = await supabase
    .from('crm_contacts')
    .update({ 
      user_id: newUserId,
      contact_owner_id: newUserId,
      created_by: newUserId
    })
    .eq('user_id', oldUserId)
    .select('id, first_name, last_name');
  
  if (contactError) {
    console.error('Contact error:', contactError);
  } else {
    console.log(`✅ Updated ${contacts.length} contacts`);
  }
}

bulkUpdate().then(() => process.exit(0));
