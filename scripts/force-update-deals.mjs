import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.test') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
);

async function updateDeals() {
  // Get test user ID
  const testEmail = process.env.PLAYWRIGHT_SINGLE_ORG_EMAIL;
  const testPass = process.env.PLAYWRIGHT_SINGLE_ORG_PASSWORD;
  
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPass
  });
  
  const testUserId = authData.user.id;
  console.log(`Target user ID: ${testUserId}\n`);
  
  // First, get all seed deals
  const { data: oldDeals, error: fetchError } = await supabase
    .from('deals')
    .select('id, name, user_id')
    .not('name', 'like', '%Test%');
  
  if (fetchError) {
    console.error('Fetch error:', fetchError);
    return;
  }
  
  console.log(`Found ${oldDeals.length} seed deals to update\n`);
  
  // Update each one individually  
  let updated = 0;
  for (const deal of oldDeals) {
    const { error } = await supabase
      .from('deals')
      .update({ 
        user_id: testUserId,
        owner_id: testUserId,
        created_by: testUserId
      })
      .eq('id', deal.id);
    
    if (error) {
      console.error(`Error updating ${deal.name}:`, error.message);
    } else {
      updated++;
    }
  }
  
  console.log(`\nSuccessfully updated ${updated}/${oldDeals.length} deals`);
}

updateDeals().then(() => process.exit(0));
