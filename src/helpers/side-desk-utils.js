// Utility functions for Side Desk drawer

/**
 * Determines the current desk type based on the pathname
 * @param {string} pathname - Current route pathname
 * @returns {string} Desk type: 'business', 'sales', 'projects', 'service', or 'inventory'
 */
export const getDeskFromPathname = (pathname) => {
  if (!pathname) return 'business';

  // Business desk - Analytics dashboard
  if (pathname.includes('/dashboard/analytics')) return 'business';

  // Sales desk - CRM and deals
  if (pathname.includes('/crm') || pathname.includes('/deals')) return 'sales';

  // Projects desk - Project dashboard
  if (pathname.includes('/dashboard/project')) return 'projects';

  // Service desk - Resource schedule
  if (pathname.includes('/service/resource-schedule') || pathname.includes('/service')) return 'service';

  // Inventory desk - E-commerce dashboard
  if (pathname.includes('/dashboard/ecommerce') || pathname.includes('/ecommerce')) return 'inventory';

  // Default fallback
  return 'business';
};

/**
 * Formats today's date for display
 * @returns {string} Formatted date (e.g., "Sunday, Feb 01, 2026")
 */
export const formatDate = () => {
  const today = new Date();
  const options = { weekday: 'long', month: 'short', day: '2-digit', year: 'numeric' };
  return today.toLocaleDateString('en-US', options);
};

/**
 * Extracts and formats user's display name from auth user object
 * @param {Object} authUser - Authenticated user object from Supabase
 * @returns {string} User's display name or email
 */
export const getUserDisplayName = (authUser) => {
  if (!authUser) return 'Guest User';

  // Try to get full name from user metadata
  const metadata = authUser.user_metadata || {};

  // Check for display_name first
  if (metadata.display_name) {
    return metadata.display_name;
  }

  // Try to construct name from first_name and last_name
  const firstName = metadata.first_name || metadata.firstName || '';
  const lastName = metadata.last_name || metadata.lastName || '';

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }

  if (firstName) {
    return firstName;
  }

  // Fallback to email without domain
  if (authUser.email) {
    const emailName = authUser.email.split('@')[0];
    // Capitalize first letter
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  }

  return 'User';
};
