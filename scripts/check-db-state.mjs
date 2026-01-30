import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.test
dotenv.config({ path: resolve(__dirname, '../.env.test') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

async function checkState() {
  // Get all deals
  const { data: deals, error } = await supabase
    .from('deals')
    .select('id, name, stage, stage_order, user_id')
    .order('stage')
    .order('stage_order');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`\nTotal deals: ${deals.length}\n`);
  
  // Group by stage
  const byStage = {};
  deals.forEach(d => {
    if (!byStage[d.stage]) byStage[d.stage] = [];
    byStage[d.stage].push(d);
  });
  
  Object.keys(byStage).sort().forEach(stage => {
    console.log(`${stage}: ${byStage[stage].length} deals`);
    byStage[stage].slice(0, 3).forEach(d => {
      console.log(`  - ${d.name} (order: ${d.stage_order})`);
    });
    if (byStage[stage].length > 3) {
      console.log(`  ... and ${byStage[stage].length - 3} more`);
    }
  });
  
  // Check user_ids
  const uniqueUsers = [...new Set(deals.map(d => d.user_id))];
  console.log(`\nUnique user IDs: ${uniqueUsers.length}`);
  console.log('Test user from env:', process.env.PLAYWRIGHT_SINGLE_ORG_EMAIL);
}

checkState().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
