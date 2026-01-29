'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  mockProposals,
  getProposalById,
  getProposalsByOpportunityId,
  getProposalsByStatus,
  getProposalWithLineItems,
} from 'data/crm/proposals';
import { generateProposalNumber } from 'utils/crm/proposalNumberGenerator';
import { recalculateProposalTotals } from 'utils/crm/proposalCalculations';

// TODO: Replace with Supabase after Phase 1.2 complete
// import createClient from 'lib/supabase/client';

/**
 * Fetcher function for all proposals with optional filters
 * Filters: status, opportunity_id, search
 *
 * TODO: Replace mock data with Supabase fetcher after Phase 1.2 complete
 * @param {Object} filters - Filter options
 * @param {string} filters.status - Optional status filter ('draft', 'sent', 'accepted', 'rejected', 'expired')
 * @param {string} filters.opportunity_id - Optional opportunity ID filter
 * @param {string} filters.search - Optional search term (searches proposal_number, title, description)
 * @returns {Promise<Array>} Array of proposal objects filtered by organization_id (via RLS)
 */
const proposalsFetcher = async (filters = {}) => {
  // TODO: Replace with Supabase implementation after Phase 1.2 complete
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  //
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  //
  // let query = supabase
  //   .from('proposals')
  //   .select('*, opportunity:opportunities(*), account:accounts(*)')
  //   .order('created_at', { ascending: false });
  //
  // if (filters.status) {
  //   query = query.eq('status', filters.status);
  // }
  //
  // if (filters.opportunity_id) {
  //   query = query.eq('opportunity_id', filters.opportunity_id);
  // }
  //
  // if (filters.search) {
  //   query = query.or(`proposal_number.ilike.%${filters.search}%,title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  // }
  //
  // const { data, error } = await query;
  //
  // if (error) {
  //   throw new Error(error.message);
  // }
  //
  // return data || [];

  // MOCK DATA - Remove after Phase 1.2 complete
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredProposals = [...mockProposals];

      if (filters.status) {
        filteredProposals = getProposalsByStatus(filters.status);
      }

      if (filters.opportunity_id) {
        filteredProposals = filteredProposals.filter(
          (p) => p.opportunity_id === filters.opportunity_id
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProposals = filteredProposals.filter(
          (p) =>
            p.proposal_number.toLowerCase().includes(searchLower) ||
            p.title.toLowerCase().includes(searchLower) ||
            (p.description && p.description.toLowerCase().includes(searchLower))
        );
      }

      resolve(filteredProposals);
    }, 100); // Simulate network delay
  });
};

/**
 * Hook to fetch all proposals for the current organization
 * Proposals are automatically filtered by organization_id via Row Level Security
 *
 * @param {Object} filters - Optional filters
 * @param {string} filters.status - Filter by status
 * @param {string} filters.opportunity_id - Filter by opportunity
 * @param {string} filters.search - Search term
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with proposals data
 *
 * @example
 * const { data: proposals, error, isLoading, mutate } = useProposals();
 * const { data: draftProposals } = useProposals({ status: 'draft' });
 * const { data: oppProposals } = useProposals({ opportunity_id: 'opp_001' });
 * const { data: searchResults } = useProposals({ search: 'payment' });
 */
export const useProposals = (filters = {}, config) => {
  const swr = useSWR(
    ['proposals', filters], // Key includes filters for separate caches
    () => proposalsFetcher(filters),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );

  return swr;
};

/**
 * Fetcher function for a single proposal by ID with joins
 * Returns proposal + line_items + opportunity + account
 *
 * TODO: Replace mock data with Supabase fetcher after Phase 1.2 complete
 * @param {string} id - Proposal ID
 * @returns {Promise<Object>} Proposal object with joined data
 */
const proposalFetcher = async (id) => {
  // TODO: Replace with Supabase implementation after Phase 1.2 complete
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  //
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  //
  // const { data, error } = await supabase
  //   .from('proposals')
  //   .select(`
  //     *,
  //     line_items:proposal_line_items(*),
  //     opportunity:opportunities(*),
  //     account:accounts(*)
  //   `)
  //   .eq('id', id)
  //   .single();
  //
  // if (error) {
  //   throw new Error(error.message);
  // }
  //
  // return data;

  // MOCK DATA - Remove after Phase 1.2 complete
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const proposal = getProposalWithLineItems(id);
      if (proposal) {
        resolve(proposal);
      } else {
        reject(new Error(`Proposal with id ${id} not found`));
      }
    }, 100); // Simulate network delay
  });
};

