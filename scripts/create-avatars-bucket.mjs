#!/usr/bin/env node
/**
 * Create 'avatars' storage bucket in Supabase
 * Run with: node scripts/create-avatars-bucket.mjs
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

async function createAvatarsBucket() {
  console.log('Creating avatars bucket...');

  // Check if bucket exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('Error listing buckets:', listError);
    process.exit(1);
  }

  const avatarsBucket = buckets.find(b => b.name === 'avatars');

  if (avatarsBucket) {
    console.log('✅ Bucket "avatars" already exists');
    console.log('   - Public:', avatarsBucket.public);
    console.log('   - ID:', avatarsBucket.id);
    return;
  }

  // Create bucket
  const { data, error } = await supabase.storage.createBucket('avatars', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'],
  });

  if (error) {
    console.error('❌ Error creating bucket:', error);
    process.exit(1);
  }

  console.log('✅ Created bucket "avatars"');
  console.log('   - Public: true');
  console.log('   - Max size: 5MB');
  console.log('   - Allowed types: png, jpeg, jpg, webp, gif');
}

createAvatarsBucket()
  .then(() => {
    console.log('\n✅ Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
