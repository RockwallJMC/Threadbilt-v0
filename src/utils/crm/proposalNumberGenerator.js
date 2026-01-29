/**
 * Proposal number generator utility
 *
 * Generates unique proposal numbers in PROP-YYYY-NNN format.
 *
 * Mock implementation uses simple in-memory counter.
 * TODO: Replace with database query for max number per year after Phase 1.2
 */

// In-memory counter for mock implementation
// TODO: Phase 1.2 - Query database: SELECT MAX(proposal_number) FROM proposals WHERE created_at BETWEEN 'YYYY-01-01' AND 'YYYY-12-31'
let proposalCounter = 0;

/**
 * Generate a unique proposal number
 *
 * Format: PROP-YYYY-NNN
 * - PROP: Prefix
 * - YYYY: Current year
 * - NNN: Sequential number padded to 3 digits (001, 002, ..., 100, ...)
 *
 * @returns {string} Generated proposal number (e.g., "PROP-2026-001")
 *
 * @example
 * generateProposalNumber(); // "PROP-2026-001"
 * generateProposalNumber(); // "PROP-2026-002"
 * generateProposalNumber(); // "PROP-2026-003"
 *
 * TODO: Phase 1.2 - Replace with database implementation:
 * async function generateProposalNumber(supabase) {
 *   const year = new Date().getFullYear();
 *   const { data } = await supabase
 *     .from('proposals')
 *     .select('proposal_number')
 *     .like('proposal_number', `PROP-${year}-%`)
 *     .order('created_at', { ascending: false })
 *     .limit(1);
 *
 *   const lastNumber = data?.[0]?.proposal_number || `PROP-${year}-000`;
 *   const counter = parseInt(lastNumber.split('-')[2]) + 1;
 *   return `PROP-${year}-${String(counter).padStart(3, '0')}`;
 * }
 */
export const generateProposalNumber = () => {
  proposalCounter++;
  const year = new Date().getFullYear();
  const paddedCounter = String(proposalCounter).padStart(3, '0');
  return `PROP-${year}-${paddedCounter}`;
};

/**
 * Reset the proposal counter (for testing only)
 *
 * This function is only used in tests to ensure predictable proposal numbers.
 * Will be removed after Phase 1.2 when database implementation is used.
 */
export const resetCounter = () => {
  proposalCounter = 0;
};