/**
 * Hook to fetch a single proposal by ID with all related data
 *
 * @param {string} id - Proposal ID
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with proposal data (includes line_items, opportunity, account)
 *
 * @example
 * const { data: proposal, error, isLoading } = useProposal('prop_001');
 */
export const useProposal = (id, config) => {
  const swr = useSWR(
    id ? ['proposal', id] : null, // Key with ID for cache, null if no ID
    () => proposalFetcher(id),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );

  return swr;
};

/**
 * Mutation function to create a new proposal
 *
 * TODO: Replace console.log with Supabase mutation after Phase 1.2 complete
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {Object} options.arg - Proposal data to create
 * @returns {Promise<Object>} Created proposal object
 */
const createProposalMutation = async (url, { arg }) => {
  // TODO: Replace with Supabase implementation after Phase 1.2 complete
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  //
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  //
  // // Generate proposal number (query database for max number in current year)
  // const year = new Date().getFullYear();
  // const { data: lastProposal } = await supabase
  //   .from('proposals')
  //   .select('proposal_number')
  //   .like('proposal_number', `PROP-${year}-%`)
  //   .order('created_at', { ascending: false })
  //   .limit(1);
  //
  // const lastNumber = lastProposal?.[0]?.proposal_number || `PROP-${year}-000`;
  // const counter = parseInt(lastNumber.split('-')[2]) + 1;
  // const proposalNumber = `PROP-${year}-${String(counter).padStart(3, '0')}`;
  //
  // const { data, error } = await supabase
  //   .from('proposals')
  //   .insert([{
  //     ...arg,
  //     proposal_number: proposalNumber,
  //     status: 'draft',
  //     subtotal: 0,
  //     tax_amount: 0,
  //     total_amount: 0,
  //   }])
  //   .select()
  //   .single();
  //
  // if (error) {
  //   throw new Error(error.message);
  // }
  //
  // return data;

  // MOCK IMPLEMENTATION - Remove after Phase 1.2 complete
  console.log('useCreateProposal mutation called with:', arg);
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProposal = {
        id: `prop_${Date.now()}`,
        organization_id: 'org_001', // Would come from RLS/auth context
        proposal_number: generateProposalNumber(),
        status: 'draft',
        subtotal: 0,
        tax_rate: arg.tax_rate || 0,
        tax_amount: 0,
        total_amount: 0,
        ...arg,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sent_at: null,
        accepted_at: null,
        rejected_at: null,
      };
      resolve(newProposal);
    }, 100);
  });
};

/**
 * Hook to create a new proposal
 * Automatically revalidates the proposals list after creation
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useCreateProposal();
 * const newProposal = await trigger({
 *   opportunity_id: 'opp_001',
 *   title: 'Website Redesign Proposal',
 *   description: 'Complete website redesign with modern UX',
 *   valid_until: '2026-03-31',
 *   tax_rate: 8.25,
 *   terms_and_conditions: 'Payment due within 30 days...',
 * });
 */
