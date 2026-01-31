import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

/**
 * GET /api/crm/dashboard/acquisition-cost
 * Returns cost per acquisition metrics
 */
export async function GET(request) {
  try {
    const supabase = createApiClient(request);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const dateTo = searchParams.get('dateTo') || new Date().toISOString();

    // Calculate previous period for trend
    const periodDuration = new Date(dateTo) - new Date(dateFrom);
    const prevDateFrom = new Date(new Date(dateFrom) - periodDuration).toISOString();
    const prevDateTo = dateFrom;

    // Current period - deals with acquisition_cost
    const { data: currentDeals, error: currentError } = await supabase
      .from('deals')
      .select('acquisition_cost')
      .eq('user_id', user.id)
      .gte('create_date', dateFrom)
      .lte('create_date', dateTo)
      .not('acquisition_cost', 'is', null);

    if (currentError) throw currentError;

    // Previous period - deals with acquisition_cost
    const { data: prevDeals, error: prevError } = await supabase
      .from('deals')
      .select('acquisition_cost')
      .eq('user_id', user.id)
      .gte('create_date', prevDateFrom)
      .lte('create_date', prevDateTo)
      .not('acquisition_cost', 'is', null);

    if (prevError) throw prevError;

    // Calculate totals
    const currentTotal = currentDeals.reduce((sum, d) => sum + parseFloat(d.acquisition_cost || 0), 0);
    const currentCount = currentDeals.length;
    const currentCPA = currentCount > 0 ? currentTotal / currentCount : 0;

    const prevTotal = prevDeals.reduce((sum, d) => sum + parseFloat(d.acquisition_cost || 0), 0);
    const prevCount = prevDeals.length;
    const prevCPA = prevCount > 0 ? prevTotal / prevCount : 0;

    // Calculate trend
    const trendPercentage = prevCPA > 0
      ? (((currentCPA - prevCPA) / prevCPA) * 100).toFixed(1)
      : 0;

    const trend = trendPercentage > 0 ? 'up' : trendPercentage < 0 ? 'down' : 'stable';

    return NextResponse.json({
      costPerAcquisition: parseFloat(currentCPA.toFixed(2)),
      totalCost: parseFloat(currentTotal.toFixed(2)),
      totalAcquisitions: currentCount,
      trend
    });

  } catch (error) {
    console.error('Dashboard acquisition-cost error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch acquisition cost data' },
      { status: 500 }
    );
  }
}
