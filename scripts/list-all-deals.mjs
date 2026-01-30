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

async function listAll() {
  const { data, error } = await supabase
    .from('deals')
    .select('id, name, user_id')
    .order('name');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`Total deals: ${data.length}\n`);
  data.forEach(d => {
    const isTest = d.name.includes('Test');
    console.log(`${isTest ? '❌ TEST' : '✅ SEED'}: ${d.name}`);
  });
}

listAll().then(() => process.exit(0));
