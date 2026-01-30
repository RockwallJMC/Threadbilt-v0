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

async function checkSeedOwner() {
  // Get seed deals (non-test)
  const { data: deals, error } = await supabase
    .from('deals')
    .select('user_id, name, stage')
    .not('name', 'like', '%Test%')
    .limit(5);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Sample seed deals:');
  deals.forEach(d => {
    console.log(`- ${d.name} (${d.stage}) - user: ${d.user_id}`);
  });
}

checkSeedOwner().then(() => process.exit(0));
