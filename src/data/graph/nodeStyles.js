/**
 * Cytoscape node style definitions for the Graph Explorer
 * Maps entity types to visual styles using MUI theme colors
 */

// Node type configuration with colors and icons
export const nodeTypeConfig = {
  // Organization role types (for hierarchy visualization)
  owner: {
    color: 'orange.500',
    icon: 'material-symbols:star',
    label: 'Owner',
    baseSize: 60,
  },
  admin: {
    color: 'blue.500',
    icon: 'material-symbols:shield',
    label: 'Admin',
    baseSize: 50,
  },
  manager: {
    color: 'green.500',
    icon: 'material-symbols:group',
    label: 'Manager',
    baseSize: 45,
  },
  member: {
    color: 'grey.500',
    icon: 'material-symbols:person',
    label: 'Member',
    baseSize: 40,
  },
  // Entity types (for graph explorer)
  user_profiles: {
    color: 'blue.500',
    icon: 'material-symbols:person',
    label: 'Users',
    baseSize: 40,
  },
  organizations: {
    color: 'purple.500',
    icon: 'material-symbols:corporate-fare',
    label: 'Organizations',
    baseSize: 50,
  },
  accounts: {
    color: 'lightBlue.500',
    icon: 'material-symbols:business',
    label: 'Accounts',
    baseSize: 45,
    sizeByValue: true,
  },
  contacts: {
    color: 'green.500',
    icon: 'material-symbols:contacts',
    label: 'Contacts',
    baseSize: 35,
  },
  opportunities: {
    color: 'orange.500',
    icon: 'material-symbols:trending-up',
    label: 'Opportunities',
    baseSize: 40,
    sizeByValue: true,
  },
  deals: {
    color: 'orange.400',
    icon: 'material-symbols:handshake',
    label: 'Deals',
    baseSize: 40,
    sizeByValue: true,
  },
  projects: {
    color: 'blue.400',
    icon: 'material-symbols:folder-open',
    label: 'Projects',
    baseSize: 42,
  },
  tasks: {
    color: 'grey.500',
    icon: 'material-symbols:check-circle',
    label: 'Tasks',
    baseSize: 30,
  },
  leads: {
    color: 'red.400',
    icon: 'material-symbols:person-search',
    label: 'Leads',
    baseSize: 35,
  },
  properties: {
    color: 'green.400',
    icon: 'material-symbols:location-on',
    label: 'Properties',
    baseSize: 38,
  },
  devices: {
    color: 'grey.400',
    icon: 'material-symbols:devices',
    label: 'Devices',
    baseSize: 32,
  },
  proposals: {
    color: 'purple.400',
    icon: 'material-symbols:description',
    label: 'Proposals',
    baseSize: 35,
  },
  companies: {
    color: 'lightBlue.400',
    icon: 'material-symbols:domain',
    label: 'Companies',
    baseSize: 45,
  },
  crm_contacts: {
    color: 'green.400',
    icon: 'material-symbols:contact-page',
    label: 'CRM Contacts',
    baseSize: 35,
  },
};

/**
 * Generate Cytoscape node styles using MUI theme
 * @param {object} theme - MUI theme object
 * @param {function} getThemeColor - Function to resolve theme color variables
 * @returns {Array} Cytoscape style definitions
 */
export const getNodeStyles = (theme, getThemeColor) => {
  const baseStyles = [
    // Default node style
    {
      selector: 'node',
      style: {
        label: 'data(label)',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'font-size': 11,
        'font-family': theme?.typography?.fontFamily || 'Roboto, sans-serif',
        color: getThemeColor?.(theme?.vars?.palette?.text?.primary) || '#333',
        'text-margin-y': 8,
        'text-wrap': 'ellipsis',
        'text-max-width': 80,
        width: 40,
        height: 40,
        'background-color': getThemeColor?.(theme?.vars?.palette?.grey?.[300]) || '#e0e0e0',
        'border-width': 2,
        'border-color': getThemeColor?.(theme?.vars?.palette?.divider) || '#ccc',
        'transition-property': 'background-color, border-color, width, height',
        'transition-duration': '0.2s',
      },
    },
    // Selected node highlight
    {
      selector: 'node:selected',
      style: {
        'border-width': 4,
        'border-color': getThemeColor?.(theme?.vars?.palette?.primary?.main) || '#1976d2',
        'background-opacity': 1,
      },
    },
    // Hovered node
    {
      selector: 'node:active',
      style: {
        'overlay-opacity': 0.1,
        'overlay-color': getThemeColor?.(theme?.vars?.palette?.primary?.main) || '#1976d2',
      },
    },
    // Center node (the perspective center)
    {
      selector: 'node[?isCenter]',
      style: {
        'border-width': 4,
        'border-style': 'double',
        width: 55,
        height: 55,
      },
    },
  ];

  // Generate type-specific styles
  const typeStyles = Object.entries(nodeTypeConfig).map(([type, config]) => {
    // Resolve color from theme palette
    const [colorName, shade] = config.color.split('.');
    const paletteColor = theme?.vars?.palette?.[`ch${colorName.charAt(0).toUpperCase() + colorName.slice(1)}`]?.[shade]
      || theme?.vars?.palette?.[colorName]?.[shade]
      || config.color;

    return {
      selector: `node[type="${type}"]`,
      style: {
        'background-color': getThemeColor?.(paletteColor) || paletteColor,
        width: config.baseSize,
        height: config.baseSize,
      },
    };
  });

  return [...baseStyles, ...typeStyles];
};

export default getNodeStyles;
