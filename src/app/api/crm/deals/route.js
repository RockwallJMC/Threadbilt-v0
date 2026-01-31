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

// Helper: Transform contact to client format (template-aurora compatibility)
function transformDealForUI(deal) {
  if (!deal) return deal;

  const formatted = formatDealDecimals(deal);

  // Add client field from contact for template-aurora compatibility
  // Always add client field (even if contact is null) to prevent UI errors
  if (deal.contact) {
    formatted.client = {
      name: deal.contact.first_name && deal.contact.last_name
        ? `${deal.contact.first_name} ${deal.contact.last_name}`.trim()
        : deal.contact.first_name || deal.contact.last_name || deal.contact.email || 'Unknown',
      email: deal.contact.email || '',
      phone: deal.contact.phone || '',
      videoChat: '',
      address: '',
      link: '#!',
    };
  } else {
    // Provide default client when contact is null
    formatted.client = {
      name: 'No Contact',
      email: '',
      phone: '',
      videoChat: '',
      address: '',
      link: '#!',
    };
  }

  return formatted;
}

// ============================================================================
// GET /api/crm/deals
// Fetch all deals for authenticated user, grouped by stage
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

    // Fetch deals with joins (RLS handles organization filtering)
    const { data: deals, error } = await supabase
      .from('deals')
      .select(`
        *,
        company:companies(*),
        contact:crm_contacts(*)
      `)
      .order('stage_order', { ascending: true });

    if (error) {
      console.error('Error fetching deals:', error);
      return NextResponse.json(
        { error: 'Failed to fetch deals' },
        { status: 500 }
      );
    }

    // Transform deals and group by stage
    const grouped = {
      Contact: [],
      MQL: [],
      SQL: [],
      Opportunity: [],
      Won: [],
      Lost: []
    };

    deals.forEach(deal => {
      if (grouped[deal.stage]) {
        grouped[deal.stage].push(transformDealForUI(deal));
      }
    });

    return NextResponse.json(grouped);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/crm/deals
// Create new deal
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
    if (!body.name || !body.stage) {
      return NextResponse.json(
        { error: 'Missing required fields: name, stage' },
        { status: 400 }
      );
    }

    // Sanitize body - only allow specific fields (prevent user_id injection)
    const allowedFields = ['name', 'stage', 'company_id', 'contact_id', 'amount', 'priority', 'progress', 'close_date'];
    const sanitizedData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        sanitizedData[field] = body[field];
      }
    }

    // Calculate stage_order (append to end of stage, org-wide)
    const { data: existingDeals } = await supabase
      .from('deals')
      .select('stage_order')
      .eq('stage', sanitizedData.stage)
      .order('stage_order', { ascending: false })
      .limit(1);

    const newStageOrder = existingDeals && existingDeals.length > 0
      ? existingDeals[0].stage_order + 1
      : 0;

    // Insert deal with server-derived user_id (never trust client)
    const { data: newDeal, error } = await supabase
      .from('deals')
      .insert({
        ...sanitizedData,
        user_id: user.id,
        created_by: user.id,
        stage_order: newStageOrder
      })
      .select(`
        *,
        company:companies(*),
        contact:crm_contacts(*)
      `)
      .single();

    if (error) {
      console.error('Error creating deal:', error);
      return NextResponse.json(
        { error: 'Failed to create deal' },
        { status: 500 }
      );
    }

    return NextResponse.json(transformDealForUI(newDeal), { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
