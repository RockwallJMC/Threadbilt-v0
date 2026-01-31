import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

/**
 * GET /api/crm/dashboard/active-users
 * Returns contact activity metrics
 */
export async function GET(request) {
  try {
    const supabase = createApiClient(request);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization_id
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    const organizationId = membership?.organization_id || user.user_metadata?.organization_id || user.app_metadata?.organization_id;

    if (!organizationId) {
      return NextResponse.json({ error: 'User is not a member of any active organization' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const dateTo = searchParams.get('dateTo') || new Date().toISOString();

    // Calculate previous period for trend
    const periodDuration = new Date(dateTo) - new Date(dateFrom);
    const prevDateFrom = new Date(new Date(dateFrom) - periodDuration).toISOString();
    const prevDateTo = dateFrom;

    // Get today, this week, this month dates
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Active today (contacts created today)
    const { count: activeToday, error: todayError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('created_at', todayStart)
      .lte('created_at', now.toISOString());

    if (todayError) throw todayError;

    // Active this week
    const { count: activeThisWeek, error: weekError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('created_at', weekStart)
      .lte('created_at', now.toISOString());

    if (weekError) throw weekError;

    // Active this month
    const { count: activeThisMonth, error: monthError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('created_at', monthStart)
      .lte('created_at', now.toISOString());

    if (monthError) throw monthError;

    // Calculate trend (compare current period to previous period)
    const { count: prevActiveCount, error: prevError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('created_at', prevDateFrom)
      .lte('created_at', prevDateTo);

    if (prevError) throw prevError;
    const trendPercentage = prevActiveCount > 0
      ? (((activeThisMonth - prevActiveCount) / prevActiveCount) * 100).toFixed(1)
      : 0;

    const trend = trendPercentage > 0 ? 'up' : trendPercentage < 0 ? 'down' : 'stable';

    return NextResponse.json({
      activeToday,
      activeThisWeek,
      activeThisMonth,
      trend
    });

  } catch (error) {
    console.error('Dashboard active-users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active users data' },
      { status: 500 }
    );
  }
}
