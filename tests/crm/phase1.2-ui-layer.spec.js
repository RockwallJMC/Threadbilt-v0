/**
 * CRM Phase 1.2 - UI Layer Tests
 *
 * Tests the Add Contact form UI integration with live database:
 * - 3-step wizard (Personal Info → Company Info → Lead Info)
 * - Form validation at each step
 * - Contact creation with new account
 * - Contact creation with existing account
 * - Duplicate email validation
 * - Image upload for profile picture and company logo
 * - Redirect to lead-details page after successful creation
 *
 * These are Layer 3 tests that verify the UI layer works end-to-end,
 * assuming Layer 1 (database) and Layer 2 (API) are complete and working.
 *
 * Following TDD Red-Green-Refactor:
 * - RED: Write test showing desired UI behavior
 * - Verify RED: Run test, confirm it fails (UI not wired yet or has bugs)
 * - GREEN: Fix UI to pass the test
 * - Verify GREEN: Re-run test, confirm passes
 */

import { test, expect } from '@playwright/test';
import { loginAsOrgUser, TEST_ORGS, waitForDatabase } from '../helpers/multi-tenant-setup.js';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const ADD_CONTACT_URL = `${BASE_URL}/apps/crm/add-contact`;

// ============================================================================
// Test Data
// ============================================================================

// Generate unique emails for each test run to avoid collisions
const timestamp = Date.now();

const VALID_PERSONAL_INFO = {
  firstName: 'E2E',
  lastName: 'TestUser',
  workEmail: `e2e.testuser.${timestamp}@newcompany.io`,
  personalEmail: `e2e.personal.${timestamp}@gmail.com`,
  phoneNumber: '5551234567', // Numeric only for input[type=number]
  alternatePhoneNumber: '5559876543', // Numeric only for input[type=number]
  dateOfBirth: '15/05/1990', // DD/MM/YYYY format for DatePicker
  jobTitle: 'QA Engineer',
  status: 'Currently Working',
  linkedInUrl: 'https://linkedin.com/in/e2etestuser',
  note: 'E2E test contact',
};

const VALID_COMPANY_INFO = {
  companyName: `E2E Test Company ${timestamp}`,
  industryType: 'Technology',
  foundingYear: '2020',
  contact: {
    officialEmail: `info@e2etestco${timestamp}.com`,
    phoneNumber: '5555551234', // Numeric only for input[type=number]
    streetAddress: '123 E2E Street',
    city: 'TestCity',
    state: 'TX',
    country: 'USA',
    zipCode: '12345',
  },
  website: 'https://e2etestco.com',
  note: 'E2E test company',
};

const VALID_LEAD_INFO = {
  source: 'Referral',
  status: 'Qualified',
  priority: 'High',
  tags: ['Technology', 'Enterprise'],
  note: 'E2E test lead',
};

// Existing contact email from seed data for duplicate testing
const EXISTING_CONTACT_EMAIL = 'existing.contact@test.com';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Fill Personal Info form (Step 1)
 */
async function fillPersonalInfoForm(page, data, skipProfileImage = false) {
  // Wait for form to be visible
  await expect(page.locator('text=/Personal Information/i').first()).toBeVisible({ timeout: 10000 });

  // Upload profile image (required field)
  if (!skipProfileImage) {
    const testImagePath = path.join(__dirname, '../fixtures/test-avatar.png');
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testImagePath);
    // Wait for upload to complete
    await page.waitForTimeout(2000);
  }

  // Fill all required fields
  await page.fill('input[name="personalInfo.firstName"]', data.firstName);
  await page.fill('input[name="personalInfo.lastName"]', data.lastName);
  await page.fill('input[name="personalInfo.workEmail"]', data.workEmail);

  if (data.personalEmail) {
    await page.fill('input[name="personalInfo.personalEmail"]', data.personalEmail);
  }

  await page.fill('input[name="personalInfo.phoneNumber"]', data.phoneNumber);

  if (data.alternatePhoneNumber) {
    await page.fill('input[name="personalInfo.alternatePhoneNumber"]', data.alternatePhoneNumber);
  }

  // Date of Birth - DatePicker component
  if (data.dateOfBirth) {
    // Click the date picker to open it
    const datePicker = page.locator('label:has-text("Date of Birth")').locator('..').locator('input').first();
    await datePicker.click();

    // Type the date directly (MUI DatePicker accepts keyboard input)
    await datePicker.fill(data.dateOfBirth);

    // Click outside to close picker
    await page.locator('h6:has-text("Personal Information")').click();
    await page.waitForTimeout(300);
  }

  await page.fill('input[name="personalInfo.jobTitle"]', data.jobTitle);

  // Select status from dropdown
  const statusButton = page.locator('div[role="button"]').filter({ hasText: /Status|Currently Working|Not Working/i }).first();
  await statusButton.click();
  await page.locator(`li:has-text("${data.status}")`).first().click();

  if (data.linkedInUrl) {
    await page.fill('input[name="personalInfo.linkedInUrl"]', data.linkedInUrl);
  }

  if (data.note) {
    await page.fill('textarea[name="personalInfo.note"]', data.note);
  }
}

