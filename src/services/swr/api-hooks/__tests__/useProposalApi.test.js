/**
 * Unit tests for useProposalApi SWR hooks
 *
 * Tests for proposal management functionality with mock data
 * Phase 1.2 will replace with Supabase integration tests
 */

import { renderHook, waitFor } from '@testing-library/react';
import {
  useProposals,
  useProposal,
  useCreateProposal,
  useUpdateProposal,
  useUpdateLineItems,
  useUpdateProposalStatus,
  useGenerateProposalPDF,
} from '../useProposalApi';

// Mock the SWR library
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn((key, fetcher, options) => {
    return {
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    };
  }),
}));

// Mock the SWR mutation
jest.mock('swr/mutation', () => ({
  __esModule: true,
  default: jest.fn((key, mutationFn, options) => {
    return {
      trigger: async (arg) => {
        const result = await mutationFn(key, { arg });
        if (options?.onSuccess) {
          options.onSuccess(result, key, options);
        }
        return result;
      },
      isMutating: false,
    };
  }),
}));

describe('useProposals', () => {
  test('hook exists and is callable', () => {
    const { result } = renderHook(() => useProposals());
    expect(result.current).toBeDefined();
  });

  test('accepts status filter parameter', () => {
    const { result } = renderHook(() => useProposals({ status: 'draft' }));
    expect(result.current).toBeDefined();
  });

  test('accepts opportunity_id filter parameter', () => {
    const { result } = renderHook(() => useProposals({ opportunity_id: 'opp_001' }));
    expect(result.current).toBeDefined();
  });

  test('accepts search parameter', () => {
    const { result } = renderHook(() => useProposals({ search: 'payment' }));
    expect(result.current).toBeDefined();
  });
});

describe('useProposal', () => {
  test('hook exists and is callable', () => {
    const { result } = renderHook(() => useProposal('prop_001'));
    expect(result.current).toBeDefined();
  });

  test('accepts proposal ID parameter', () => {
    const { result } = renderHook(() => useProposal('prop_001'));
    expect(result.current).toBeDefined();
  });
});

describe('useCreateProposal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  test('creates proposal with required fields', async () => {
    const { result } = renderHook(() => useCreateProposal());

    const proposalData = {
      opportunity_id: 'opp_001',
      title: 'Test Proposal',
      description: 'Test description',
      valid_until: '2026-03-31',
      terms_and_conditions: 'Test terms',
    };

    const newProposal = await result.current.trigger(proposalData);

    // Verify mutation was called with correct data
    expect(console.log).toHaveBeenCalledWith(
      'useCreateProposal mutation called with:',
      expect.objectContaining(proposalData)
    );

    // Verify returned proposal has generated fields
    expect(newProposal).toMatchObject({
      opportunity_id: 'opp_001',
      title: 'Test Proposal',
      status: 'draft',
    });

    expect(newProposal.id).toBeDefined();
    expect(newProposal.proposal_number).toMatch(/^PROP-\d{4}-\d{3}$/);
    expect(newProposal.created_at).toBeDefined();
  });

  test('generates unique proposal numbers', async () => {
    const { result } = renderHook(() => useCreateProposal());

    const proposal1 = await result.current.trigger({
      opportunity_id: 'opp_001',
      title: 'Proposal 1',
    });

    const proposal2 = await result.current.trigger({
      opportunity_id: 'opp_002',
      title: 'Proposal 2',
    });

    expect(proposal1.proposal_number).not.toBe(proposal2.proposal_number);
  });
});

describe('useUpdateProposal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  test('updates proposal with new data', async () => {
    const { result } = renderHook(() => useUpdateProposal());

    const updates = {
      title: 'Updated Title',
      description: 'Updated description',
      tax_rate: 8.25,
    };

    const updatedProposal = await result.current.trigger({
      id: 'prop_001',
      updates,
    });

    // Verify mutation was called
    expect(console.log).toHaveBeenCalledWith('useUpdateProposal mutation called with:', {
      id: 'prop_001',
      updates,
    });

    // Verify returned proposal includes updates
    expect(updatedProposal).toMatchObject({
      id: 'prop_001',
      ...updates,
    });

    expect(updatedProposal.updated_at).toBeDefined();
  });
});

