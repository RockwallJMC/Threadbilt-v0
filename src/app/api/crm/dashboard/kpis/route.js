import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

/**
 * GET /api/crm/dashboard/kpis
 * Returns 5 KPI metrics for dashboard cards
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

    // KPI 1: Active Users (contacts created in period)
    const { count: activeUsersCount, error: activeError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo);

    if (activeError) throw activeError;

    const avgDailyLogins = activeUsersCount || 0;

    // KPI 2: New Contacts
    const { count: newContactsCount, error: contactsError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo);

    if (contactsError) throw contactsError;

    // KPI 3: Renewal Rate (won deals / total closed deals * 100)
    const { count: wonDeals, error: wonError } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('stage', 'Won')
      .not('close_date', 'is', null);

    if (wonError) throw wonError;

    const { count: totalClosedDeals, error: closedError } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .not('close_date', 'is', null);

    if (closedError) throw closedError;

    const renewalRate = totalClosedDeals > 0
      ? Math.round((wonDeals / totalClosedDeals) * 100)
      : 0;

    // KPI 4 & 5: Inventory and Delivered (mock data for MVP - not CRM-specific)
    const inventory = 13200;
    const delivered = 1920;

    const kpis = [
      {
        title: 'Active Users',
        value: avgDailyLogins.toString(),
        subtitle: 'avg daily logins',
        icon: {
          name: 'solar:users-group-rounded-bold-duotone',
          color: 'primary'
        }
      },
      {
        title: 'New Contacts',
        value: (newContactsCount || 0).toString(),
        subtitle: 'accounts opened',
        icon: {
          name: 'solar:user-plus-rounded-bold-duotone',
          color: 'success'
        }
      },
      {
        title: 'Renewal Rate',
        value: renewalRate + '%',
        subtitle: 'premium accounts',
        icon: {
          name: 'solar:refresh-circle-bold-duotone',
          color: 'warning'
        }
      },
      {
        title: 'Inventory',
        value: inventory.toLocaleString(),
        subtitle: 'units in stock',
        icon: {
          name: 'solar:box-bold-duotone',
          color: 'info'
        }
      },
      {
        title: 'Delivered',
        value: delivered.toLocaleString(),
        subtitle: 'unit products',
        icon: {
          name: 'solar:delivery-bold-duotone',
          color: 'secondary'
        }
      }
    ];

    return NextResponse.json(kpis);

  } catch (error) {
    console.error('Dashboard KPIs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPIs' },
      { status: 500 }
    );
  }
}