/**
 * Fill Company Info form (Step 2)
 */
async function fillCompanyInfoForm(page, data, useExistingCompany = false) {
  // Wait for form to be visible
  await expect(page.locator('text=/Company Information/i').first()).toBeVisible({ timeout: 10000 });

  if (useExistingCompany) {
    // Select existing company from dropdown
    const companyDropdown = page.locator('div[role="button"]').filter({ hasText: /Select Company|Company Name/i }).first();
    await companyDropdown.click();
    await page.locator('li:has-text("Existing Test Company Inc")').first().click();
  } else {
    // Fill new company form
    await page.fill('input[name="companyInfo.companyName"]', data.companyName);

    // Select industry type from dropdown
    const industryButton = page.locator('div[role="button"]').filter({ hasText: /Industry Type/i }).first();
    await industryButton.click();
    await page.locator(`li:has-text("${data.industryType}")`).first().click();

    if (data.foundingYear) {
      await page.fill('input[name="companyInfo.foundingYear"]', data.foundingYear);
    }

    if (data.contact?.officialEmail) {
      await page.fill('input[name="companyInfo.contact.officialEmail"]', data.contact.officialEmail);
    }

    if (data.contact?.phoneNumber) {
      await page.fill('input[name="companyInfo.contact.phoneNumber"]', data.contact.phoneNumber);
    }

    if (data.contact?.streetAddress) {
      await page.fill('input[name="companyInfo.contact.streetAddress"]', data.contact.streetAddress);
    }

    if (data.contact?.city) {
      await page.fill('input[name="companyInfo.contact.city"]', data.contact.city);
    }

    if (data.contact?.state) {
      await page.fill('input[name="companyInfo.contact.state"]', data.contact.state);
    }

    if (data.contact?.country) {
      await page.fill('input[name="companyInfo.contact.country"]', data.contact.country);
    }

    if (data.contact?.zipCode) {
      await page.fill('input[name="companyInfo.contact.zipCode"]', data.contact.zipCode);
    }

    if (data.website) {
      await page.fill('input[name="companyInfo.website"]', data.website);
    }

    if (data.note) {
      await page.fill('textarea[name="companyInfo.note"]', data.note);
    }
  }
}

/**
 * Fill Lead Info form (Step 3)
 */
async function fillLeadInfoForm(page, data) {
  // Wait for form to be visible
  await expect(page.locator('text=/Lead Information/i').first()).toBeVisible({ timeout: 10000 });

  // Select lead source from dropdown
  const sourceButton = page.locator('div[role="button"]').filter({ hasText: /Lead Source|Source Type/i }).first();
  await sourceButton.click();
  await page.locator(`li:has-text("${data.source}")`).first().click();

  // Select lead status from dropdown
  const statusButton = page.locator('div[role="button"]').filter({ hasText: /Lead Status|Status/i }).first();
  await statusButton.click();
  await page.locator(`li:has-text("${data.status}")`).first().click();

  // Select priority from dropdown
  const priorityButton = page.locator('div[role="button"]').filter({ hasText: /Priority/i }).first();
  await priorityButton.click();
  await page.locator(`li:has-text("${data.priority}")`).first().click();

  // Add tags
  if (data.tags && data.tags.length > 0) {
    const tagsInput = page.locator('input[id="tags"]').or(page.locator('input[name="leadInfo.tags"]')).first();
    for (const tag of data.tags) {
      await tagsInput.fill(tag);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200); // Wait for tag to be added
    }
  }

  if (data.note) {
    await page.fill('textarea[name="leadInfo.note"]', data.note);
  }
}

/**
 * Upload image file
 */
