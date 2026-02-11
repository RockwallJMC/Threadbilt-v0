'use client';

import useSWR from 'swr';
import { supabase } from 'lib/supabase/client';

/**
 * Role hierarchy levels for edge creation
 * Higher number = higher in hierarchy
 */
const ROLE_LEVELS = {
  owner: 4,
  admin: 3,
  manager: 2,
  member: 1,
};

/**
 * Role-based styling configuration for graph nodes
 */
export const ROLE_STYLES = {
  owner: {
    color: '#FFB300', // Gold/Amber
    size: 60,
    icon: 'material-symbols:star',
  },
  admin: {
    color: '#1976D2', // Blue
    size: 50,
    icon: 'material-symbols:shield',
  },
  manager: {
    color: '#388E3C', // Green
    size: 45,
    icon: 'material-symbols:group',
  },
  member: {
    color: '#757575', // Gray
    size: 40,
    icon: 'material-symbols:person',
  },
};

/**
 * Generate hierarchy edges based on role levels
 * Owner connects to admins, admins to managers, managers to members
 */
const generateHierarchyEdges = (members) => {
  const edges = [];

  // Group members by role
  const byRole = {
    owner: members.filter((m) => m.orgRole === 'owner'),
    admin: members.filter((m) => m.orgRole === 'admin'),
    manager: members.filter((m) => m.orgRole === 'manager'),
    member: members.filter((m) => m.orgRole === 'member'),
  };

  // Owner connects to all admins
  byRole.owner.forEach((owner) => {
    byRole.admin.forEach((admin) => {
      edges.push({
        id: `${owner.id}-${admin.id}`,
        source: owner.id,
        target: admin.id,
        relationship: 'manages',
      });
    });

    // If no admins, owner connects directly to managers
    if (byRole.admin.length === 0) {
      byRole.manager.forEach((manager) => {
        edges.push({
          id: `${owner.id}-${manager.id}`,
          source: owner.id,
          target: manager.id,
          relationship: 'manages',
        });
      });
    }

    // If no admins or managers, owner connects directly to members
    if (byRole.admin.length === 0 && byRole.manager.length === 0) {
      byRole.member.forEach((member) => {
        edges.push({
          id: `${owner.id}-${member.id}`,
          source: owner.id,
          target: member.id,
          relationship: 'manages',
        });
      });
    }
  });

  // Admins connect to all managers
  byRole.admin.forEach((admin) => {
    byRole.manager.forEach((manager) => {
      edges.push({
        id: `${admin.id}-${manager.id}`,
        source: admin.id,
        target: manager.id,
        relationship: 'manages',
      });
    });

    // If no managers, admins connect directly to members
    if (byRole.manager.length === 0) {
      byRole.member.forEach((member) => {
        edges.push({
          id: `${admin.id}-${member.id}`,
          source: admin.id,
          target: member.id,
          relationship: 'manages',
        });
      });
    }
  });

  // Managers connect to all members
  byRole.manager.forEach((manager) => {
    byRole.member.forEach((member) => {
      edges.push({
        id: `${manager.id}-${member.id}`,
        source: manager.id,
        target: member.id,
        relationship: 'manages',
      });
    });
  });

  return edges;
};

/**
 * Transform organization members into graph nodes/edges format
 */
const transformToGraphData = (members) => {
  if (!members || members.length === 0) {
    return { nodes: [], edges: [], metadata: { nodeCount: 0, edgeCount: 0 } };
  }

  // Transform members to nodes
  const nodes = members.map((member) => ({
    id: member.id,
    type: member.orgRole,
    label: member.name,
    avatar: member.avatar,
    email: member.email,
    joinedAt: member.joinedAt,
    membershipId: member.membershipId,
    // Mark owner as center node
    isCenter: member.orgRole === 'owner',
  }));

  // Generate edges based on hierarchy
  const edges = generateHierarchyEdges(members);

  return {
    nodes,
    edges,
    metadata: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      roleBreakdown: {
        owner: members.filter((m) => m.orgRole === 'owner').length,
        admin: members.filter((m) => m.orgRole === 'admin').length,
        manager: members.filter((m) => m.orgRole === 'manager').length,
        member: members.filter((m) => m.orgRole === 'member').length,
      },
    },
  };
};

/**
 * Fetcher function for organization hierarchy graph data
 */
const orgHierarchyFetcher = async () => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Get user's active organization
  const { data: membership, error: membershipError } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  if (!membership?.organization_id) {
    throw new Error('No active organization found');
  }

  // Fetch all organization members with user profiles
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      id,
      user_id,
      role,
      is_active,
      created_at,
      user_profiles (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('organization_id', membership.organization_id)
    .eq('is_active', true)
    .order('role');

  if (error) {
    throw new Error(error.message);
  }

  // Transform to member format
  const members = (data || []).map((member) => ({
    id: member.user_id,
    membershipId: member.id,
    name: member.user_profiles?.full_name || member.user_profiles?.email || 'Unknown',
    email: member.user_profiles?.email,
    avatar: member.user_profiles?.avatar_url,
    orgRole: member.role,
    joinedAt: member.created_at,
  }));

  // Transform to graph data
  return transformToGraphData(members);
};

/**
 * Hook to fetch organization hierarchy graph data
 * Returns nodes and edges formatted for Cytoscape visualization
 */
export const useOrganizationHierarchy = (config) => {
  return useSWR(
    'org-hierarchy-graph',
    orgHierarchyFetcher,
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );
};

export default useOrganizationHierarchy;
