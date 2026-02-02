#!/usr/bin/env node

/**
 * Upload Chat Media Files to Supabase Storage
 *
 * This script uploads all chat images from /public/images/chat/ to the
 * chat-media bucket in Supabase Storage.
 *
 * Usage:
 *   node database/seeds/upload-chat-media.mjs
 *
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL environment variable
 *   - SUPABASE_SERVICE_ROLE_KEY environment variable (from .env.local)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  console.error('\nPlease ensure .env.local contains these variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const BUCKET_NAME = 'chat-media';
const SOURCE_DIR = path.join(__dirname, '../../public/images/chat');

/**
 * Upload a single file to Supabase Storage
 */
async function uploadFile(filePath, fileName) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const storagePath = `seed-data/${fileName}`;

    console.log(`📤 Uploading: ${fileName}`);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: 'image/webp',
        upsert: true, // Overwrite if exists
        cacheControl: '3600' // Cache for 1 hour
      });

    if (error) {
      console.error(`   ❌ Error: ${error.message}`);
      return { success: false, fileName, error: error.message };
    }

    console.log(`   ✅ Success: ${storagePath}`);
    return { success: true, fileName, path: data.path };

  } catch (error) {
    console.error(`   ❌ Exception: ${error.message}`);
    return { success: false, fileName, error: error.message };
  }
}

/**
 * Get public URL for an uploaded file
 */
function getPublicUrl(filePath) {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Main upload function
 */
async function main() {
  console.log('========================================');
  console.log('Chat Media Upload to Supabase Storage');
  console.log('========================================\n');

  console.log('Configuration:');
  console.log(`  Supabase URL: ${supabaseUrl}`);
  console.log(`  Bucket: ${BUCKET_NAME}`);
  console.log(`  Source: ${SOURCE_DIR}\n`);

  // Check if source directory exists
  try {
    await fs.access(SOURCE_DIR);
  } catch (error) {
    console.error(`❌ Error: Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  // Check if bucket exists
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.error(`❌ Error listing buckets: ${bucketsError.message}`);
    process.exit(1);
  }

  const bucketExists = buckets.some(b => b.name === BUCKET_NAME);
  if (!bucketExists) {
    console.error(`❌ Error: Bucket '${BUCKET_NAME}' does not exist`);
    console.error('   Run the database migration to create the bucket first.');
    process.exit(1);
  }

  console.log(`✅ Bucket '${BUCKET_NAME}' exists\n`);

  // Read all files from source directory
  const files = await fs.readdir(SOURCE_DIR);
  const imageFiles = files.filter(f => f.endsWith('.webp'));

  if (imageFiles.length === 0) {
    console.log('⚠️  No .webp files found in source directory');
    process.exit(0);
  }

  console.log(`Found ${imageFiles.length} image files to upload\n`);

  // Upload all files
  const results = [];
  for (const fileName of imageFiles) {
    const filePath = path.join(SOURCE_DIR, fileName);
    const result = await uploadFile(filePath, fileName);
    results.push(result);
  }

  // Summary
  console.log('\n========================================');
  console.log('Upload Summary');
  console.log('========================================\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`📊 Total: ${results.length}\n`);

  if (failed.length > 0) {
    console.log('Failed uploads:');
    failed.forEach(r => {
      console.log(`  - ${r.fileName}: ${r.error}`);
    });
    console.log('');
  }

  // Show sample URLs
  if (successful.length > 0) {
    console.log('Sample URLs (first 3):');
    successful.slice(0, 3).forEach(r => {
      const publicUrl = getPublicUrl(`seed-data/${r.fileName}`);
      console.log(`  ${r.fileName}:`);
      console.log(`    ${publicUrl}`);
    });
    console.log('');
  }

  console.log('========================================');
  console.log('Upload Complete!');
  console.log('========================================\n');

  if (failed.length > 0) {
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
