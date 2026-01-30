import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.test') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAPI() {
  // Sign in as test user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.PLAYWRIGHT_SINGLE_ORG_EMAIL,
    password: process.env.PLAYWRIGHT_SINGLE_ORG_PASSWORD
  });
  
  if (authError) {
    console.error('Auth error:', authError);
    return;
  }
  
  const token = authData.session.access_token;
  console.log('Got auth token:', token.substring(0, 20) + '...\n');
  
  // Call API
  const response = await fetch('http://localhost:4000/api/crm/deals', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('Status:', response.status);
  const data = await response.json();
  
  console.log('\nResponse structure:');
  console.log('Keys:', Object.keys(data));
  console.log('\nContact stage:', Array.isArray(data.Contact) ? `Array with ${data.Contact.length} deals` : typeof data.Contact);
  
  if (data.Contact && data.Contact.length > 0) {
    console.log('First deal:', data.Contact[0].name);
  }
}

testAPI().then(() => process.exit(0));
