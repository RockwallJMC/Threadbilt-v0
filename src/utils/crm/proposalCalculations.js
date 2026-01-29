/**
 * Proposal calculation utility functions
 *
 * Functions for calculating proposal pricing:
 * - Line item totals
 * - Subtotals
 * - Tax amounts
 * - Total amounts
 *
 * All calculations return strings formatted to 2 decimal places for precision.
 */

/**
 * Calculate the total price for a line item
 *
 * @param {number} quantity - Item quantity
 * @param {number} unitPrice - Price per unit
 * @returns {string} Total price formatted to 2 decimal places
 *
 * @example
 * calculateLineItemTotal(5, 100.50); // "502.50"
 * calculateLineItemTotal(2.5, 100.00); // "250.00"
 */
export const calculateLineItemTotal = (quantity, unitPrice) => {
  return (quantity * unitPrice).toFixed(2);
};

/**
 * Calculate the subtotal from an array of line items
 *
 * @param {Array<{total_price: number|string}>} lineItems - Array of line items with total_price
 * @returns {string} Subtotal formatted to 2 decimal places
 *
 * @example
 * const lineItems = [
 *   { total_price: '100.00' },
 *   { total_price: '250.50' },
 * ];
 * calculateSubtotal(lineItems); // "350.50"
 */
export const calculateSubtotal = (lineItems) => {
  return lineItems.reduce((sum, item) => sum + parseFloat(item.total_price), 0).toFixed(2);
};

/**
 * Calculate tax amount from subtotal and tax rate
 *
 * @param {number|string} subtotal - Subtotal amount
 * @param {number} taxRate - Tax rate as percentage (e.g., 8.25 for 8.25%)
 * @returns {string} Tax amount formatted to 2 decimal places
 *
 * @example
 * calculateTaxAmount(1000.00, 8.25); // "82.50"
 * calculateTaxAmount(500.00, 0); // "0.00"
 */
export const calculateTaxAmount = (subtotal, taxRate) => {
  return (parseFloat(subtotal) * (taxRate / 100)).toFixed(2);
};

/**
 * Calculate total amount from subtotal and tax amount
 *
 * @param {number|string} subtotal - Subtotal amount
 * @param {number|string} taxAmount - Tax amount
 * @returns {string} Total amount formatted to 2 decimal places
 *
 * @example
 * calculateTotal(1000.00, 82.50); // "1082.50"
 * calculateTotal('100.50', '10.25'); // "110.75"
 */
export const calculateTotal = (subtotal, taxAmount) => {
  return (parseFloat(subtotal) + parseFloat(taxAmount)).toFixed(2);
};

/**
 * Recalculate all proposal totals from line items and tax rate
 *
 * This is the primary function used when line items change or tax rate is updated.
 * It calculates subtotal, tax amount, and total in one operation.
 *
 * @param {Array<{total_price: number|string}>} lineItems - Array of line items
 * @param {number} taxRate - Tax rate as percentage
 * @returns {{subtotal: string, taxAmount: string, total: string}} Calculated totals
 *
 * @example
 * const lineItems = [
 *   { total_price: '1000.00' },
 *   { total_price: '500.00' },
 * ];
 * recalculateProposalTotals(lineItems, 8.25);
 * // {
 * //   subtotal: "1500.00",
 * //   taxAmount: "123.75",
 * //   total: "1623.75"
 * // }
 */
export const recalculateProposalTotals = (lineItems, taxRate) => {
  const subtotal = calculateSubtotal(lineItems);
  const taxAmount = calculateTaxAmount(subtotal, taxRate);
  const total = calculateTotal(subtotal, taxAmount);
  return { subtotal, taxAmount, total };
};
