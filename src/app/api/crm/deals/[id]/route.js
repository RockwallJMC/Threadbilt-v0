import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

// Helper: Format decimal fields as strings with 2 decimal places
function formatDealDecimals(deal) {
  if (!deal) return deal;
  return {
    ...deal,
    amount: deal.amount != null ? Number(deal.amount).toFixed(2) : null
  };
}

// ============================================================================
// GET /api/crm/deals/[id]
// Fetch single deal with nested data (contact, company, collaborators, activities)
// ============================================================================
export async function GET(request, { params }) {
  try {
    const supabase = createApiClient(request);

    // Validate JWT token server-side
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const dealId = (await params).id;

    // Fetch deal with contact and company joins
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select(`
        *,
        contact:crm_contacts!deals_contact_id_fkey (
          *,
          company:companies!crm_contacts_company_id_fkey (
            *
          )
        )
      `)
      .eq('id', dealId)
      .eq('user_id', user.id)
      .single();

    if (dealError || !deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Fetch company with ALL deals (not just this one)
    const { data: companyDeals } = await supabase
      .from('deals')
      .select('*')
      .eq('company_id', deal.contact?.company?.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Fetch deal collaborators grouped by role
    const { data: collaborators } = await supabase
      .from('deal_collaborators')
      .select(`
        role,
        user:user_profiles!deal_collaborators_user_id_fkey (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('deal_id', dealId)
      .eq('organization_id', deal.organization_id);

    // Group collaborators by role
    const collaboratorsByRole = {
      owner: collaborators?.find(c => c.role === 'owner')?.user || null,
      collaborators: collaborators?.filter(c => c.role === 'collaborator').map(c => c.user) || [],
      followers: collaborators?.filter(c => c.role === 'follower').map(c => c.user) || [],
    };

    // Fetch activity summary (counts by type)
    const { data: activities } = await supabase
      .from('activities')
      .select('activity_type')
      .eq('entity_type', 'opportunity')
      .eq('entity_id', dealId)
      .eq('organization_id', deal.organization_id);

    const activitySummary = {
      total: activities?.length || 0,
      by_type: activities?.reduce((acc, activity) => {
        acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
        return acc;
      }, {}) || {},
    };

    // Construct response with nested data
    const response = {
      ...formatDealDecimals(deal),
      company: {
        ...deal.contact?.company,
        deals: companyDeals || [],
      },
      collaborators: collaboratorsByRole,
      activity_summary: activitySummary,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching deal details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH /api/crm/deals/[id]
// Update existing deal
// ============================================================================
export async function PATCH(request, { params }) {
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

    const dealId = (await params).id;
    const body = await request.json();

    // Check if deal exists with explicit user filter (RLS + defense-in-depth)
    const { data: existingDeal, error: fetchError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingDeal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Sanitize body - only allow specific fields (prevent user_id injection)
    const allowedFields = ['name', 'stage', 'stage_order', 'company_id', 'contact_id', 'amount', 'priority', 'progress', 'close_date'];
    const sanitizedData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        sanitizedData[field] = body[field];
      }
    }

    // Validate enum and numeric fields (defense-in-depth)
    if (sanitizedData.stage !== undefined) {
      const allowedStages = ['Contact', 'MQL', 'SQL', 'Opportunity', 'Won', 'Lost'];
      if (typeof sanitizedData.stage !== 'string' || !allowedStages.includes(sanitizedData.stage)) {
        return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
      }
    }

    if (sanitizedData.stage_order !== undefined) {
      const stageOrderNumber = Number(sanitizedData.stage_order);
      if (!Number.isInteger(stageOrderNumber) || stageOrderNumber < 0) {
        return NextResponse.json({ error: 'Invalid stage_order' }, { status: 400 });
      }
      sanitizedData.stage_order = stageOrderNumber;
    }

    if (sanitizedData.progress !== undefined) {
      const progressNumber = Number(sanitizedData.progress);
      if (!Number.isFinite(progressNumber) || progressNumber < 0 || progressNumber > 100) {
        return NextResponse.json({ error: 'Invalid progress' }, { status: 400 });
      }
      sanitizedData.progress = progressNumber;
    }

    if (sanitizedData.amount !== undefined) {
      const amountNumber = Number(sanitizedData.amount);
      if (!Number.isFinite(amountNumber) || amountNumber < 0) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
      }
      sanitizedData.amount = amountNumber;
    }

    // Basic string validation to mitigate injection-style payloads
    const stringFields = ['name', 'priority'];
    for (const field of stringFields) {
      if (sanitizedData[field] !== undefined) {
        if (typeof sanitizedData[field] !== 'string') {
          return NextResponse.json({ error: `Invalid type for ${field}` }, { status: 400 });
        }
        if (sanitizedData[field].length > 1024) {
          return NextResponse.json({ error: `${field} is too long` }, { status: 400 });
        }
      }
    }

    // Add last_update timestamp
    sanitizedData.last_update = new Date().toISOString();

    // Update deal with explicit user filter
    const { data: updatedDeal, error: updateError } = await supabase
      .from('deals')
      .update(sanitizedData)
      .eq('id', dealId)
      .eq('user_id', user.id)
      .select(`
        *,
        company:companies(*),
        contact:crm_contacts(*)
      `)
      .single();

    if (updateError) {
      console.error('Error updating deal:', updateError);
      return NextResponse.json(
        { error: 'Failed to update deal' },
        { status: 500 }
      );
    }

    return NextResponse.json(formatDealDecimals(updatedDeal));
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
