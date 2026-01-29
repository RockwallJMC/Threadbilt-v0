'use client';

import createClient from 'lib/supabase/client';
import useSWR from 'swr';

/**
 * Fetch dashboard KPI metrics (last 30 days)
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with KPI data
 */
export const useDashboardKPIs = (config) => {
  const fetcher = async () => {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Not authenticated');
    }

    // Calculate date range (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch opportunities (last 30 days)
    const { data: opportunities, error: oppsError } = await supabase
      .from('opportunities')
      .select('value, stage, created_at, close_date')
      .is('deleted_at', null)
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (oppsError) throw new Error(oppsError.message);

    // Fetch proposals count (last 30 days)
    const { count: proposalsCount, error: proposalsError } = await supabase
      .from('proposals')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (proposalsError) throw new Error(proposalsError.message);

    // Fetch leads for conversion rate
    const { count: totalLeads, error: leadsError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (leadsError) throw new Error(leadsError.message);

    // Calculate metrics client-side
    const totalPipeline = opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);

    const closedWon = opportunities.filter((opp) => opp.stage === 'Closed Won');
    const winRate =
      opportunities.length > 0 ? (closedWon.length / opportunities.length) * 100 : 0;

    const avgDealSize =
      closedWon.length > 0
        ? closedWon.reduce((sum, opp) => sum + (opp.value || 0), 0) / closedWon.length
        : 0;

    // Calculate average sales cycle (days from created to closed)
    const salesCycles = closedWon
      .filter((opp) => opp.close_date && opp.created_at)
      .map((opp) => {
        const created = new Date(opp.created_at);
        const closed = new Date(opp.close_date);
        return (closed - created) / (1000 * 60 * 60 * 24); // Convert to days
      });
    const avgSalesCycle =
      salesCycles.length > 0
        ? salesCycles.reduce((sum, days) => sum + days, 0) / salesCycles.length
        : 0;

    const activeOpportunities = opportunities.filter(
      (opp) => !['Closed Won', 'Closed Lost'].includes(opp.stage)
    ).length;

    const leadConversionRate = totalLeads > 0 ? (opportunities.length / totalLeads) * 100 : 0;

    return {
      total_pipeline: totalPipeline,
      win_rate: winRate.toFixed(1),
      avg_deal_size: avgDealSize.toFixed(0),
      avg_sales_cycle: avgSalesCycle.toFixed(0),
      active_opportunities: activeOpportunities,
      proposals_sent: proposalsCount || 0,
      lead_conversion_rate: leadConversionRate.toFixed(1),
    };
  };

  return useSWR('dashboard/kpis', fetcher, {
    suspense: false,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    refreshInterval: 60000, // Refresh every minute
    ...config,
  });
};

/**
 * Fetch pipeline breakdown by stage (last 30 days)
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with pipeline stage data
 */
export const usePipelineBreakdown = (config) => {
  const fetcher = async () => {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Not authenticated');
    }

    // Calculate date range (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch active opportunities (last 30 days)
    const { data, error } = await supabase
      .from('opportunities')
      .select('stage, value')
      .is('deleted_at', null)
      .not('stage', 'in', '("Closed Won","Closed Lost")')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (error) throw new Error(error.message);

    // Group by stage and aggregate
    const stageBreakdown = data.reduce((acc, opp) => {
      const stage = opp.stage;
      if (!acc[stage]) {
        acc[stage] = { stage, value: 0, count: 0 };
      }
      acc[stage].value += opp.value || 0;
      acc[stage].count += 1;
      return acc;
    }, {});

    // Convert to array and sort by predefined stage order
    const stageOrder = {
      Qualification: 1,
      'Needs Analysis': 2,
      Proposal: 3,
      Negotiation: 4,
      'Verbal Commit': 5,
      Contracting: 6,
    };

    return Object.values(stageBreakdown).sort(
      (a, b) => (stageOrder[a.stage] || 999) - (stageOrder[b.stage] || 999)
    );
  };

  return useSWR('dashboard/pipeline', fetcher, {
    suspense: false,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    refreshInterval: 60000,
    ...config,
  });
};

/**
 * Fetch opportunity trend over time (last 30 days)
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with time series data
 */
