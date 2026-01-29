import useSWR from 'swr';
import {
  dashboardKPIs,
  pipelineByStage,
  opportunityTrend,
  leadSourcePerformance,
  recentActivities,
  proposalStatusBreakdown,
  topOpportunities,
  conversionFunnel,
} from 'data/crm/dashboard-metrics';

// Mock delay to simulate API call
const mockDelay = () => new Promise((resolve) => setTimeout(resolve, 100));

/**
 * Fetch dashboard KPI metrics
 * @param {Object} dateRange - { start: Date, end: Date, preset: string }
 * @returns {Object} SWR response with KPI data
 */
export const useDashboardKPIs = (dateRange) => {
  return useSWR(dateRange ? ['dashboard/kpis', dateRange] : null, async () => {
    // TODO: [SUPABASE] Replace with Supabase aggregate query:
    // SELECT
    //   SUM(value) as total_pipeline,
    //   COUNT(*) FILTER (WHERE stage = 'Closed Won') * 100.0 / COUNT(*) as win_rate,
    //   AVG(value) FILTER (WHERE stage = 'Closed Won') as avg_deal_size,
    //   AVG(EXTRACT(EPOCH FROM (closed_date - created_date))/86400) as avg_sales_cycle,
    //   COUNT(*) FILTER (WHERE status = 'active') as active_opportunities,
    //   (SELECT COUNT(*) FROM proposals WHERE created_date >= $1) as proposals_sent,
    //   COUNT(DISTINCT opportunity_id) * 100.0 / COUNT(DISTINCT lead_id) as lead_conversion
    // FROM opportunities
    // WHERE created_date >= $1 AND created_date <= $2
    // GROUP BY tenant_id
    // HAVING tenant_id = $3;

    await mockDelay();
    return dashboardKPIs;
  });
};

/**
 * Fetch pipeline breakdown by stage
 * @param {Object} dateRange - { start: Date, end: Date, preset: string }
 * @returns {Object} SWR response with pipeline stage data
 */
export const usePipelineBreakdown = (dateRange) => {
  return useSWR(dateRange ? ['dashboard/pipeline', dateRange] : null, async () => {
    // TODO: [SUPABASE] Replace with Supabase aggregate query:
    // SELECT
    //   stage,
    //   SUM(value) as value,
    //   COUNT(*) as count
    // FROM opportunities
    // WHERE status = 'active'
    //   AND created_date >= $1
    //   AND created_date <= $2
    //   AND tenant_id = $3
    // GROUP BY stage
    // ORDER BY
    //   CASE stage
    //     WHEN 'Qualification' THEN 1
    //     WHEN 'Needs Analysis' THEN 2
    //     WHEN 'Proposal' THEN 3
    //     WHEN 'Negotiation' THEN 4
    //     WHEN 'Verbal Commit' THEN 5
    //     WHEN 'Contracting' THEN 6
    //     WHEN 'Closed Won' THEN 7
    //   END;

    await mockDelay();
    return pipelineByStage;
  });
};

/**
 * Fetch opportunity trend over time
 * @param {Object} dateRange - { start: Date, end: Date, preset: string }
 * @returns {Object} SWR response with time series data
 */
export const useOpportunityTrend = (dateRange) => {
  return useSWR(dateRange ? ['dashboard/opportunity-trend', dateRange] : null, async () => {
    // TODO: [SUPABASE] Replace with Supabase time-series aggregate query:
    // SELECT
    //   DATE_TRUNC('day', created_date) as date,
    //   COUNT(*) FILTER (WHERE event_type = 'created') as created,
    //   COUNT(*) FILTER (WHERE event_type = 'won') as won,
    //   COUNT(*) FILTER (WHERE event_type = 'lost') as lost,
    //   SUM(value) as value
    // FROM opportunity_events
    // WHERE created_date >= $1
    //   AND created_date <= $2
    //   AND tenant_id = $3
    // GROUP BY DATE_TRUNC('day', created_date)
    // ORDER BY date ASC;

    await mockDelay();
    return opportunityTrend;
  });
};

/**
 * Fetch lead source performance metrics
 * @param {Object} dateRange - { start: Date, end: Date, preset: string }
 * @returns {Object} SWR response with lead source data
 */
export const useLeadSourcePerformance = (dateRange) => {
  return useSWR(
    dateRange ? ['dashboard/lead-source-performance', dateRange] : null,
    async () => {
      // TODO: [SUPABASE] Replace with Supabase aggregate query with JOIN:
      // SELECT
      //   l.source,
      //   COUNT(DISTINCT l.id) as leads,
      //   COUNT(DISTINCT o.id) as opportunities,
      //   COUNT(DISTINCT o.id) FILTER (WHERE o.stage = 'Closed Won') as won,
      //   SUM(o.value) FILTER (WHERE o.stage = 'Closed Won') as revenue,
      //   COUNT(DISTINCT o.id) * 100.0 / COUNT(DISTINCT l.id) as conversion_rate,
      //   AVG(o.value) FILTER (WHERE o.stage = 'Closed Won') as avg_deal_size
      // FROM leads l
      // LEFT JOIN opportunities o ON l.id = o.lead_id
      // WHERE l.created_date >= $1
      //   AND l.created_date <= $2
      //   AND l.tenant_id = $3
      // GROUP BY l.source
      // ORDER BY revenue DESC;

      await mockDelay();
      return leadSourcePerformance;
    },
  );
};

