import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

/**
 * GET /api/crm/dashboard/lead-sources
 * Returns contact distribution by source (not deals - contacts have sources in CRM)
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

    // Fetch contacts grouped by lead_source
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('lead_source')
      .eq('user_id', user.id)
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo);

    if (contactsError) throw contactsError;

    // Group and count by lead_source
    const sourceMap = new Map();
    contacts.forEach(contact => {
      const source = contact.lead_source || 'Unknown';
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    });

    // Convert to array format for chart
    const leadSources = Array.from(sourceMap.entries())
      .map(([source, count]) => ({
        source,
        count
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending

    return NextResponse.json(leadSources);

  } catch (error) {
    console.error('Dashboard lead-sources error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead sources' },
      { status: 500 }
    );
  }
}