export const useOpportunityTrend = (config) => {
  const fetcher = async () => {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Not authenticated');
    }

    // Calculate date range (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch all opportunities (last 30 days) with stage info
    const { data, error } = await supabase
      .from('opportunities')
      .select('created_at, stage, value')
      .is('deleted_at', null)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);

    // Group by date and calculate daily metrics
    const trendData = {};
    data.forEach((opp) => {
      const date = opp.created_at.split('T')[0]; // YYYY-MM-DD
      if (!trendData[date]) {
        trendData[date] = { date, created: 0, won: 0, lost: 0, value: 0 };
      }
      trendData[date].created += 1;
      if (opp.stage === 'Closed Won') trendData[date].won += 1;
      if (opp.stage === 'Closed Lost') trendData[date].lost += 1;
      trendData[date].value += opp.value || 0;
    });

    return Object.values(trendData);
  };

  return useSWR('dashboard/opportunity-trend', fetcher, {
    suspense: false,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    refreshInterval: 60000,
    ...config,
  });
};

/**
 * Fetch lead source performance metrics (last 30 days)
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with lead source data
 */
export const useLeadSourcePerformance = (config) => {
  const fetcher = async () => {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Not authenticated');
    }

    // Calculate date range (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch leads (last 30 days)
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, source')
      .is('deleted_at', null)
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (leadsError) throw new Error(leadsError.message);

    // Fetch opportunities with lead_id
    const { data: opportunities, error: oppsError } = await supabase
      .from('opportunities')
      .select('lead_id, stage, value')
      .is('deleted_at', null)
      .not('lead_id', 'is', null);

    if (oppsError) throw new Error(oppsError.message);

    // Build lead_id to source mapping
    const leadSourceMap = {};
    leads.forEach((lead) => {
      leadSourceMap[lead.id] = lead.source || 'Unknown';
    });

    // Group by source and calculate metrics
    const sourcePerformance = {};
    leads.forEach((lead) => {
      const source = lead.source || 'Unknown';
      if (!sourcePerformance[source]) {
        sourcePerformance[source] = {
          source,
          leads: 0,
          opportunities: 0,
          won: 0,
          revenue: 0,
        };
      }
      sourcePerformance[source].leads += 1;
    });

    // Add opportunity metrics
    opportunities.forEach((opp) => {
      const source = leadSourceMap[opp.lead_id] || 'Unknown';
      if (sourcePerformance[source]) {
        sourcePerformance[source].opportunities += 1;
        if (opp.stage === 'Closed Won') {
          sourcePerformance[source].won += 1;
          sourcePerformance[source].revenue += opp.value || 0;
        }
      }
    });

    // Calculate conversion rate and avg deal size
    const result = Object.values(sourcePerformance).map((source) => ({
      ...source,
      conversion_rate: source.leads > 0 ? (source.opportunities / source.leads) * 100 : 0,
      avg_deal_size: source.won > 0 ? source.revenue / source.won : 0,
    }));

    // Sort by revenue descending
    return result.sort((a, b) => b.revenue - a.revenue);
  };

  return useSWR('dashboard/lead-source-performance', fetcher, {
    suspense: false,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    refreshInterval: 60000,
    ...config,
  });
};

/**
 * Fetch recent activity timeline
 * @param {number} limit - Number of activities to return (default: 10)
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with recent activities
 */
export const useRecentActivities = (limit = 10, config) => {
  const fetcher = async () => {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Not authenticated');
    }

    // NOTE: Activities table doesn't exist yet - return empty array placeholder
    // Future implementation will query activities table with user joins
    return [];
  };

  return useSWR(['dashboard/recent-activities', limit], fetcher, {
    suspense: false,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    refreshInterval: 60000,
    ...config,
  });
};

/**
 * Fetch proposal status breakdown (last 30 days)
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with proposal status data
 */
export const useProposalStatusBreakdown = (config) => {
  const fetcher = async () => {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Not authenticated');
    }

    // Calculate date range (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch proposals (last 30 days)
    const { data, error } = await supabase
      .from('proposals')
      .select('status, total_amount')
      .is('deleted_at', null)
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (error) throw new Error(error.message);

    // Group by status and aggregate
    const statusBreakdown = data.reduce((acc, proposal) => {
      const status = proposal.status;
      if (!acc[status]) {
        acc[status] = { status, count: 0, value: 0 };
      }
      acc[status].count += 1;
      acc[status].value += proposal.total_amount || 0;
      return acc;
    }, {});

    // Convert to array and sort by predefined status order
    const statusOrder = { draft: 1, sent: 2, accepted: 3, rejected: 4, expired: 5 };

    return Object.values(statusBreakdown).sort(
      (a, b) => (statusOrder[a.status] || 999) - (statusOrder[b.status] || 999)
    );
  };

  return useSWR('dashboard/proposal-status', fetcher, {
    suspense: false,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    refreshInterval: 60000,
    ...config,
  });
};

