/**
 * Cytoscape edge style definitions for the Graph Explorer
 * Maps relationship types to visual styles
 */

// Edge type configuration
export const edgeTypeConfig = {
  owner_id: {
    label: 'Owns',
    style: 'solid',
    width: 3,
    color: 'primary',
  },
  assigned_to: {
    label: 'Assigned',
    style: 'dashed',
    width: 2,
    color: 'secondary',
  },
  account_id: {
    label: 'Account',
    style: 'solid',
    width: 2,
    color: 'info',
  },
  contact_id: {
    label: 'Contact',
    style: 'solid',
    width: 1.5,
    color: 'success',
  },
  project_id: {
    label: 'Project',
    style: 'solid',
    width: 2,
    color: 'info',
  },
  created_by: {
    label: 'Created',
    style: 'dotted',
    width: 1,
    color: 'grey',
  },
  organization_id: {
    label: 'Organization',
    style: 'solid',
    width: 1,
    color: 'grey',
    opacity: 0.5,
  },
  property_id: {
    label: 'Property',
    style: 'solid',
    width: 2,
    color: 'success',
  },
  converted_to: {
    label: 'Converted',
    style: 'solid',
    width: 2,
    color: 'success',
    arrow: true,
  },
  company_id: {
    label: 'Company',
    style: 'solid',
    width: 2,
    color: 'info',
  },
  deal_id: {
    label: 'Deal',
    style: 'solid',
    width: 2,
    color: 'warning',
  },
  opportunity_id: {
    label: 'Opportunity',
    style: 'solid',
    width: 2,
    color: 'warning',
  },
};

/**
 * Generate Cytoscape edge styles using MUI theme
 * @param {object} theme - MUI theme object
 * @param {function} getThemeColor - Function to resolve theme color variables
 * @returns {Array} Cytoscape style definitions
 */
export const getEdgeStyles = (theme, getThemeColor) => {
  const baseStyles = [
    // Default edge style
    {
      selector: 'edge',
      style: {
        width: 2,
        'line-color': getThemeColor?.(theme?.vars?.palette?.grey?.[400]) || '#bdbdbd',
        'target-arrow-color': getThemeColor?.(theme?.vars?.palette?.grey?.[400]) || '#bdbdbd',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        opacity: 0.7,
        'transition-property': 'line-color, opacity, width',
        'transition-duration': '0.2s',
      },
    },
    // Edge connected to selected node
    {
      selector: 'edge:selected',
      style: {
        opacity: 1,
        width: 3,
        'line-color': getThemeColor?.(theme?.vars?.palette?.primary?.main) || '#1976d2',
        'target-arrow-color': getThemeColor?.(theme?.vars?.palette?.primary?.main) || '#1976d2',
      },
    },
    // Edges connected to hovered/selected nodes
    {
      selector: 'node:selected ~ edge, node:active ~ edge',
      style: {
        opacity: 1,
      },
    },
    // Dashed edge style
    {
      selector: 'edge[lineStyle="dashed"]',
      style: {
        'line-style': 'dashed',
        'line-dash-pattern': [6, 3],
      },
    },
    // Dotted edge style
    {
      selector: 'edge[lineStyle="dotted"]',
      style: {
        'line-style': 'dotted',
        'line-dash-pattern': [2, 2],
      },
    },
  ];

  // Generate relationship-specific styles
  const relationshipStyles = Object.entries(edgeTypeConfig).map(([relationship, config]) => {
    const colorKey = config.color;
    const paletteColor = theme?.vars?.palette?.[colorKey]?.main
      || theme?.vars?.palette?.grey?.[500]
      || '#9e9e9e';

    const style = {
      selector: `edge[relationship="${relationship}"]`,
      style: {
        'line-color': getThemeColor?.(paletteColor) || paletteColor,
        'target-arrow-color': getThemeColor?.(paletteColor) || paletteColor,
        width: config.width,
      },
    };

    if (config.style === 'dashed') {
      style.style['line-style'] = 'dashed';
      style.style['line-dash-pattern'] = [6, 3];
    } else if (config.style === 'dotted') {
      style.style['line-style'] = 'dotted';
      style.style['line-dash-pattern'] = [2, 2];
    }

    if (config.opacity) {
      style.style.opacity = config.opacity;
    }

    return style;
  });

  return [...baseStyles, ...relationshipStyles];
};

export default getEdgeStyles;
