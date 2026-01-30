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

async function checkFK() {
  // Query foreign key constraints on deals table
  const { data, error } = await supabase.rpc('get_foreign_key_info', {
    table_name: 'deals'
  });
  
  if (error) {
    console.log('RPC not available, trying direct query...');
    
    // Direct SQL query to check FK
    const query = `
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints AS rc
        ON rc.constraint_name = tc.constraint_name
        AND rc.constraint_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'deals'
        AND kcu.column_name = 'contact_id';
    `;
    
    const { data: fkData, error: fkError } = await supabase.rpc('execute_sql', { query });
    
    if (fkError) {
      console.error('Cannot query FK info:', fkError.message);
      console.log('\nTrying schema inspection via Postgres...');
    } else {
      console.log('FK Info:', fkData);
    }
  } else {
    console.log('FK Info:', data);
  }
}

checkFK().then(() => process.exit(0));
