import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

export async function GET(request, { params }) {
  try {
    const supabase = createApiClient(request);
    const { id } = await params;

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 403 });
    }

    // Fetch deal for context
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('stage, value, created_at, close_date')
      .eq('id', id)
      .eq('organization_id', userOrg.organization_id)
      .single();

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Calculate deal progress (based on stage)
    const stageOrder = {
      'lead': 0,
      'qualified': 20,
      'proposal': 40,
      'negotiation': 60,
      'closed_won': 100,
      'closed_lost': 0,
    };
    const dealProgress = stageOrder[deal.stage] || 0;

    // Calculate win/loss ratio for this organization (context metric)
    const { count: wonCount } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', userOrg.organization_id)
      .eq('stage', 'closed_won');

    const { count: lostCount } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', userOrg.organization_id)
      .eq('stage', 'closed_lost');

    const winRatePercentage = (wonCount + lostCount) > 0 
      ? ((wonCount / (wonCount + lostCount)) * 100).toFixed(1) 
      : null;

    // Calculate conversion rate (activities to deal value)
    const { data: activities } = await supabase
      .from('activities')
      .select('id')
      .eq('entity_type', 'opportunity')
      .eq('entity_id', id)
      .eq('organization_id', userOrg.organization_id);

    const activityCount = activities?.length || 1;
    const conversionRate = deal.value > 0 ? ((deal.value / activityCount) / 1000).toFixed(1) : 0;

    // Calculate engagement metrics (activities per week since creation)
    const createdDate = new Date(deal.created_at);
    const now = new Date();
    const weeksSinceCreation = Math.max(1, Math.floor((now - createdDate) / (7 * 24 * 60 * 60 * 1000)));
    const engagementMetrics = ((activityCount / weeksSinceCreation) * 10).toFixed(1);

    const analytics = {
      deal_progress: dealProgress,
      win_loss_ratio: winRatePercentage ? parseFloat(winRatePercentage) : null,
      conversion_rate: parseFloat(conversionRate),
      engagement_metrics: parseFloat(engagementMetrics),
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error fetching deal analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