/**
 * Fetch top opportunities by value
 * @param {number} limit - Number of opportunities to return (default: 5)
 * @param {string} orderBy - Order field (default: 'value')
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with top opportunities
 */
export const useTopOpportunities = (limit = 5, orderBy = 'value', config) => {
  const fetcher = async () => {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Not authenticated');
    }

    // Validate orderBy to prevent SQL injection
    const validOrderFields = ['value', 'probability', 'expected_close_date'];
    const safeOrderBy = validOrderFields.includes(orderBy) ? orderBy : 'value';

    // Fetch top opportunities with account and owner joins
    const { data, error } = await supabase
      .from('opportunities')
      .select(
        `
        id,
        name,
        value,
        stage,
        probability,
        expected_close_date,
        account:accounts(name),
        owner:user_profiles(full_name)
      `
      )
      .is('deleted_at', null)
      .not('stage', 'in', '("Closed Won","Closed Lost")')
      .order(safeOrderBy, { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);

    // Format response (flatten nested objects)
    return data.map((opp) => ({
      id: opp.id,
      name: opp.name,
      account: opp.account?.name || 'Unknown',
      value: opp.value,
      stage: opp.stage,
      probability: opp.probability,
      expected_close_date: opp.expected_close_date,
      owner: opp.owner?.full_name || 'Unassigned',
    }));
  };

  return useSWR(['dashboard/top-opportunities', limit, orderBy], fetcher, {
    suspense: false,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    refreshInterval: 60000,
    ...config,
  });
};

/**
 * Fetch conversion funnel metrics (last 30 days)
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with funnel data
 */
export const useConversionFunnel = (config) => {
  const fetcher = async () => {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Not authenticated');
    }

    // Calculate date range (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch all leads (last 30 days)
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, status')
      .is('deleted_at', null)
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (leadsError) throw new Error(leadsError.message);

    // Fetch all opportunities with lead_id
    const { data: opportunities, error: oppsError } = await supabase
      .from('opportunities')
      .select('id, lead_id, stage')
      .is('deleted_at', null)
      .not('lead_id', 'is', null);

    if (oppsError) throw new Error(oppsError.message);

    // Fetch all proposals with opportunity_id
    const { data: proposals, error: proposalsError } = await supabase
      .from('proposals')
      .select('id, opportunity_id')
      .is('deleted_at', null)
      .not('opportunity_id', 'is', null);

    if (proposalsError) throw new Error(proposalsError.message);

    // Calculate funnel metrics
    const totalLeads = leads.length;
    const qualifiedLeads = leads.filter((l) =>
      ['qualified', 'converted'].includes(l.status)
    ).length;
    const totalOpportunities = opportunities.length;
    const totalProposals = proposals.length;
    const won = opportunities.filter((o) => o.stage === 'Closed Won').length;

    // Build funnel stages with percentages
    return [
      {
        stage: 'Leads',
        count: totalLeads,
        percentage: 100.0,
      },
      {
        stage: 'Qualified Leads',
        count: qualifiedLeads,
        percentage: totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0,
      },
      {
        stage: 'Opportunities',
        count: totalOpportunities,
        percentage: totalLeads > 0 ? (totalOpportunities / totalLeads) * 100 : 0,
      },
      {
        stage: 'Proposals',
        count: totalProposals,
        percentage: totalLeads > 0 ? (totalProposals / totalLeads) * 100 : 0,
      },
      {
        stage: 'Won',
        count: won,
        percentage: totalLeads > 0 ? (won / totalLeads) * 100 : 0,
      },
    ];
  };

  return useSWR('dashboard/conversion-funnel', fetcher, {
    suspense: false,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    refreshInterval: 60000,
    ...config,
  });
};

/**
 * Fetch lead analytics metrics (last 30 days)
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with lead metrics data
 */