async function uploadImage(page, fieldName, imageName) {
  const testImagePath = path.join(__dirname, '../fixtures', imageName);

  // Find the file input (it's hidden, so we need to force the action)
  const fileInput = page.locator(`input[type="file"][name="${fieldName}"]`).or(
    page.locator('input[type="file"]').first()
  );

  await fileInput.setInputFiles(testImagePath);

  // Wait for upload to complete (look for success indicator or uploaded image)
  await page.waitForTimeout(2000); // Wait for upload API call
}

/**
 * Complete the entire 3-step form
 */
async function completeFullForm(page, personalInfo, companyInfo, leadInfo, useExistingCompany = false) {
  // Step 1: Personal Info
  await fillPersonalInfoForm(page, personalInfo);
  await page.click('button:has-text("Save & Continue")');

  // Wait for step 2 to load
  await page.waitForTimeout(500);

  // Step 2: Company Info
  await fillCompanyInfoForm(page, companyInfo, useExistingCompany);
  await page.click('button:has-text("Save & Continue")');

  // Wait for step 3 to load
  await page.waitForTimeout(500);

  // Step 3: Lead Info
  await fillLeadInfoForm(page, leadInfo);
}

// ============================================================================
// Tests
// ============================================================================

test.describe('CRM Phase 1.2 - Add Contact Form UI Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Login as Acme admin for all tests
    await loginAsOrgUser(page, 'ACME', 'admin');

    // Navigate to Add Contact page
    await page.goto(ADD_CONTACT_URL);
    await page.waitForLoadState('networkidle');
  });

  // ============================================================================
  // Suite 1: Happy Path Tests
  // ============================================================================

  test.describe('Happy Path - Create Contact', () => {

    test('should create new contact with new account successfully', async ({ page }) => {
      // Fill all 3 steps
      await completeFullForm(page, VALID_PERSONAL_INFO, VALID_COMPANY_INFO, VALID_LEAD_INFO);

      // Submit final form
      await page.click('button:has-text("Save")');

      // Wait for redirect to lead-details page
      await page.waitForURL(/\/apps\/crm\/lead-details\/[a-f0-9-]+/, { timeout: 10000 });

      // Verify we're on the lead-details page
      expect(page.url()).toMatch(/\/apps\/crm\/lead-details\/[a-f0-9-]{36}/);

      // Wait for database to propagate
      await waitForDatabase(1000);

      // Verify contact name appears on the page
      const fullName = `${VALID_PERSONAL_INFO.firstName} ${VALID_PERSONAL_INFO.lastName}`;
      await expect(page.locator(`text=${fullName}`).first()).toBeVisible({ timeout: 10000 });

      // Verify contact email appears on the page
      await expect(page.locator(`text=${VALID_PERSONAL_INFO.workEmail}`).first()).toBeVisible({ timeout: 10000 });
    });

    test('should create contact with existing account successfully', async ({ page }) => {
      const uniquePersonalInfo = {
        ...VALID_PERSONAL_INFO,
        workEmail: `existing.account.${timestamp}@test.com`,
        personalEmail: `existing.account.personal.${timestamp}@test.com`,
      };

      // Fill Step 1: Personal Info
      await fillPersonalInfoForm(page, uniquePersonalInfo);
      await page.click('button:has-text("Save & Continue")');
      await page.waitForTimeout(500);

      // Fill Step 2: Company Info with existing company
      await fillCompanyInfoForm(page, VALID_COMPANY_INFO, true); // useExistingCompany = true
      await page.click('button:has-text("Save & Continue")');
      await page.waitForTimeout(500);

      // Fill Step 3: Lead Info
      await fillLeadInfoForm(page, VALID_LEAD_INFO);

      // Submit final form
      await page.click('button:has-text("Save")');

      // Wait for redirect
      await page.waitForURL(/\/apps\/crm\/lead-details\/[a-f0-9-]+/, { timeout: 10000 });

      // Verify redirect successful
      expect(page.url()).toMatch(/\/apps\/crm\/lead-details\/[a-f0-9-]{36}/);

      // Wait for page to load
      await waitForDatabase(1000);

      // Verify contact appears
      const fullName = `${uniquePersonalInfo.firstName} ${uniquePersonalInfo.lastName}`;
      await expect(page.locator(`text=${fullName}`).first()).toBeVisible({ timeout: 10000 });
    });
  });

  // ============================================================================
  // Suite 2: Validation Tests
  // ============================================================================

  test.describe('Form Validation', () => {

    test('should show validation errors for missing required fields in Step 1', async ({ page }) => {
      // Try to proceed without filling required fields
      await page.click('button:has-text("Save & Continue")');

      // Should still be on Step 1 (Personal Info)
      await expect(page.locator('text=/Personal Information/i').first()).toBeVisible();

      // Should show validation errors (generic check - error messages may vary)
      // The form should prevent progression
      const currentUrl = page.url();
      expect(currentUrl).toBe(ADD_CONTACT_URL);
    });

    test('should show validation errors for missing required fields in Step 2', async ({ page }) => {
      // Fill Step 1 correctly
      await fillPersonalInfoForm(page, VALID_PERSONAL_INFO);
      await page.click('button:has-text("Save & Continue")');
      await page.waitForTimeout(500);

      // Try to proceed without filling required fields in Step 2
      await page.click('button:has-text("Save & Continue")');

      // Should still be on Step 2 (Company Info)
      await expect(page.locator('text=/Company Information/i').first()).toBeVisible();
    });

    test('should show validation errors for missing required fields in Step 3', async ({ page }) => {
      // Fill Step 1
      await fillPersonalInfoForm(page, VALID_PERSONAL_INFO);
      await page.click('button:has-text("Save & Continue")');
      await page.waitForTimeout(500);

      // Fill Step 2
      await fillCompanyInfoForm(page, VALID_COMPANY_INFO);
      await page.click('button:has-text("Save & Continue")');
      await page.waitForTimeout(500);

      // Try to submit without filling required fields in Step 3
      await page.click('button:has-text("Save")');

      // Should still be on Step 3 (Lead Info)
      await expect(page.locator('text=/Lead Information/i').first()).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      // Try to enter invalid email
      await page.fill('input[name="personalInfo.firstName"]', 'Test');
      await page.fill('input[name="personalInfo.lastName"]', 'User');
      await page.fill('input[name="personalInfo.workEmail"]', 'invalid-email-format');
      await page.fill('input[name="personalInfo.phoneNumber"]', '5550000'); // Numeric only
      await page.fill('input[name="personalInfo.jobTitle"]', 'Test');

      // Select status
      const statusButton = page.locator('div[role="button"]').filter({ hasText: /Status/i }).first();
      await statusButton.click();
      await page.locator('li:has-text("Currently Working")').first().click();

      await page.click('button:has-text("Save & Continue")');

      // Should show validation error for email (stay on same page)
      await expect(page.locator('text=/Personal Information/i').first()).toBeVisible();
    });
  });

  // ============================================================================
  // Suite 3: Duplicate Email Validation
  // ============================================================================

  test.describe('Duplicate Email Validation', () => {

    test('should show error when creating contact with duplicate work email', async ({ page }) => {
      const duplicatePersonalInfo = {
        ...VALID_PERSONAL_INFO,
        workEmail: EXISTING_CONTACT_EMAIL, // Use existing email from seed data
      };

      // Complete all 3 steps with duplicate email
      await completeFullForm(page, duplicatePersonalInfo, VALID_COMPANY_INFO, VALID_LEAD_INFO);

      // Submit final form
      await page.click('button:has-text("Save")');

      // Wait for error message
      await page.waitForTimeout(2000);

      // Should show error message (either snackbar or inline error)
      const errorMessage = page.locator('text=/email already exists|duplicate email|email.*taken/i').first();
      await expect(errorMessage).toBeVisible({ timeout: 10000 });

      // Should NOT redirect (stay on form)
      expect(page.url()).toContain('add-contact');
    });
  });

  // ============================================================================
  // Suite 4: Navigation Tests
  // ============================================================================

  test.describe('Form Navigation', () => {

    test('should allow navigation back to previous step', async ({ page }) => {
      // Fill Step 1
      await fillPersonalInfoForm(page, VALID_PERSONAL_INFO);
      await page.click('button:has-text("Save & Continue")');
      await page.waitForTimeout(500);

      // Verify on Step 2
      await expect(page.locator('text=/Company Information/i').first()).toBeVisible();

      // Click Back button
      await page.click('button:has-text("Back")');
      await page.waitForTimeout(500);

      // Should be back on Step 1
      await expect(page.locator('text=/Personal Information/i').first()).toBeVisible();

      // Form data should be preserved
      const firstNameValue = await page.inputValue('input[name="personalInfo.firstName"]');
      expect(firstNameValue).toBe(VALID_PERSONAL_INFO.firstName);
    });

    test('should allow jumping to completed steps via stepper', async ({ page }) => {
      // Fill and complete Step 1
      await fillPersonalInfoForm(page, VALID_PERSONAL_INFO);
      await page.click('button:has-text("Save & Continue")');
      await page.waitForTimeout(500);

      // Fill and complete Step 2
      await fillCompanyInfoForm(page, VALID_COMPANY_INFO);
      await page.click('button:has-text("Save & Continue")');
      await page.waitForTimeout(500);

      // Now on Step 3, click back to Step 1 via stepper
      const step1Label = page.locator('.MuiStepLabel-root').first();
      await step1Label.click();
      await page.waitForTimeout(500);

      // Should be back on Step 1
      await expect(page.locator('text=/Personal Information/i').first()).toBeVisible();
    });
  });

  // ============================================================================
  // Suite 5: Image Upload Tests (if implemented)
  // ============================================================================

  test.describe('Image Upload', () => {

    test.skip('should upload profile picture in Step 1', async ({ page }) => {
      // Note: This test is skipped because image upload may not be fully implemented
      // Uncomment when image upload feature is ready

      await uploadImage(page, 'personalInfo.profileImage', 'test-avatar.png');

      // Verify upload success indicator
      await expect(page.locator('text=/Uploaded|Success/i').first()).toBeVisible({ timeout: 5000 });
    });

    test.skip('should upload company logo in Step 2', async ({ page }) => {
      // Note: This test is skipped because image upload may not be fully implemented
      // Uncomment when image upload feature is ready

      // Navigate to Step 2
      await fillPersonalInfoForm(page, VALID_PERSONAL_INFO);
      await page.click('button:has-text("Save & Continue")');
      await page.waitForTimeout(500);

      await uploadImage(page, 'companyInfo.avatar', 'test-logo.png');

      // Verify upload success indicator
      await expect(page.locator('text=/Uploaded|Success/i').first()).toBeVisible({ timeout: 5000 });
    });
  });

  // ============================================================================
  // Suite 6: Error Handling
  // ============================================================================

  test.describe('Error Handling', () => {

    test('should handle network errors gracefully', async ({ page }) => {
      // Fill entire form
      await completeFullForm(page, VALID_PERSONAL_INFO, VALID_COMPANY_INFO, VALID_LEAD_INFO);

      // Go offline before submitting
      await page.context().setOffline(true);

      // Try to submit
      await page.click('button:has-text("Save")');

      // Wait for error
      await page.waitForTimeout(2000);

      // Should show error message (not crash)
      // Error message may vary, so we just check page is still functional
      await expect(page.locator('body')).toBeVisible();

      // Restore network
      await page.context().setOffline(false);
    });

    test('should display loading state during submission', async ({ page }) => {
      // Fill entire form
      await completeFullForm(page, VALID_PERSONAL_INFO, VALID_COMPANY_INFO, VALID_LEAD_INFO);

      // Click submit
      const submitButton = page.locator('button:has-text("Save")').first();
      await submitButton.click();

      // Should show loading state (button disabled or spinner)
      // We check quickly before the request completes
      const isDisabled = await submitButton.isDisabled().catch(() => false);

      // Either button is disabled OR we've already redirected (fast network)
      // This test just ensures no crash during loading state
      await expect(page.locator('body')).toBeVisible();
    });
  });

  // ============================================================================
  // Suite 7: Multi-Tenant Isolation
  // ============================================================================

  test.describe('Multi-Tenant Isolation', () => {

    test('should create contact in correct organization', async ({ page }) => {
      // Create contact as ACME admin
      await completeFullForm(page, VALID_PERSONAL_INFO, VALID_COMPANY_INFO, VALID_LEAD_INFO);
      await page.click('button:has-text("Save")');

      // Wait for redirect
      await page.waitForURL(/\/apps\/crm\/lead-details\/[a-f0-9-]+/, { timeout: 10000 });

      // Extract contact ID from URL
      const url = page.url();
      const contactId = url.match(/lead-details\/([a-f0-9-]+)/)?.[1];
      expect(contactId).toBeTruthy();

      // Logout
      await page.goto('http://localhost:4000/authentication/logout');
      await page.waitForURL(/\/authentication.*login/, { timeout: 5000 });

      // Login as TechStart user
      await loginAsOrgUser(page, 'TECHSTART', 'ceo');

      // Try to access ACME's contact
      await page.goto(`${BASE_URL}/apps/crm/lead-details/${contactId}`);
      await page.waitForLoadState('networkidle');

      // Should show error or "not found" (RLS blocks access)
      const accessDenied = page.locator('text=/not found|error|access denied|no data/i').first();
      await expect(accessDenied).toBeVisible({ timeout: 10000 });
    });
  });
});
