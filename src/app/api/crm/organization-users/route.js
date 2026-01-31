import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

// ============================================================================
// GET /api/crm/organization-users
// Fetch all active users in the current user's organization
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

    // Fetch all active users in the organization
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, avatar_url')
      .eq('organization_id', organizationId)
      .order('full_name', { ascending: true });

    if (usersError) {
      console.error('Error fetching organization users:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch organization users' },
        { status: 500 }
      );
    }

    return NextResponse.json(users || []);

  } catch (error) {
    console.error('Error fetching organization users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