export const useLeadMetrics = (config) => {
  const fetcher = async () => {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Not authenticated');
    }

    // Calculate date range (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch all leads (last 30 days)
    const { data, error } = await supabase
      .from('leads')
      .select('status')
      .is('deleted_at', null)
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (error) throw new Error(error.message);

    // Calculate metrics
    const totalLeads = data.length;
    const newLeads = data.filter((l) => l.status === 'new').length;
    const contacted = data.filter((l) => l.status === 'contacted').length;
    const qualified = data.filter((l) => l.status === 'qualified').length;
    const converted = data.filter((l) => l.status === 'converted').length;
    const unqualified = data.filter((l) => l.status === 'unqualified').length;

    const conversionRate = totalLeads > 0 ? (converted / totalLeads) * 100 : 0;

    return {
      total_leads: totalLeads,
      new: newLeads,
      contacted,
      qualified,
      converted,
      unqualified,
      conversion_rate: conversionRate.toFixed(1),
    };
  };

  return useSWR('dashboard/lead-metrics', fetcher, {
    suspense: false,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    refreshInterval: 60000,
    ...config,
  });
};

/**
 * Fetch top performing accounts by opportunity value
 * @param {number} limit - Number of accounts to return (default: 5)
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with top accounts data
 */
export const useTopAccounts = (limit = 5, config) => {
  const fetcher = async () => {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Not authenticated');
    }

    // Fetch all accounts with active opportunities
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('id, name')
      .is('deleted_at', null);

    if (accountsError) throw new Error(accountsError.message);

    // Fetch all opportunities
    const { data: opportunities, error: oppsError } = await supabase
      .from('opportunities')
      .select('account_id, value')
      .is('deleted_at', null)
      .not('stage', 'in', '("Closed Won","Closed Lost")');

    if (oppsError) throw new Error(oppsError.message);

    // Group opportunities by account and calculate metrics
    const accountMetrics = {};
    opportunities.forEach((opp) => {
      if (!accountMetrics[opp.account_id]) {
        accountMetrics[opp.account_id] = {
          opportunity_count: 0,
          total_value: 0,
        };
      }
      accountMetrics[opp.account_id].opportunity_count += 1;
      accountMetrics[opp.account_id].total_value += opp.value || 0;
    });

    // Build result with account names
    const result = accounts
      .filter((account) => accountMetrics[account.id])
      .map((account) => ({
        id: account.id,
        name: account.name,
        opportunity_count: accountMetrics[account.id].opportunity_count,
        total_value: accountMetrics[account.id].total_value,
      }))
      .sort((a, b) => b.total_value - a.total_value)
      .slice(0, limit);

    return result;
  };

  return useSWR(['dashboard/top-accounts', limit], fetcher, {
    suspense: false,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    refreshInterval: 60000,
    ...config,
  });
};

/**
 * Fetch sales velocity metrics - average time in each stage (last 30 days)
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with stage velocity data
 */
export const useDashboardSalesVelocity = (config) => {
  const fetcher = async () => {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Not authenticated');
    }

    // Calculate date range (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch all opportunities (last 30 days) with stage timestamps
    const { data, error } = await supabase
      .from('opportunities')
      .select('stage, created_at, updated_at, close_date')
      .is('deleted_at', null)
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (error) throw new Error(error.message);

    // Group by stage and calculate average time
    // Note: Without stage_changed_at timestamps, we estimate using created_at and updated_at
    const stageMetrics = {};
    data.forEach((opp) => {
      const stage = opp.stage;
      if (!stageMetrics[stage]) {
        stageMetrics[stage] = { stage, total_days: 0, count: 0 };
      }

      // Estimate time in stage based on available timestamps
      let daysInStage = 0;
      if (opp.close_date) {
        // Closed opportunity: use close_date as end time
        const created = new Date(opp.created_at);
        const closed = new Date(opp.close_date);
        daysInStage = (closed - created) / (1000 * 60 * 60 * 24);
      } else {
        // Active opportunity: use updated_at as proxy for time in current stage
        const created = new Date(opp.created_at);
        const updated = new Date(opp.updated_at);
        daysInStage = (updated - created) / (1000 * 60 * 60 * 24);
      }

      stageMetrics[stage].total_days += daysInStage;
      stageMetrics[stage].count += 1;
    });

    // Calculate averages and format response
    const result = Object.values(stageMetrics).map((metric) => ({
      stage: metric.stage,
      avg_days: metric.count > 0 ? (metric.total_days / metric.count).toFixed(1) : 0,
      count: metric.count,
    }));

    // Sort by predefined stage order
    const stageOrder = {
      Qualification: 1,
      'Needs Analysis': 2,
      Proposal: 3,
      Negotiation: 4,
      'Verbal Commit': 5,
      Contracting: 6,
      'Closed Won': 7,
      'Closed Lost': 8,
    };

    return result.sort((a, b) => (stageOrder[a.stage] || 999) - (stageOrder[b.stage] || 999));
  };

  return useSWR('dashboard/sales-velocity', fetcher, {
    suspense: false,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    refreshInterval: 60000,
    ...config,
  });
};

