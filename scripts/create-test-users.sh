#!/bin/bash

# Create test users for Playwright E2E tests using Supabase Admin API
# This script uses the service role key to create users via Supabase Auth Admin API

SUPABASE_URL="https://iixfjulmrexivuehoxti.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3andiYXJwaGJ5bGxxb3p1aWpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjcxODU4OSwiZXhwIjoyMDgyMjk0NTg5fQ.tEV46VzEQlM7eYVrT4zQdvvTd9La9S5B7kdu9kaWOnI"

echo "Creating test users for Playwright E2E tests..."
echo "=============================================="

# Function to create a user
create_user() {
  local email=$1
  local password=$2
  local full_name=$3

  echo ""
  echo "Creating user: $email"

  response=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
    -H "apikey: ${SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"${email}\",
      \"password\": \"${password}\",
      \"email_confirm\": true,
      \"user_metadata\": {
        \"full_name\": \"${full_name}\"
      }
    }")

  # Check if user was created successfully
  if echo "$response" | grep -q '"id"'; then
    user_id=$(echo "$response" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    echo "✅ Success! User created with ID: $user_id"
  else
    echo "❌ Error creating user:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
  fi
}

# Create the three test users
create_user "test-existing@piercedesk.test" "TestPassword123!" "Test Existing User"
create_user "test-single-org@piercedesk.test" "TestPassword123!" "Test Single Org User"
create_user "test-multi-org@piercedesk.test" "TestPassword123!" "Test Multi Org User"

echo ""
echo "=============================================="
echo "User creation complete!"
echo ""
echo "Next steps:"
echo "1. Verify users were created in Supabase Dashboard"
echo "2. Run the script to link users to organizations"
