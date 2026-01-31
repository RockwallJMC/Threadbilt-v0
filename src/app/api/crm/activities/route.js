import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

// ============================================================================
// GET /api/crm/activities
// Fetch activities filtered by entity_type and entity_id
// Optional: filter by activity_type
// ============================================================================
export async function GET(request) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entity_type');
    const entityId = searchParams.get('entity_id');
    const activityType = searchParams.get('activity_type');

    // Validate required params
    if (!entityId) {
      return NextResponse.json(
        { error: 'Missing required parameter: entity_id' },
        { status: 400 }
      );
    }

    // Build query with RLS-enforced organization_id filtering
    let query = supabase
      .from('activities')
      .select('*')
      .eq('entity_type', entityType || 'contact')
      .eq('entity_id', entityId)
      .order('activity_date', { ascending: false });

    // Optional activity_type filter
    if (activityType) {
      query = query.eq('activity_type', activityType);
    }

    const { data: activities, error } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
      return NextResponse.json(
        { error: 'Failed to fetch activities' },
        { status: 500 }
      );
    }

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/crm/activities
// Create new activity with entity_type='contact'
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

    // Validate required fields
    if (!body.entity_id || !body.activity_type || !body.subject) {
      return NextResponse.json(
        { error: 'Missing required fields: entity_id, activity_type, subject' },
        { status: 400 }
      );
    }

    // Get user's organization_id from contacts table (activities are org-scoped)
    // We'll use the first contact to determine the organization
    const { data: contact } = await supabase
      .from('contacts')
      .select('organization_id')
      .eq('id', body.entity_id)
      .single();

    if (!contact) {
      return NextResponse.json(
        { error: 'Invalid entity_id: contact not found' },
        { status: 400 }
      );
    }

    // Sanitize body - only allow specific fields
    const allowedFields = [
      'entity_id',
      'activity_type',
      'subject',
      'description',
      'activity_date',
      'duration_minutes',
      'outcome',
      'next_action',
    ];
    const sanitizedData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        sanitizedData[field] = body[field];
      }
    }

    // Auto-set fields
    sanitizedData.entity_type = 'contact'; // Always 'contact' for this endpoint
    sanitizedData.organization_id = contact.organization_id;
    sanitizedData.created_by = user.id;

    // Default activity_date to now if not provided
    if (!sanitizedData.activity_date) {
      sanitizedData.activity_date = new Date().toISOString();
    }

    // Insert activity
    const { data: newActivity, error } = await supabase
      .from('activities')
      .insert(sanitizedData)
      .select()
      .single();

    if (error) {
      console.error('Error creating activity:', error);
      return NextResponse.json(
        { error: 'Failed to create activity' },
        { status: 500 }
      );
    }

    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
