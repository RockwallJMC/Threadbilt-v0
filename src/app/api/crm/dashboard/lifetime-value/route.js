import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

/**
 * GET /api/crm/dashboard/lifetime-value
 * Returns customer lifetime value metrics
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

    // Current period - deals with lifetime_value
    const { data: currentDeals, error: currentError } = await supabase
      .from('deals')
      .select('lifetime_value, amount, contact_id')
      .eq('user_id', user.id)
      .gte('create_date', dateFrom)
      .lte('create_date', dateTo);

    if (currentError) throw currentError;

    // Previous period - deals with lifetime_value
    const { data: prevDeals, error: prevError } = await supabase
      .from('deals')
      .select('lifetime_value, amount')
      .eq('user_id', user.id)
      .gte('create_date', prevDateFrom)
      .lte('create_date', prevDateTo);

    if (prevError) throw prevError;

    // Calculate current metrics
    const uniqueCustomers = new Set(currentDeals.map(d => d.contact_id).filter(Boolean)).size;
    const totalRevenue = currentDeals.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
    const totalLTV = currentDeals.reduce((sum, d) => sum + parseFloat(d.lifetime_value || d.amount || 0), 0);
    const currentAvgLTV = uniqueCustomers > 0 ? totalLTV / uniqueCustomers : 0;

    // Calculate previous metrics
    const prevTotalLTV = prevDeals.reduce((sum, d) => sum + parseFloat(d.lifetime_value || d.amount || 0), 0);
    const prevUniqueCustomers = new Set(prevDeals.map(d => d.contact_id).filter(Boolean)).size;
    const prevAvgLTV = prevUniqueCustomers > 0 ? prevTotalLTV / prevUniqueCustomers : 0;

    // Calculate trend
    const trendPercentage = prevAvgLTV > 0
      ? (((currentAvgLTV - prevAvgLTV) / prevAvgLTV) * 100).toFixed(1)
      : 0;

    const trend = trendPercentage > 0 ? 'up' : trendPercentage < 0 ? 'down' : 'stable';

    return NextResponse.json({
      averageLTV: parseFloat(currentAvgLTV.toFixed(2)),
      totalCustomers: uniqueCustomers,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      trend
    });

  } catch (error) {
    console.error('Dashboard lifetime-value error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lifetime value data' },
      { status: 500 }
    );
  }
}