/**
 * Fetch recent activity timeline
 * @param {number} limit - Number of activities to return (default: 10)
 * @returns {Object} SWR response with recent activities
 */
export const useRecentActivities = (limit = 10) => {
  return useSWR(['dashboard/recent-activities', limit], async () => {
    // TODO: [SUPABASE] Replace with Supabase query with RLS:
    // SELECT
    //   a.id,
    //   a.type,
    //   a.title,
    //   a.value,
    //   u.name as user,
    //   a.created_at as timestamp
    // FROM activities a
    // JOIN users u ON a.user_id = u.id
    // WHERE a.tenant_id = $1
    // ORDER BY a.created_at DESC
    // LIMIT $2;
    // Note: RLS policy will automatically filter by tenant_id based on JWT

    await mockDelay();
    return recentActivities.slice(0, limit);
  });
};

/**
 * Fetch proposal status breakdown
 * @param {Object} dateRange - { start: Date, end: Date, preset: string }
 * @returns {Object} SWR response with proposal status data
 */
export const useProposalStatusBreakdown = (dateRange) => {
  return useSWR(dateRange ? ['dashboard/proposal-status', dateRange] : null, async () => {
    // TODO: [SUPABASE] Replace with Supabase aggregate query:
    // SELECT
    //   status,
    //   COUNT(*) as count,
    //   SUM(value) as value
    // FROM proposals
    // WHERE created_date >= $1
    //   AND created_date <= $2
    //   AND tenant_id = $3
    // GROUP BY status
    // ORDER BY
    //   CASE status
    //     WHEN 'Draft' THEN 1
    //     WHEN 'Sent' THEN 2
    //     WHEN 'Accepted' THEN 3
    //     WHEN 'Declined' THEN 4
    //   END;

    await mockDelay();
    return proposalStatusBreakdown;
  });
};

/**
 * Fetch top opportunities by value
 * @param {number} limit - Number of opportunities to return (default: 5)
 * @param {string} orderBy - Order field (default: 'value')
 * @returns {Object} SWR response with top opportunities
 */
export const useTopOpportunities = (limit = 5, orderBy = 'value') => {
  return useSWR(['dashboard/top-opportunities', limit, orderBy], async () => {
    // TODO: [SUPABASE] Replace with Supabase query with JOIN:
    // SELECT
    //   o.id,
    //   o.name,
    //   a.name as account,
    //   o.value,
    //   o.stage,
    //   o.probability,
    //   o.expected_close_date,
    //   u.name as owner,
    //   MAX(act.created_at) as last_activity
    // FROM opportunities o
    // JOIN accounts a ON o.account_id = a.id
    // JOIN users u ON o.owner_id = u.id
    // LEFT JOIN activities act ON o.id = act.opportunity_id
    // WHERE o.status = 'active'
    //   AND o.tenant_id = $1
    // GROUP BY o.id, a.name, u.name
    // ORDER BY o.value DESC
    // LIMIT $2;
    // Note: orderBy parameter should be validated and used in ORDER BY clause

    await mockDelay();
    return topOpportunities.slice(0, limit);
  });
};

/**
 * Fetch conversion funnel metrics
 * @param {Object} dateRange - { start: Date, end: Date, preset: string }
 * @returns {Object} SWR response with funnel data
 */
export const useConversionFunnel = (dateRange) => {
  return useSWR(dateRange ? ['dashboard/conversion-funnel', dateRange] : null, async () => {
    // TODO: [SUPABASE] Replace with Supabase CTE query for funnel analysis:
    // WITH funnel_data AS (
    //   SELECT
    //     COUNT(DISTINCT l.id) as leads,
    //     COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'Qualified') as qualified_leads,
    //     COUNT(DISTINCT o.id) as opportunities,
    //     COUNT(DISTINCT p.id) as proposals,
    //     COUNT(DISTINCT o.id) FILTER (WHERE o.stage = 'Closed Won') as won
    //   FROM leads l
    //   LEFT JOIN opportunities o ON l.id = o.lead_id
    //   LEFT JOIN proposals p ON o.id = p.opportunity_id
    //   WHERE l.created_date >= $1
    //     AND l.created_date <= $2
    //     AND l.tenant_id = $3
    // )
    // SELECT
    //   'Leads' as stage, leads as count, 100.0 as percentage FROM funnel_data
    // UNION ALL
    // SELECT 'Qualified Leads', qualified_leads, (qualified_leads * 100.0 / leads) FROM funnel_data
    // UNION ALL
    // SELECT 'Opportunities', opportunities, (opportunities * 100.0 / leads) FROM funnel_data
    // UNION ALL
    // SELECT 'Proposals', proposals, (proposals * 100.0 / leads) FROM funnel_data
    // UNION ALL
    // SELECT 'Won', won, (won * 100.0 / leads) FROM funnel_data;

    await mockDelay();
    return conversionFunnel;
  });
};
