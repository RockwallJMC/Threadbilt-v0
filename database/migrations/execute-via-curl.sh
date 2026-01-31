#!/bin/bash
# Execute migration using curl and Supabase REST API
# This creates a temporary function to execute SQL, then uses it

set -e

SUPABASE_URL="https://iixfjulmrexivuehoxti.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeGZqdWxtcmV4aXZ1ZWhveHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ3MzUzNywiZXhwIjoyMDgzMDQ5NTM3fQ.-9kWLYoix_N4B1YgSyn6e2Mw1iIKknPFBfCB88FW_lU"

echo "🔄 Executing migration 003..."
echo ""

# Read the SQL file
SQL_FILE="/home/pierce/piercedesk6/database/migrations/003_add_contact_form_fields.sql"

if [ ! -f "$SQL_FILE" ]; then
  echo "❌ Migration file not found: $SQL_FILE"
  exit 1
fi

echo "📄 Reading migration SQL..."
SQL_CONTENT=$(cat "$SQL_FILE")

echo "⚠️  Note: Direct SQL execution via REST API is not supported by Supabase"
echo "    The REST API (PostgREST) only supports data operations, not DDL"
echo ""
echo "Please execute the migration using one of these methods:"
echo ""
echo "1. Supabase Dashboard SQL Editor (Recommended):"
echo "   https://app.supabase.com/project/iixfjulmrexivuehoxti/sql"
echo ""
echo "2. psql command line (if you have the database password):"
echo "   psql 'postgresql://postgres.iixfjulmrexivuehoxti:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres' \\"
echo "     -f $SQL_FILE"
echo ""
echo "3. Supabase CLI (if logged in):"
echo "   npx supabase db push --linked"
echo ""

exit 1
