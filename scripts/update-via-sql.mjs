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

async function updateViaSQL() {
  // Get test user ID
  const testEmail = process.env.PLAYWRIGHT_SINGLE_ORG_EMAIL;
  const testPass = process.env.PLAYWRIGHT_SINGLE_ORG_PASSWORD;
  
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPass
  });
  
  const testUserId = authData.user.id;
  const oldUserId = 'a2222222-2222-2222-2222-222222222222';
  
  console.log(`Updating deals from ${oldUserId} to ${testUserId}\n`);
  
  // Try direct update on specific user_id
  const { data, error, count } = await supabase
    .from('deals')
    .update({ 
      user_id: testUserId,
      owner_id: testUserId,
      created_by: testUserId
    })
    .eq('user_id', oldUserId)
    .select();
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Updated ${data?.length || 0} deals`);
    if (data?.length > 0) {
      console.log('Sample:', data[0].name);
    }
  }
}

updateViaSQL().then(() => process.exit(0));
