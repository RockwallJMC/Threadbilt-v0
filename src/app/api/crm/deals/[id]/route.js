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

  // Ensure company exists with logo (prevent Image component errors)
  if (!formatted.company) {
    formatted.company = {
      logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Unknown',
      logo: 'https://api.dicebear.com/7.x/initials/svg?seed=Unknown',
      name: 'Unknown Company',
      link: '#!',
    };
  } else {
    // Generate DiceBear logo from company name if logo_url doesn't exist or is a local path
    const companyName = formatted.company.name || 'Company';
    const needsPlaceholder = !formatted.company.logo_url ||
                            formatted.company.logo_url.startsWith('/images/company-logo/');

    if (needsPlaceholder) {
      // Clean company name for URL (replace spaces with hyphens, remove special chars)
      const cleanName = companyName.replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
      const logoUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${cleanName}`;
      formatted.company.logo_url = logoUrl;
      formatted.company.logo = logoUrl;
    } else {
      // Map logo_url to logo for template-aurora compatibility
      formatted.company.logo = formatted.company.logo_url;
    }
  }

  return formatted;
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

    // Fetch deal with contact and company joins (RLS handles org filtering)
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
      ...transformDealForUI(deal),
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

    // Check if deal exists (RLS handles org filtering)
    const { data: existingDeal, error: fetchError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
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

    // Update deal (RLS handles org filtering)
    const { data: updatedDeal, error: updateError } = await supabase
      .from('deals')
      .update(sanitizedData)
      .eq('id', dealId)
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

    return NextResponse.json(transformDealForUI(updatedDeal));
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