/**
 * Fetch win/loss analysis metrics (last 30 days)
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with win/loss data
 */
export const useDashboardWinLossAnalysis = (config) => {
  const fetcher = async () => {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Not authenticated');
    }

    // Calculate date range (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch closed opportunities (last 30 days)
    const { data, error } = await supabase
      .from('opportunities')
      .select('stage, value, close_reason')
      .is('deleted_at', null)
      .in('stage', ['Closed Won', 'Closed Lost'])
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (error) throw new Error(error.message);

    // Calculate win/loss metrics
    const won = data.filter((opp) => opp.stage === 'Closed Won');
    const lost = data.filter((opp) => opp.stage === 'Closed Lost');

    const wonCount = won.length;
    const lostCount = lost.length;
    const totalClosed = wonCount + lostCount;

    const wonValue = won.reduce((sum, opp) => sum + (opp.value || 0), 0);
    const lostValue = lost.reduce((sum, opp) => sum + (opp.value || 0), 0);

    const winRate = totalClosed > 0 ? (wonCount / totalClosed) * 100 : 0;

    // Group lost opportunities by close_reason (if field exists)
    const lostReasons = {};
    lost.forEach((opp) => {
      const reason = opp.close_reason || 'Not Specified';
      if (!lostReasons[reason]) {
        lostReasons[reason] = { reason, count: 0, value: 0 };
      }
      lostReasons[reason].count += 1;
      lostReasons[reason].value += opp.value || 0;
    });

    return {
      won_count: wonCount,
      lost_count: lostCount,
      win_rate: winRate.toFixed(1),
      won_value: wonValue,
      lost_value: lostValue,
      total_closed: totalClosed,
      lost_reasons: Object.values(lostReasons).sort((a, b) => b.count - a.count),
    };
  };

  return useSWR('dashboard/win-loss-analysis', fetcher, {
    suspense: false,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    refreshInterval: 60000,
    ...config,
  });
};

/**
 * Fetch forecast accuracy metrics - compare forecasted vs actual close dates (last 30 days)
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with forecast accuracy data
 */
export const useDashboardForecastAccuracy = (config) => {
  const fetcher = async () => {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Not authenticated');
    }

    // Calculate date range (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch closed opportunities with expected and actual close dates
    const { data, error } = await supabase
      .from('opportunities')
      .select('expected_close_date, close_date, value')
      .is('deleted_at', null)
      .eq('stage', 'Closed Won')
      .not('expected_close_date', 'is', null)
      .not('close_date', 'is', null)
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (error) throw new Error(error.message);

    // Calculate variance for each opportunity
    const variances = data.map((opp) => {
      const expected = new Date(opp.expected_close_date);
      const actual = new Date(opp.close_date);
      const variance = (actual - expected) / (1000 * 60 * 60 * 24); // Days difference
      return {
        variance,
        value: opp.value || 0,
        early: variance < 0,
        on_time: Math.abs(variance) <= 7, // Within 1 week = on time
      };
    });

    const totalOpportunities = variances.length;

    if (totalOpportunities === 0) {
      return {
        total_opportunities: 0,
        avg_variance_days: 0,
        accuracy_percentage: 0,
        early_count: 0,
        late_count: 0,
        on_time_count: 0,
      };
    }

    // Calculate metrics
    const avgVariance =
      variances.reduce((sum, v) => sum + v.variance, 0) / totalOpportunities;

    const earlyCount = variances.filter((v) => v.early).length;
    const onTimeCount = variances.filter((v) => v.on_time).length;
    const lateCount = variances.filter((v) => !v.early && !v.on_time).length;

    // Accuracy = opportunities closed within 1 week of forecast
    const accuracyPercentage = (onTimeCount / totalOpportunities) * 100;

    return {
      total_opportunities: totalOpportunities,
      avg_variance_days: avgVariance.toFixed(1),
      accuracy_percentage: accuracyPercentage.toFixed(1),
      early_count: earlyCount,
      late_count: lateCount,
      on_time_count: onTimeCount,
    };
  };

  return useSWR('dashboard/forecast-accuracy', fetcher, {
    suspense: false,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    refreshInterval: 60000,
    ...config,
  });
};
