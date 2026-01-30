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

async function cleanup() {
  console.log('Cleaning up test deals...');
  
  // Delete all deals with "Test" in the name
  const { data, error } = await supabase
    .from('deals')
    .delete()
    .like('name', '%Test%')
    .select();
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Deleted ${data?.length || 0} test deals`);
  }
  
  // Delete all test contacts
  const { data: contacts, error: contactError } = await supabase
    .from('crm_contacts')
    .delete()
    .like('last_name', '%Test%')
    .select();
  
  if (contactError) {
    console.error('Error deleting contacts:', contactError);
  } else {
    console.log(`Deleted ${contacts?.length || 0} test contacts`);
  }
}

cleanup().then(() => process.exit(0));
