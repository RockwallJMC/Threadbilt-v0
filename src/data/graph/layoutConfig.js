/**
 * Cola layout configuration for Cytoscape Graph Explorer
 * Force-directed layout with grouping by entity type
 */

// Entity type grouping for layout alignment
const typeGroups = {
  user_profiles: 0,
  organizations: 0,
  accounts: 1,
  contacts: 1,
  companies: 1,
  crm_contacts: 1,
  opportunities: 2,
  deals: 2,
  leads: 2,
  projects: 3,
  tasks: 3,
  properties: 4,
  devices: 4,
  proposals: 5,
};

/**
 * Default cola layout configuration
 */
export const colaLayoutConfig = {
  name: 'cola',
  animate: true,
  animationDuration: 500,
  animationEasing: 'ease-out',
  randomize: false,
  avoidOverlap: true,
  handleDisconnected: true,
  convergenceThreshold: 0.01,
  nodeSpacing: 50,
  edgeLength: 120,
  edgeSymDiffLength: 10,
  ungrabifyWhileSimulating: false,
  fit: true,
  padding: 40,
  maxSimulationTime: 4000,
  infinite: false,

  // Group nodes by type for better visual organization
  alignment: (node) => {
    const type = node.data('type');
    return typeGroups[type] ?? 6;
  },
};

/**
 * Compact layout for widget view (smaller, faster)
 */
export const compactLayoutConfig = {
  ...colaLayoutConfig,
  nodeSpacing: 30,
  edgeLength: 80,
  padding: 20,
  maxSimulationTime: 2000,
};

/**
 * Layout for large graphs (performance optimized)
 */
export const performanceLayoutConfig = {
  ...colaLayoutConfig,
  animate: false,
  maxSimulationTime: 2000,
  convergenceThreshold: 0.1,
};

/**
 * Get appropriate layout config based on node count
 * @param {number} nodeCount - Number of nodes in the graph
 * @param {boolean} isWidget - Whether this is for the widget view
 * @returns {object} Layout configuration
 */
export const getLayoutConfig = (nodeCount, isWidget = false) => {
  if (isWidget) {
    return compactLayoutConfig;
  }

  if (nodeCount > 200) {
    return performanceLayoutConfig;
  }

  return colaLayoutConfig;
};

export default colaLayoutConfig;
