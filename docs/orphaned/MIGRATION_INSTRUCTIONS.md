# Migration 003: Add Contact Form Fields

## Automated Execution (Recommended)

The migration SQL has been prepared. To execute it:

### Option 1: Supabase Dashboard SQL Editor (Easiest)

1. Open: https://app.supabase.com/project/iixfjulmrexivuehoxti/sql
2. Copy the SQL from `003_add_contact_form_fields.sql`
3. Paste into the SQL Editor
4. Click "Run"

### Option 2: Supabase CLI (If project is linked)

```bash
cd /home/pierce/piercedesk6
npx supabase db push --linked --include-all
```

### Option 3: psql Command Line

If you have the database password:

```bash
psql "postgresql://postgres:[PASSWORD]@db.iixfjulmrexivuehoxti.supabase.co:5432/postgres" \
  -f /home/pierce/piercedesk6/database/migrations/003_add_contact_form_fields.sql
```

## Migration File

**Location**: `/home/pierce/piercedesk6/database/migrations/003_add_contact_form_fields.sql`

## What This Migration Does

### Companies Table - New Columns:
- `phone` - Company phone number
- `street_address` - Street address
- `city` - City
- `state` - State/Province
- `country` - Country
- `zip_code` - Postal code
- `founding_year` - Year company was founded
- `notes` - General notes about the company

### Contacts Table - New Columns:
- `personal_email` - Personal email address
- `alternate_phone` - Alternate phone number
- `date_of_birth` - Contact's date of birth
- `linkedin_url` - LinkedIn profile URL
- `profile_image_url` - Profile image URL
- `status` - Employment status (currentlyWorking, notWorking, seekingOpportunities)
- `notes` - General notes about the contact
- `priority` - Priority level (high, medium, low, urgent, normal)
- `tags` - Array of tags

### Indexes Created:
- `idx_contacts_personal_email` - For faster queries on personal email
- `idx_companies_city` - For faster queries on city
- `idx_companies_industry` - For faster queries on industry

### Constraints Added:
- Check constraints for enum fields: status, lead_status, priority, lead_source
- Ensures data integrity for these fields

## Verification

After running the migration, verify with:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'contacts'
  AND column_name IN ('personal_email', 'alternate_phone', 'date_of_birth', 'tags');
```

Expected: Should return 4 rows.

## Seed Data

After migration succeeds, run seed data:

```bash
node /home/pierce/piercedesk6/database/migrations/seed-contact-test-data.mjs
```
