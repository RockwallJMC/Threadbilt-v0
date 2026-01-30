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

async function checkUsers() {
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
  
  // Get all deals
  const { data: deals, error } = await supabase
    .from('deals')
    .select('user_id, name')
    .limit(20);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Deals in database:');
  const byUser = {};
  deals.forEach(d => {
    const uid = d.user_id;
    if (!byUser[uid]) byUser[uid] = [];
    byUser[uid].push(d.name);
  });
  
  Object.keys(byUser).forEach(uid => {
    const isTestUser = uid === testUserId;
    console.log(`\n${isTestUser ? '✅ TEST USER' : '❌ OTHER USER'} (${uid.substring(0, 8)}...): ${byUser[uid].length} deals`);
    if (isTestUser || byUser[uid].length < 5) {
      byUser[uid].forEach(name => console.log(`  - ${name}`));
    }
  });
}

checkUsers().then(() => process.exit(0));
