import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

// ============================================================================
// POST /api/crm/contacts
// Create new contact with comprehensive form data
// ============================================================================
export async function POST(request) {
  try {
    const supabase = createApiClient(request);

    // Validate JWT token server-side (more secure than getSession)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields from form structure
    if (!body.personalInfo || !body.companyInfo || !body.leadInfo) {
      return NextResponse.json(
        { error: 'Missing required sections: personalInfo, companyInfo, leadInfo' },
        { status: 400 }
      );
    }

    const { personalInfo, companyInfo, leadInfo } = body;

    // Validate required personal info fields
    if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.workEmail || !personalInfo.phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required personal fields: firstName, lastName, workEmail, phoneNumber' },
        { status: 400 }
      );
    }

    // Validate required company info fields
    if (!companyInfo.companyName || !companyInfo.industryType) {
      return NextResponse.json(
        { error: 'Missing required company fields: companyName, industryType' },
        { status: 400 }
      );
    }

    // Validate required lead info fields
    if (!leadInfo.source || !leadInfo.status) {
      return NextResponse.json(
        { error: 'Missing required lead fields: source, status' },
        { status: 400 }
      );
    }

    // Get user's organization_id from organization_members
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (membershipError) {
      console.error('Error fetching organization membership:', membershipError);
    }

    let organizationId;

    if (!membership || !membership.organization_id) {
      // Fallback 1: Try to get from user metadata
      const orgFromMetadata = user.user_metadata?.organization_id || user.app_metadata?.organization_id;

      if (orgFromMetadata) {
        organizationId = orgFromMetadata;
      } else {
        // Fallback 2: For test users without membership, use Acme Corp (test org)
        // This handles users created via Supabase auth UI for testing
        // In production, all users should have proper organization_members records
        const { data: defaultOrg } = await supabase
          .from('organizations')
          .select('id')
          .eq('name', 'Acme Corporation')
          .maybeSingle();

        if (defaultOrg) {
          organizationId = defaultOrg.id;
          console.warn(`User ${user.email} has no organization membership, using default test org`);
        } else {
          return NextResponse.json(
            { error: 'User is not a member of any active organization', details: { userId: user.id } },
            { status: 400 }
          );
        }
      }
    } else {
      organizationId = membership.organization_id;
    }

    // Check for duplicate work email (contacts.email)
    // Using organization_id for filtering (multi-tenant isolation)
    const { data: existingWorkEmail } = await supabase
      .from('contacts')
      .select('id, email')
      .eq('organization_id', organizationId)
      .eq('email', personalInfo.workEmail)
      .maybeSingle();

    if (existingWorkEmail) {
      return NextResponse.json(
        { error: 'Contact with this work email already exists' },
        { status: 409 }
      );
    }

    // Check for duplicate personal email if provided
    if (personalInfo.personalEmail) {
      const { data: existingPersonalEmail } = await supabase
        .from('contacts')
        .select('id, personal_email')
        .eq('organization_id', organizationId)
        .eq('personal_email', personalInfo.personalEmail)
        .maybeSingle();

      if (existingPersonalEmail) {
        return NextResponse.json(
          { error: 'Contact with this personal email already exists' },
          { status: 409 }
        );
      }
    }

    // Handle account creation/linking (CRM uses accounts, not companies)
    let accountId;

    // Check if account exists in the current organization (multi-tenant isolation)
    const { data: existingAccount } = await supabase
      .from('accounts')
      .select('id, name')
      .eq('name', companyInfo.companyName)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (existingAccount) {
      // Link to existing account
      accountId = existingAccount.id;
    } else {
      // Create new account with all company data
      // Map form fields to accounts table structure
      const accountData = {
        name: companyInfo.companyName,
        organization_id: organizationId,
        industry: companyInfo.industryType,
        founding_year: companyInfo.foundingYear ? parseInt(companyInfo.foundingYear, 10) : null,
        phone: companyInfo.contact?.phoneNumber || null,
        email: companyInfo.contact?.officialEmail || null,
        website: companyInfo.website || null,
        logo_url: companyInfo.avatar || null, // Store uploaded logo URL
        notes: companyInfo.note || null,
        // Map address fields to jsonb structure
        address: {
          street: companyInfo.contact?.streetAddress || null,
          city: companyInfo.contact?.city || null,
          state: companyInfo.contact?.state || null,
          country: companyInfo.contact?.country || null,
          zipCode: companyInfo.contact?.zipCode || null,
        },
        created_by: user.id,
      };

      const { data: newAccount, error: accountError } = await supabase
        .from('accounts')
        .insert(accountData)
        .select()
        .single();

      if (accountError) {
        console.error('Error creating account:', JSON.stringify(accountError, null, 2));
        console.error('Account data attempted:', JSON.stringify(accountData, null, 2));
        return NextResponse.json(
          { error: 'Failed to create account', details: accountError.message || accountError },
          { status: 500 }
        );
      }

      accountId = newAccount.id;
    }

    // Resolve assignedAgent email to user_id if provided
    let assignedToUserId = null;
    if (leadInfo.assignedAgent) {
      const { data: assignedUser } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', leadInfo.assignedAgent)
        .eq('organization_id', organizationId)
        .maybeSingle();

      assignedToUserId = assignedUser?.id || null;
    }

    // Create contact record with all mapped fields
    // Migration 003 fields ARE available and being used
    const contactData = {
      organization_id: organizationId, // Multi-tenant isolation
      account_id: accountId, // Link to account (contacts.account_id → accounts.id)

      // Personal info mapping
      first_name: personalInfo.firstName,
      last_name: personalInfo.lastName,
      email: personalInfo.workEmail, // workEmail → email
      personal_email: personalInfo.personalEmail || null,
      phone: personalInfo.phoneNumber,
      alternate_phone: personalInfo.alternatePhoneNumber || null,
      mobile: personalInfo.alternatePhoneNumber || null, // Keep for backwards compat
      date_of_birth: personalInfo.dateOfBirth || null,
      title: personalInfo.jobTitle || null,
      status: personalInfo.status || null,
      linkedin_url: personalInfo.linkedInUrl || null,
      profile_image_url: personalInfo.profileImage || null, // Uploaded avatar URL
      notes: personalInfo.note || null,

      // Lead info mapping
      lead_source: leadInfo.source || null,
      lead_status: leadInfo.status || null,
      priority: leadInfo.priority || null,
      tags: leadInfo.tags || [],

      // Metadata
      is_primary: true, // Default to primary contact
      created_by: user.id, // Track who created this contact
    };

    // Insert contact with account join
    const { data: newContact, error: contactError } = await supabase
      .from('contacts')
      .insert(contactData)
      .select(`
        *,
        account:accounts(*)
      `)
      .single();

    if (contactError) {
      console.error('Error creating contact:', JSON.stringify(contactError, null, 2));
      console.error('Contact data attempted:', JSON.stringify(contactData, null, 2));
      return NextResponse.json(
        { error: 'Failed to create contact', details: contactError.message || contactError },
        { status: 500 }
      );
    }

    return NextResponse.json(newContact, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
