import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.test') });

console.log('Service role key:', process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...');

// Create client with explicit service role configuration
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function debug() {
  const oldUserId = 'a2222222-2222-2222-2222-222222222222';
  
  // First confirm we can SELECT
  console.log('\n1. Testing SELECT with service role...');
  const { data: selectData, error: selectError } = await supabase
    .from('deals')
    .select('id, name, user_id')
    .eq('user_id', oldUserId)
    .limit(3);
  
  if (selectError) {
    console.error('SELECT failed:', selectError);
  } else {
    console.log(`Found ${selectData.length} deals with old user_id`);
    if (selectData.length > 0) {
      console.log('Sample:', selectData[0].name, selectData[0].user_id);
    }
  }
  
  // Try updating just one deal
  if (selectData && selectData.length > 0) {
    const dealId = selectData[0].id;
    const newUserId = '817d0f3f-f478-4691-972c-5238c6bc1ee7';
    
    console.log(`\n2. Testing UPDATE single deal ${dealId}...`);
    const { data: updateData, error: updateError } = await supabase
      .from('deals')
      .update({ user_id: newUserId })
      .eq('id', dealId)
      .select();
    
    if (updateError) {
      console.error('UPDATE failed:', updateError.message);
      console.error('Code:', updateError.code);
      console.error('Details:', updateError.details);
      console.error('Hint:', updateError.hint);
    } else {
      console.log(`Updated ${updateData?.length || 0} deals`);
      if (updateData?.length > 0) {
        console.log('New user_id:', updateData[0].user_id);
      }
    }
  }
}

debug().then(() => process.exit(0));