export const useCreateProposal = () => {
  const mutation = useSWRMutation('create-proposal', createProposalMutation, {
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};

/**
 * Mutation function to update an existing proposal
 *
 * TODO: Replace console.log with Supabase mutation after Phase 1.2 complete
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.id - Proposal ID to update
 * @param {Object} options.arg.updates - Fields to update
 * @returns {Promise<Object>} Updated proposal object
 */
const updateProposalMutation = async (url, { arg }) => {
  const { id, updates } = arg;

  // TODO: Replace with Supabase implementation after Phase 1.2 complete
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  //
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  //
  // const { data, error } = await supabase
  //   .from('proposals')
  //   .update({ ...updates, updated_at: new Date().toISOString() })
  //   .eq('id', id)
  //   .select()
  //   .single();
  //
  // if (error) {
  //   throw new Error(error.message);
  // }
  //
  // return data;

  // MOCK IMPLEMENTATION - Remove after Phase 1.2 complete
  console.log('useUpdateProposal mutation called with:', { id, updates });
  return new Promise((resolve) => {
    setTimeout(() => {
      const updatedProposal = {
        id,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      resolve(updatedProposal);
    }, 100);
  });
};

/**
 * Hook to update an existing proposal
 * Automatically revalidates the proposal and proposals list after update
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useUpdateProposal();
 * const updatedProposal = await trigger({
 *   id: 'prop_001',
 *   updates: {
 *     title: 'Updated Title',
 *     description: 'Updated description',
 *     tax_rate: 8.25,
 *   }
 * });
 */
export const useUpdateProposal = () => {
  const mutation = useSWRMutation('update-proposal', updateProposalMutation, {
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};

/**
 * Mutation function to update proposal line items
 * Replaces all line items and recalculates totals
 *
 * TODO: Replace console.log with Supabase transaction after Phase 1.2 complete
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.proposal_id - Proposal ID
 * @param {Array} options.arg.line_items - New line items array
 * @param {number} options.arg.tax_rate - Tax rate for recalculation
 * @returns {Promise<Object>} Updated proposal object with new totals
 */
const updateLineItemsMutation = async (url, { arg }) => {
  const { proposal_id, line_items, tax_rate } = arg;

  // TODO: Replace with Supabase transaction after Phase 1.2 complete
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  //
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  //
  // // Transaction: Delete old line items, insert new ones, update proposal totals
  // const { error: deleteError } = await supabase
  //   .from('proposal_line_items')
  //   .delete()
  //   .eq('proposal_id', proposal_id);
  //
  // if (deleteError) throw new Error(deleteError.message);
  //
  // if (line_items.length > 0) {
  //   const { error: insertError } = await supabase
  //     .from('proposal_line_items')
  //     .insert(line_items.map(item => ({ ...item, proposal_id })));
  //
  //   if (insertError) throw new Error(insertError.message);
  // }
  //
  // // Recalculate totals
  // const { subtotal, taxAmount, total } = recalculateProposalTotals(line_items, tax_rate);
  //
  // const { data, error } = await supabase
  //   .from('proposals')
  //   .update({
  //     subtotal: parseFloat(subtotal),
  //     tax_rate,
  //     tax_amount: parseFloat(taxAmount),
  //     total_amount: parseFloat(total),
  //     updated_at: new Date().toISOString(),
  //   })
  //   .eq('id', proposal_id)
  //   .select()
  //   .single();
  //
  // if (error) throw new Error(error.message);
  //
  // return data;

  // MOCK IMPLEMENTATION - Remove after Phase 1.2 complete
  console.log('useUpdateLineItems mutation called with:', { proposal_id, line_items, tax_rate });
  return new Promise((resolve) => {
    setTimeout(() => {
      // Recalculate totals
      const { subtotal, taxAmount, total } = recalculateProposalTotals(line_items, tax_rate);

      const updatedProposal = {
        id: proposal_id,
        subtotal,
        tax_rate,
        tax_amount: taxAmount,
        total_amount: total,
        updated_at: new Date().toISOString(),
      };
      resolve(updatedProposal);
    }, 100);
  });
};

/**
 * Hook to update proposal line items
 * Batch updates all line items and recalculates proposal totals
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useUpdateLineItems();
 * const updatedProposal = await trigger({
 *   proposal_id: 'prop_001',
 *   line_items: [
 *     {
 *       id: 'item_001',
 *       item_type: 'service',
 *       description: 'Web Design',
 *       quantity: 1,
 *       unit_price: 5000.00,
 *       total_price: 5000.00,
 *       sort_order: 0,
 *     },
 *     // ... more items
 *   ],
 *   tax_rate: 8.25,
 * });
 */
export const useUpdateLineItems = () => {
  const mutation = useSWRMutation('update-line-items', updateLineItemsMutation, {
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};

/**
 * Mutation function to update proposal status
 * Sets appropriate timestamps based on status
 *
 * TODO: Replace console.log with Supabase mutation after Phase 1.2 complete
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.id - Proposal ID
 * @param {string} options.arg.status - New status ('draft', 'sent', 'accepted', 'rejected', 'expired')
 * @returns {Promise<Object>} Updated proposal object
 */
const updateProposalStatusMutation = async (url, { arg }) => {
  const { id, status } = arg;

  // TODO: Replace with Supabase implementation after Phase 1.2 complete
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  //
  // if (authError || !user) {
  //   throw new Error(authError?.message || 'Not authenticated');
  // }
  //
  // const updates = {
  //   status,
  //   updated_at: new Date().toISOString(),
  // };
  //
  // // Set timestamps based on status
  // if (status === 'sent') {
  //   updates.sent_at = new Date().toISOString();
  // } else if (status === 'accepted') {
  //   updates.accepted_at = new Date().toISOString();
  // } else if (status === 'rejected') {
  //   updates.rejected_at = new Date().toISOString();
  // }
  //
  // const { data, error } = await supabase
  //   .from('proposals')
  //   .update(updates)
  //   .eq('id', id)
  //   .select()
  //   .single();
  //
  // if (error) throw new Error(error.message);
  //
  // return data;

  // MOCK IMPLEMENTATION - Remove after Phase 1.2 complete
  console.log('useUpdateProposalStatus mutation called with:', { id, status });
  return new Promise((resolve) => {
    setTimeout(() => {
      const updates = {
        id,
        status,
        updated_at: new Date().toISOString(),
      };

      // Set timestamps based on status
      if (status === 'sent') {
        updates.sent_at = new Date().toISOString();
      } else if (status === 'accepted') {
        updates.accepted_at = new Date().toISOString();
      } else if (status === 'rejected') {
        updates.rejected_at = new Date().toISOString();
      }

      resolve(updates);
    }, 100);
  });
};

/**
 * Hook to update proposal status
 * Automatically sets appropriate timestamps (sent_at, accepted_at, rejected_at)
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useUpdateProposalStatus();
 * await trigger({ id: 'prop_001', status: 'sent' }); // Sets sent_at
 * await trigger({ id: 'prop_001', status: 'accepted' }); // Sets accepted_at
 * await trigger({ id: 'prop_001', status: 'rejected' }); // Sets rejected_at
 */
export const useUpdateProposalStatus = () => {
  const mutation = useSWRMutation('update-proposal-status', updateProposalStatusMutation, {
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};

/**
 * Mutation function to generate PDF for a proposal
 *
 * TODO: Replace with React-PDF + Supabase Storage after Phase 1.2 complete
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.proposal_id - Proposal ID
 * @returns {Promise<Object>} PDF blob URL and filename
 */
const generateProposalPDFMutation = async (url, { arg }) => {
  const { proposal_id } = arg;

  // TODO: Replace with React-PDF implementation after Phase 1.2 complete
  // import { pdf } from '@react-pdf/renderer';
  // import { ProposalPDF } from 'components/sections/crm/proposal-detail/ProposalPDF';
  //
  // const supabase = createClient();
  // const { data: proposal, error } = await supabase
  //   .from('proposals')
  //   .select('*, line_items:proposal_line_items(*), opportunity:opportunities(*), account:accounts(*)')
  //   .eq('id', proposal_id)
  //   .single();
  //
  // if (error) throw new Error(error.message);
  //
  // // Generate PDF blob
  // const blob = await pdf(<ProposalPDF proposal={proposal} />).toBlob();
  //
  // // Upload to Supabase Storage
  // const filename = `${proposal.proposal_number}.pdf`;
  // const { data: uploadData, error: uploadError } = await supabase.storage
  //   .from('proposals')
  //   .upload(`${proposal.organization_id}/${filename}`, blob, {
  //     contentType: 'application/pdf',
  //     upsert: true,
  //   });
  //
  // if (uploadError) throw new Error(uploadError.message);
  //
  // // Get public URL
  // const { data: { publicUrl } } = supabase.storage
  //   .from('proposals')
  //   .getPublicUrl(`${proposal.organization_id}/${filename}`);
  //
  // return { blob_url: publicUrl, filename };

  // MOCK IMPLEMENTATION - Remove after Phase 1.2 complete
  console.log('useGenerateProposalPDF mutation called with:', { proposal_id });
  return new Promise((resolve) => {
    setTimeout(() => {
      const proposal = getProposalById(proposal_id);
      const filename = proposal ? `${proposal.proposal_number}.pdf` : 'proposal.pdf';
      const mockBlob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(mockBlob);

      resolve({
        blob_url: blobUrl,
        filename,
      });
    }, 100);
  });
};

/**
 * Hook to generate PDF for a proposal
 * Returns blob URL for preview/download
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger, isMutating } = useGenerateProposalPDF();
 * const { blob_url, filename } = await trigger({ proposal_id: 'prop_001' });
 * // Use blob_url for preview or trigger download
 * window.open(blob_url, '_blank');
 * // OR download:
 * const a = document.createElement('a');
 * a.href = blob_url;
 * a.download = filename;
 * a.click();
 */
export const useGenerateProposalPDF = () => {
  const mutation = useSWRMutation('generate-proposal-pdf', generateProposalPDFMutation, {
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });

  return mutation;
};
