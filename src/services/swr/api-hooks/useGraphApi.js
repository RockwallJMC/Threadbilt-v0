'use client';

import useSWR from 'swr';
import { supabase } from 'lib/supabase/client';

/**
 * Mock data generator for graph visualization
 * Used for development before the RPC function is created
 */
const generateMockGraphData = (centerType = 'user', centerId = null) => {
  // Create a user-centered mock graph
  const mockNodes = [
    // Center node (current user)
    {
      id: 'user_1',
      type: 'user_profiles',
      label: 'Current User',
      isCenter: true,
      entityId: 'user-uuid-1',
    },
    // Accounts
    {
      id: 'account_1',
      type: 'accounts',
      label: 'Acme Corp',
      entityId: 'account-uuid-1',
      value: 150000,
    },
    {
      id: 'account_2',
      type: 'accounts',
      label: 'Tech Solutions',
      entityId: 'account-uuid-2',
      value: 85000,
    },
    // Contacts
    {
      id: 'contact_1',
      type: 'contacts',
      label: 'John Smith',
      entityId: 'contact-uuid-1',
    },
    {
      id: 'contact_2',
      type: 'contacts',
      label: 'Jane Doe',
      entityId: 'contact-uuid-2',
    },
    {
      id: 'contact_3',
      type: 'contacts',
      label: 'Bob Wilson',
      entityId: 'contact-uuid-3',
    },
    // Opportunities
    {
      id: 'opportunity_1',
      type: 'opportunities',
      label: 'Enterprise Deal',
      entityId: 'opp-uuid-1',
      value: 50000,
      stage: 'Negotiation',
    },
    {
      id: 'opportunity_2',
      type: 'opportunities',
      label: 'SMB Expansion',
      entityId: 'opp-uuid-2',
      value: 25000,
      stage: 'Proposal',
    },
    // Projects
    {
      id: 'project_1',
      type: 'projects',
      label: 'Security Upgrade',
      entityId: 'project-uuid-1',
    },
    {
      id: 'project_2',
      type: 'projects',
      label: 'Network Install',
      entityId: 'project-uuid-2',
    },
    // Tasks
    {
      id: 'task_1',
      type: 'tasks',
      label: 'Site Survey',
      entityId: 'task-uuid-1',
    },
    {
      id: 'task_2',
      type: 'tasks',
      label: 'Equipment Order',
      entityId: 'task-uuid-2',
    },
    // Leads
    {
      id: 'lead_1',
      type: 'leads',
      label: 'New Prospect',
      entityId: 'lead-uuid-1',
      status: 'Qualified',
    },
    // Properties
    {
      id: 'property_1',
      type: 'properties',
      label: '123 Main St',
      entityId: 'property-uuid-1',
    },
    // Devices
    {
      id: 'device_1',
      type: 'devices',
      label: 'Camera System',
      entityId: 'device-uuid-1',
    },
  ];

  const mockEdges = [
    // User owns accounts
    { id: 'e1', source: 'user_1', target: 'account_1', relationship: 'owner_id' },
    { id: 'e2', source: 'user_1', target: 'account_2', relationship: 'owner_id' },
    // Account contacts
    { id: 'e3', source: 'account_1', target: 'contact_1', relationship: 'contact_id' },
    { id: 'e4', source: 'account_1', target: 'contact_2', relationship: 'contact_id' },
    { id: 'e5', source: 'account_2', target: 'contact_3', relationship: 'contact_id' },
    // Account opportunities
    { id: 'e6', source: 'account_1', target: 'opportunity_1', relationship: 'account_id' },
    { id: 'e7', source: 'account_2', target: 'opportunity_2', relationship: 'account_id' },
    // Account projects
    { id: 'e8', source: 'account_1', target: 'project_1', relationship: 'account_id' },
    { id: 'e9', source: 'account_2', target: 'project_2', relationship: 'account_id' },
    // Project tasks
    { id: 'e10', source: 'project_1', target: 'task_1', relationship: 'project_id' },
    { id: 'e11', source: 'project_1', target: 'task_2', relationship: 'project_id' },
    // User assigned tasks
    { id: 'e12', source: 'user_1', target: 'task_1', relationship: 'assigned_to' },
    // User leads
    { id: 'e13', source: 'user_1', target: 'lead_1', relationship: 'owner_id' },
    // Project property
    { id: 'e14', source: 'project_1', target: 'property_1', relationship: 'property_id' },
    // Property devices
    { id: 'e15', source: 'property_1', target: 'device_1', relationship: 'property_id' },
  ];

  return {
    nodes: mockNodes,
    edges: mockEdges,
    metadata: {
      centerType,
      centerId,
      depth: 2,
      nodeCount: mockNodes.length,
      edgeCount: mockEdges.length,
    },
  };
};

/**
 * SWR hook for fetching graph data
 * Initially uses mock data, will connect to RPC function when available
 */
export const useGraphData = (centerType = 'user', centerId = null, options = {}) => {
  const { depth = 2, entityTypes = null, enabled = true } = options;

  const fetcher = async () => {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    // Try to use the RPC function if it exists
    try {
      const { data, error } = await supabase.rpc('get_entity_graph', {
        p_center_type: centerType,
        p_center_id: centerId || user.id,
        p_depth: depth,
        p_entity_types: entityTypes,
      });

      if (error) {
        // If RPC doesn't exist, fall back to mock data
        if (error.code === '42883') {
          console.info('Using mock graph data (RPC function not yet created)');
          return generateMockGraphData(centerType, centerId || user.id);
        }
        throw error;
      }

      return data;
    } catch (err) {
      // Fall back to mock data for development
      console.info('Using mock graph data:', err.message);
      return generateMockGraphData(centerType, centerId || user.id);
    }
  };

  return useSWR(
    enabled ? ['graph', centerType, centerId, depth, entityTypes] : null,
    fetcher,
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      refreshInterval: 60000, // Refresh every minute
      suspense: false,
      dedupingInterval: 5000,
    }
  );
};

/**
 * Hook to manually refresh graph data
 */
export const useGraphRefresh = () => {
  const { mutate } = useSWR(['graph']);

  const refresh = () => {
    mutate();
  };

  return { refresh };
};

/**
 * Get node details by type and ID
 */
export const useNodeDetails = (nodeType, nodeId) => {
  const fetcher = async () => {
    if (!nodeType || !nodeId) return null;

    // Map node types to table names
    const tableMap = {
      user_profiles: 'user_profiles',
      accounts: 'accounts',
      contacts: 'contacts',
      opportunities: 'opportunities',
      deals: 'deals',
      projects: 'projects',
      tasks: 'tasks',
      leads: 'leads',
      properties: 'properties',
      devices: 'devices',
      proposals: 'proposals',
      companies: 'companies',
      crm_contacts: 'crm_contacts',
    };

    const tableName = tableMap[nodeType];
    if (!tableName) return null;

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', nodeId)
      .single();

    if (error) throw error;
    return data;
  };

  return useSWR(
    nodeType && nodeId ? ['node-details', nodeType, nodeId] : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );
};

export default useGraphData;
