/**
 * Unit tests for proposal number generator
 *
 * Tests generation of unique proposal numbers in PROP-YYYY-NNN format.
 * Mock implementation uses simple counter. Phase 1.2 will query database for max.
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { generateProposalNumber, resetCounter } from '../../src/utils/crm/proposalNumberGenerator';

describe('generateProposalNumber', () => {
  beforeEach(() => {
    // Reset counter before each test for predictable results
    resetCounter();
  });

  test('generates number in PROP-YYYY-NNN format', () => {
    const proposalNumber = generateProposalNumber();
    const year = new Date().getFullYear();
    const pattern = new RegExp(`^PROP-${year}-\\d{3}$`);
    expect(proposalNumber).toMatch(pattern);
  });

  test('generates PROP-2026-001 for first proposal of 2026', () => {
    const proposalNumber = generateProposalNumber();
    expect(proposalNumber).toBe('PROP-2026-001');
  });

  test('increments counter for each call', () => {
    const first = generateProposalNumber();
    const second = generateProposalNumber();
    const third = generateProposalNumber();

    expect(first).toBe('PROP-2026-001');
    expect(second).toBe('PROP-2026-002');
    expect(third).toBe('PROP-2026-003');
  });

  test('pads numbers with leading zeros', () => {
    resetCounter();
    const proposal1 = generateProposalNumber(); // 001
    expect(proposal1).toBe('PROP-2026-001');

    // Generate 10 more to get to double digits
    for (let i = 0; i < 9; i++) {
      generateProposalNumber();
    }

    const proposal11 = generateProposalNumber(); // 011
    expect(proposal11).toBe('PROP-2026-011');
  });

  test('handles triple digit numbers', () => {
    resetCounter();
    // Generate 99 proposals
    for (let i = 0; i < 99; i++) {
      generateProposalNumber();
    }

    const proposal100 = generateProposalNumber(); // 100
    expect(proposal100).toBe('PROP-2026-100');
  });

  test('each call returns unique number', () => {
    const numbers = new Set();
    for (let i = 0; i < 50; i++) {
      numbers.add(generateProposalNumber());
    }

    // All 50 should be unique
    expect(numbers.size).toBe(50);
  });

  test('resetCounter restarts from 001', () => {
    generateProposalNumber(); // 001
    generateProposalNumber(); // 002
    generateProposalNumber(); // 003

    resetCounter();

    const afterReset = generateProposalNumber();
    expect(afterReset).toBe('PROP-2026-001');
  });
});
