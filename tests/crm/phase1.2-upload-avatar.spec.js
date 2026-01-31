/**
 * Phase 1.2 Upload Avatar Tests - POST /api/upload/avatar
 *
 * Tests the API endpoint for uploading avatar images to Supabase Storage.
 * Tests cover:
 * - Successful image upload
 * - Authentication validation
 * - Missing file validation
 * - Public URL generation
 * - File path structure
 *
 * Following TDD: Write tests first, watch them fail, then implement.
 */

import { test, expect } from '@playwright/test';
import { loginAsOrgUser } from '../helpers/multi-tenant-setup.js';
import fs from 'fs';
import path from 'path';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Upload avatar via API endpoint
 */
async function uploadAvatar(page, filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: 'image/png' });
  formData.append('file', blob, fileName);

  const cookies = await page.context().cookies();
  const response = await page.request.post('http://localhost:4000/api/upload/avatar', {
    multipart: {
      file: {
        name: fileName,
        mimeType: 'image/png',
        buffer: fileBuffer,
      },
    },
  });

  return {
    status: response.status(),
    data: response.ok() ? await response.json() : null,
    error: !response.ok() ? await response.json() : null,
  };
}

// ============================================================================
// Tests
// ============================================================================

test.describe('POST /api/upload/avatar - Upload Avatar', () => {
  test.beforeEach(async ({ page }) => {
    // Login as Acme admin for all tests
    await loginAsOrgUser(page, 'ACME', 'admin');
  });

  test('successfully uploads avatar and returns public URL', async ({ page }) => {
    // Create a test image file
    const testImagePath = path.join(process.cwd(), 'tests', 'fixtures', 'test-avatar.png');

    // If test fixture doesn't exist, create a simple 1x1 PNG
    if (!fs.existsSync(testImagePath)) {
      const fixturesDir = path.join(process.cwd(), 'tests', 'fixtures');
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }

      // Minimal valid PNG file (1x1 transparent pixel)
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
        0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
        0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
        0x42, 0x60, 0x82
      ]);
      fs.writeFileSync(testImagePath, pngBuffer);
    }

    const result = await uploadAvatar(page, testImagePath);

    // Debug output if test fails
    if (result.status !== 201) {
      console.log('Error response:', JSON.stringify(result.error, null, 2));
      console.log('Status:', result.status);
    }

    // Should return 201 Created
    expect(result.status).toBe(201);
    expect(result.data).toBeTruthy();

    // Verify response structure
    expect(result.data.url).toBeTruthy();
    expect(result.data.path).toBeTruthy();

    // Verify URL is a valid Supabase Storage URL
    expect(result.data.url).toContain('supabase.co');
    expect(result.data.url).toContain('/storage/v1/object/public/avatars/');

    // Verify path structure: {user_id}/{timestamp}.{ext}
    expect(result.data.path).toMatch(/^[a-f0-9-]+\/\d+\.png$/);
  });

  test('returns 401 for unauthenticated requests', async ({ page, context }) => {
    // Clear all cookies to simulate unauthenticated user
    await context.clearCookies();

    const testImagePath = path.join(process.cwd(), 'tests', 'fixtures', 'test-avatar.png');
    const result = await uploadAvatar(page, testImagePath);

    // Should return 401 Unauthorized
    expect(result.status).toBe(401);
    expect(result.error.error).toContain('Unauthorized');
  });

  test('returns 400 when no file is provided', async ({ page }) => {
    // Send empty form data
    const response = await page.request.post('http://localhost:4000/api/upload/avatar', {
      multipart: {
        // Empty multipart data, no file field
      },
    });

    const status = response.status();
    const error = !response.ok() ? await response.json() : null;

    // Should return 400 Bad Request
    expect(status).toBe(400);
    expect(error.error).toContain('No file provided');
  });

  test('handles multiple uploads for same user', async ({ page }) => {
    const testImagePath = path.join(process.cwd(), 'tests', 'fixtures', 'test-avatar.png');

    // Upload first avatar
    const firstResult = await uploadAvatar(page, testImagePath);
    expect(firstResult.status).toBe(201);
    const firstPath = firstResult.data.path;

    // Wait a moment to ensure different timestamp
    await page.waitForTimeout(100);

    // Upload second avatar
    const secondResult = await uploadAvatar(page, testImagePath);
    expect(secondResult.status).toBe(201);
    const secondPath = secondResult.data.path;

    // Paths should be different (different timestamps)
    expect(firstPath).not.toBe(secondPath);

    // Both should be under same user_id directory
    const firstUserId = firstPath.split('/')[0];
    const secondUserId = secondPath.split('/')[0];
    expect(firstUserId).toBe(secondUserId);
  });
});
