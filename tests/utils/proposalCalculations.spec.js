/**
 * Unit tests for proposal calculation utility functions
 *
 * Tests calculation functions used in proposal pricing:
 * - Line item totals
 * - Subtotals
 * - Tax calculations
 * - Overall proposal totals
 */

import { describe, test, expect } from '@jest/globals';
import {
  calculateLineItemTotal,
  calculateSubtotal,
  calculateTaxAmount,
  calculateTotal,
  recalculateProposalTotals,
} from '../../src/utils/crm/proposalCalculations';

describe('calculateLineItemTotal', () => {
  test('calculates total for positive quantity and price', () => {
    const result = calculateLineItemTotal(5, 100.50);
    expect(result).toBe('502.50');
  });

  test('handles zero quantity', () => {
    const result = calculateLineItemTotal(0, 100.00);
    expect(result).toBe('0.00');
  });

  test('handles zero price', () => {
    const result = calculateLineItemTotal(10, 0);
    expect(result).toBe('0.00');
  });

  test('formats result to 2 decimal places', () => {
    const result = calculateLineItemTotal(3, 10.333);
    expect(result).toBe('31.00'); // 3 * 10.333 = 30.999 rounds to 31.00
  });

  test('handles decimal quantities', () => {
    const result = calculateLineItemTotal(2.5, 100.00);
    expect(result).toBe('250.00');
  });

  test('handles large numbers', () => {
    const result = calculateLineItemTotal(1000, 999.99);
    expect(result).toBe('999990.00');
  });
});

describe('calculateSubtotal', () => {
  test('calculates subtotal from multiple line items', () => {
    const lineItems = [
      { total_price: '100.00' },
      { total_price: '250.50' },
      { total_price: '75.25' },
    ];
    const result = calculateSubtotal(lineItems);
    expect(result).toBe('425.75');
  });

  test('handles empty line items array', () => {
    const result = calculateSubtotal([]);
    expect(result).toBe('0.00');
  });

  test('handles single line item', () => {
    const lineItems = [{ total_price: '99.99' }];
    const result = calculateSubtotal(lineItems);
    expect(result).toBe('99.99');
  });

  test('handles numeric and string total_price values', () => {
    const lineItems = [
      { total_price: 100.00 },
      { total_price: '50.50' },
      { total_price: 25 },
    ];
    const result = calculateSubtotal(lineItems);
    expect(result).toBe('175.50');
  });

  test('rounds to 2 decimal places', () => {
    const lineItems = [
      { total_price: '10.333' },
      { total_price: '20.667' },
    ];
    const result = calculateSubtotal(lineItems);
    expect(result).toBe('31.00'); // 10.333 + 20.667 = 31.000
  });
});

describe('calculateTaxAmount', () => {
  test('calculates tax for standard rate', () => {
    const result = calculateTaxAmount(1000.00, 8.25);
    expect(result).toBe('82.50');
  });

  test('handles zero tax rate', () => {
    const result = calculateTaxAmount(1000.00, 0);
    expect(result).toBe('0.00');
  });

  test('handles zero subtotal', () => {
    const result = calculateTaxAmount(0, 10);
    expect(result).toBe('0.00');
  });

  test('handles decimal tax rates', () => {
    const result = calculateTaxAmount(1000.00, 7.5);
    expect(result).toBe('75.00');
  });

  test('handles high tax rates', () => {
    const result = calculateTaxAmount(100.00, 25);
    expect(result).toBe('25.00');
  });

  test('rounds to 2 decimal places', () => {
    const result = calculateTaxAmount(100.00, 8.333);
    expect(result).toBe('8.33'); // 100 * 0.08333 = 8.333 rounds to 8.33
  });

  test('handles string subtotal', () => {
    const result = calculateTaxAmount('500.00', 10);
    expect(result).toBe('50.00');
  });
});

describe('calculateTotal', () => {
  test('calculates total from subtotal and tax', () => {
    const result = calculateTotal(1000.00, 82.50);
    expect(result).toBe('1082.50');
  });

  test('handles zero tax', () => {
    const result = calculateTotal(500.00, 0);
    expect(result).toBe('500.00');
  });

  test('handles zero subtotal', () => {
    const result = calculateTotal(0, 25.00);
    expect(result).toBe('25.00');
  });

  test('handles string inputs', () => {
    const result = calculateTotal('100.50', '10.25');
    expect(result).toBe('110.75');
  });

  test('rounds to 2 decimal places', () => {
    const result = calculateTotal(100.333, 10.667);
    expect(result).toBe('111.00'); // 100.333 + 10.667 = 111.000
  });
});

describe('recalculateProposalTotals', () => {
  test('recalculates all totals from line items and tax rate', () => {
    const lineItems = [
      { total_price: '1000.00' },
      { total_price: '500.00' },
      { total_price: '250.00' },
    ];
    const taxRate = 8.25;

    const result = recalculateProposalTotals(lineItems, taxRate);

    expect(result.subtotal).toBe('1750.00');
    expect(result.taxAmount).toBe('144.38'); // 1750 * 0.0825 = 144.375 rounds to 144.38
    expect(result.total).toBe('1894.38'); // 1750 + 144.38
  });

  test('handles zero tax rate', () => {
    const lineItems = [
      { total_price: '100.00' },
      { total_price: '200.00' },
    ];
    const taxRate = 0;

    const result = recalculateProposalTotals(lineItems, taxRate);

    expect(result.subtotal).toBe('300.00');
    expect(result.taxAmount).toBe('0.00');
    expect(result.total).toBe('300.00');
  });

  test('handles empty line items', () => {
    const result = recalculateProposalTotals([], 10);

    expect(result.subtotal).toBe('0.00');
    expect(result.taxAmount).toBe('0.00');
    expect(result.total).toBe('0.00');
  });

  test('handles single line item', () => {
    const lineItems = [{ total_price: '99.99' }];
    const taxRate = 5;

    const result = recalculateProposalTotals(lineItems, taxRate);

    expect(result.subtotal).toBe('99.99');
    expect(result.taxAmount).toBe('5.00'); // 99.99 * 0.05 = 4.9995 rounds to 5.00
    expect(result.total).toBe('104.99');
  });

  test('handles high precision calculations', () => {
    const lineItems = [
      { total_price: '123.456' },
      { total_price: '789.012' },
    ];
    const taxRate = 7.875;

    const result = recalculateProposalTotals(lineItems, taxRate);

    expect(result.subtotal).toBe('912.47'); // 123.456 + 789.012 = 912.468 rounds to 912.47
    expect(result.taxAmount).toBe('71.86'); // 912.47 * 0.07875 = 71.857125 rounds to 71.86
    expect(result.total).toBe('984.33'); // 912.47 + 71.86
  });
});
