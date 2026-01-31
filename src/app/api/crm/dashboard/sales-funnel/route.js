import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

/**
 * GET /api/crm/dashboard/sales-funnel
 * Returns conversion rates between stages
 */
export async function GET(request) {
  try {
    const supabase = createApiClient(request);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all deals with stage info
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select('stage')
      .eq('user_id', user.id);

    if (dealsError) throw dealsError;

    // Define CRM pipeline stages
    const stages = ['Contact', 'MQL', 'SQL', 'Opportunity', 'Won', 'Lost'];
    const stageCounts = {};

    // Initialize all stages with 0
    stages.forEach(stage => {
      stageCounts[stage] = 0;
    });

    // Count deals per stage
    deals.forEach(deal => {
      if (stageCounts[deal.stage] !== undefined) {
        stageCounts[deal.stage]++;
      }
    });

    // Calculate conversion rates
    const totalDeals = deals.length || 1; // Prevent division by zero
    const funnelData = stages.map((stage, index) => {
      const count = stageCounts[stage];
      const conversionRate = parseFloat(((count / totalDeals) * 100).toFixed(1));

      return {
        stage,
        count,
        conversionRate
      };
    });

    return NextResponse.json(funnelData);

  } catch (error) {
    console.error('Dashboard sales-funnel error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales funnel data' },
      { status: 500 }
    );
  }
}
