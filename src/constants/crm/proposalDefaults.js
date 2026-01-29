/**
 * Proposal default values and constants
 *
 * Defines default values for new proposals, item types, status colors, and templates.
 */

/**
 * Default number of days a proposal is valid from creation date
 * Used to calculate valid_until when creating new proposals
 */
export const DEFAULT_VALID_DAYS = 30;

/**
 * Default tax rate (percentage)
 * 0 = no tax by default, user can override
 */
export const DEFAULT_TAX_RATE = 0;

/**
 * Default payment terms and conditions template
 * Pre-filled when creating new proposals, user can edit
 */
export const DEFAULT_TERMS_TEMPLATE = `Payment terms: Net 30 days from invoice date.
All work is guaranteed for 90 days from project completion.
Changes to scope may incur additional charges.
A 50% deposit is required before work begins.`.trim();

/**
 * Available line item types for proposal items
 * Used in dropdowns and validation
 */
export const ITEM_TYPES = [
  { value: 'material', label: 'Material' },
  { value: 'labor', label: 'Labor' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'service', label: 'Service' },
  { value: 'optional', label: 'Optional' },
];

/**
 * Status color mapping for Material-UI Chip components
 * Maps proposal status to MUI chip color prop
 *
 * @example
 * <Chip label={status} color={STATUS_COLORS[status]} />
 */
export const STATUS_COLORS = {
  draft: 'default',
  sent: 'info',
  accepted: 'success',
  rejected: 'error',
  expired: 'warning',
};

/**
 * Proposal status options for filters and dropdowns
 */
export const PROPOSAL_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
];
