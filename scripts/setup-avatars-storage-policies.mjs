#!/usr/bin/env node
/**
 * Setup RLS policies for avatars storage bucket
 * Run with: node scripts/setup-avatars-storage-policies.mjs
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupStoragePolicies() {
  console.log('Setting up RLS policies for avatars bucket...\n');

  // Drop existing policies if they exist
  const dropPolicies = `
    DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Public avatars are readable" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
  `;

  console.log('1. Dropping existing policies (if any)...');
  const { error: dropError } = await supabase.rpc('exec_sql', { sql_query: dropPolicies });
  if (dropError && !dropError.message.includes('does not exist')) {
    console.error('   ❌ Error dropping policies:', dropError.message);
  } else {
    console.log('   ✅ Existing policies dropped');
  }

  // Create RLS policies for avatars bucket
  const createPolicies = `
    -- Allow authenticated users to upload avatars to their own folder
    CREATE POLICY "Users can upload avatars"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'avatars' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );

    -- Allow public read access to all avatars
    CREATE POLICY "Public avatars are readable"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'avatars');

    -- Allow users to update their own avatars
    CREATE POLICY "Users can update own avatars"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'avatars' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );

    -- Allow users to delete their own avatars
    CREATE POLICY "Users can delete own avatars"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'avatars' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  `;

  console.log('2. Creating new RLS policies...');
  const { error: createError } = await supabase.rpc('exec_sql', { sql_query: createPolicies });

  if (createError) {
    console.error('   ❌ Error creating policies:', createError.message);

    // Try direct SQL execution via execute endpoint
    console.log('   Trying alternative method...');

    const policies = [
      {
        name: 'Users can upload avatars',
        sql: `
          CREATE POLICY "Users can upload avatars"
          ON storage.objects FOR INSERT
          TO authenticated
          WITH CHECK (
            bucket_id = 'avatars' AND
            (storage.foldername(name))[1] = auth.uid()::text
          );
        `
      },
      {
        name: 'Public avatars are readable',
        sql: `
          CREATE POLICY "Public avatars are readable"
          ON storage.objects FOR SELECT
          TO public
          USING (bucket_id = 'avatars');
        `
      },
      {
        name: 'Users can update own avatars',
        sql: `
          CREATE POLICY "Users can update own avatars"
          ON storage.objects FOR UPDATE
          TO authenticated
          USING (
            bucket_id = 'avatars' AND
            (storage.foldername(name))[1] = auth.uid()::text
          );
        `
      },
      {
        name: 'Users can delete own avatars',
        sql: `
          CREATE POLICY "Users can delete own avatars"
          ON storage.objects FOR DELETE
          TO authenticated
          USING (
            bucket_id = 'avatars' AND
            (storage.foldername(name))[1] = auth.uid()::text
          );
        `
      }
    ];

    console.log('\n   Creating policies individually via MCP...');
    for (const policy of policies) {
      console.log(`   - ${policy.name}...`);
      // We'll handle this with MCP tools in the main script
    }

    console.log('\n⚠️  Please use Supabase MCP tools to execute the SQL above');
    console.log('   Or run manually in Supabase SQL Editor\n');
    process.exit(1);
  }

  console.log('   ✅ RLS policies created successfully');
  console.log('\nPolicies created:');
  console.log('  - Users can upload avatars (INSERT to own folder)');
  console.log('  - Public avatars are readable (SELECT for all)');
  console.log('  - Users can update own avatars (UPDATE own folder)');
  console.log('  - Users can delete own avatars (DELETE own folder)');
}

setupStoragePolicies()
  .then(() => {
    console.log('\n✅ Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
