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

async function listDeals() {
  const { data: deals, error } = await supabase
    .from('deals')
    .select('name, stage')
    .order('name');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('\nAll deals:');
  deals.forEach(d => {
    const isTest = d.name.includes('Test');
    console.log(`${isTest ? '❌' : '✅'} ${d.name} (${d.stage})`);
  });
  
  const seedDeals = deals.filter(d => !d.name.includes('Test'));
  const testDeals = deals.filter(d => d.name.includes('Test'));
  
  console.log(`\nSeed deals: ${seedDeals.length}`);
  console.log(`Test deals: ${testDeals.length}`);
}

listDeals().then(() => process.exit(0));
