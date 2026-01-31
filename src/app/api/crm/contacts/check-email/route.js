import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

// ============================================================================
// GET /api/crm/contacts/check-email?email=test@example.com
// Check if email exists in organization (for real-time validation)
// ============================================================================
export async function GET(request) {
  try {
    const supabase = createApiClient(request);

    // Validate JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get email from query params
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Get user's organization_id
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    let organizationId;

    if (!membership || !membership.organization_id) {
      // Fallback to metadata or test org
      const orgFromMetadata = user.user_metadata?.organization_id || user.app_metadata?.organization_id;

      if (orgFromMetadata) {
        organizationId = orgFromMetadata;
      } else {
        const { data: defaultOrg } = await supabase
          .from('organizations')
          .select('id')
          .eq('name', 'Acme Corporation')
          .maybeSingle();

        if (defaultOrg) {
          organizationId = defaultOrg.id;
        } else {
          return NextResponse.json(
            { error: 'User is not a member of any active organization' },
            { status: 400 }
          );
        }
      }
    } else {
      organizationId = membership.organization_id;
    }

    // Check if email exists in organization
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('email', email)
      .maybeSingle();

    return NextResponse.json({
      exists: !!existingContact,
      email: email,
    });

  } catch (error) {
    console.error('Error checking email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