describe('useUpdateLineItems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  test('updates line items and recalculates totals', async () => {
    const { result } = renderHook(() => useUpdateLineItems());

    const lineItems = [
      {
        id: 'item_001',
        item_type: 'service',
        description: 'Test Service',
        quantity: 5,
        unit_price: 100.00,
        total_price: 500.00,
        sort_order: 0,
      },
      {
        id: 'item_002',
        item_type: 'material',
        description: 'Test Material',
        quantity: 10,
        unit_price: 50.00,
        total_price: 500.00,
        sort_order: 1,
      },
    ];

    const updatedProposal = await result.current.trigger({
      proposal_id: 'prop_001',
      line_items: lineItems,
      tax_rate: 8.25,
    });

    // Verify mutation was called
    expect(console.log).toHaveBeenCalledWith('useUpdateLineItems mutation called with:', {
      proposal_id: 'prop_001',
      line_items: lineItems,
      tax_rate: 8.25,
    });

    // Verify totals were recalculated
    expect(updatedProposal.subtotal).toBe('1000.00');
    expect(updatedProposal.tax_amount).toBe('82.50');
    expect(updatedProposal.total_amount).toBe('1082.50');
    expect(updatedProposal.updated_at).toBeDefined();
  });

  test('handles empty line items array', async () => {
    const { result } = renderHook(() => useUpdateLineItems());

    const updatedProposal = await result.current.trigger({
      proposal_id: 'prop_001',
      line_items: [],
      tax_rate: 0,
    });

    // Empty line items should result in zero totals
    expect(updatedProposal.subtotal).toBe('0.00');
    expect(updatedProposal.tax_amount).toBe('0.00');
    expect(updatedProposal.total_amount).toBe('0.00');
  });
});

describe('useUpdateProposalStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  test('updates status to sent and sets sent_at timestamp', async () => {
    const { result } = renderHook(() => useUpdateProposalStatus());

    const updatedProposal = await result.current.trigger({
      id: 'prop_001',
      status: 'sent',
    });

    // Verify mutation was called
    expect(console.log).toHaveBeenCalledWith('useUpdateProposalStatus mutation called with:', {
      id: 'prop_001',
      status: 'sent',
    });

    // Verify status updated and sent_at set
    expect(updatedProposal.status).toBe('sent');
    expect(updatedProposal.sent_at).toBeDefined();
    expect(updatedProposal.updated_at).toBeDefined();
  });

  test('updates status to accepted and sets accepted_at timestamp', async () => {
    const { result } = renderHook(() => useUpdateProposalStatus());

    const updatedProposal = await result.current.trigger({
      id: 'prop_001',
      status: 'accepted',
    });

    expect(updatedProposal.status).toBe('accepted');
    expect(updatedProposal.accepted_at).toBeDefined();
  });

  test('updates status to rejected and sets rejected_at timestamp', async () => {
    const { result } = renderHook(() => useUpdateProposalStatus());

    const updatedProposal = await result.current.trigger({
      id: 'prop_001',
      status: 'rejected',
    });

    expect(updatedProposal.status).toBe('rejected');
    expect(updatedProposal.rejected_at).toBeDefined();
  });

  test('handles draft status without timestamps', async () => {
    const { result } = renderHook(() => useUpdateProposalStatus());

    const updatedProposal = await result.current.trigger({
      id: 'prop_001',
      status: 'draft',
    });

    expect(updatedProposal.status).toBe('draft');
    // Draft status should not set any status timestamps
    expect(updatedProposal.sent_at).toBeUndefined();
    expect(updatedProposal.accepted_at).toBeUndefined();
    expect(updatedProposal.rejected_at).toBeUndefined();
  });
});

describe('useGenerateProposalPDF', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  test('generates PDF and returns blob URL', async () => {
    const { result } = renderHook(() => useGenerateProposalPDF());

    const pdfResult = await result.current.trigger({
      proposal_id: 'prop_001',
    });

    // Verify mutation was called
    expect(console.log).toHaveBeenCalledWith('useGenerateProposalPDF mutation called with:', {
      proposal_id: 'prop_001',
    });

    // Verify blob URL returned
    expect(pdfResult.blob_url).toBeDefined();
    expect(pdfResult.blob_url).toMatch(/^blob:/);
    expect(pdfResult.filename).toBeDefined();
    expect(pdfResult.filename).toMatch(/\.pdf$/);
  });

  test('generates unique blob URLs for different proposals', async () => {
    const { result } = renderHook(() => useGenerateProposalPDF());

    const pdf1 = await result.current.trigger({ proposal_id: 'prop_001' });
    const pdf2 = await result.current.trigger({ proposal_id: 'prop_002' });

    expect(pdf1.blob_url).not.toBe(pdf2.blob_url);
  });
});
