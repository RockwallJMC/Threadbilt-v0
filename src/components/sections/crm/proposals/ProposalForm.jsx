'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addDays } from 'date-fns';
import IconifyIcon from 'components/base/IconifyIcon';
import { useCreateProposal } from 'services/swr/api-hooks/useProposalApi';
import { DEFAULT_VALID_DAYS, DEFAULT_TERMS_TEMPLATE } from 'constants/crm/proposalDefaults';
import LineItemsTable from './LineItemsTable';
import ProposalSummary from './ProposalSummary';
import ProposalTerms from './ProposalTerms';

/**
 * ProposalForm Component
 *
 * Complete form for creating a new proposal with line items, summary, and terms.
 *
 * @param {Object} props
 * @param {Object} props.opportunity - Opportunity object to pre-fill proposal
 * @param {Function} props.onChange - Change handler: (hasChanges: boolean) => void
 * @param {Function} props.onSuccess - Success callback: (proposal) => void
 * @param {Function} props.onCancel - Cancel handler
 */
const ProposalForm = ({ opportunity, onChange, onSuccess, onCancel }) => {
  const { trigger: createProposal, isMutating } = useCreateProposal();

  // Form state
  const [title, setTitle] = useState(opportunity?.name || '');
  const [description, setDescription] = useState('');
  const [validUntil, setValidUntil] = useState(addDays(new Date(), DEFAULT_VALID_DAYS));
  const [taxRate, setTaxRate] = useState(0);
  const [terms, setTerms] = useState(DEFAULT_TERMS_TEMPLATE);
  const [lineItems, setLineItems] = useState([]);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Track changes for unsaved changes warning
  useEffect(() => {
    const hasChanges =
      title !== (opportunity?.name || '') ||
      description !== '' ||
      lineItems.length > 0 ||
      terms !== DEFAULT_TERMS_TEMPLATE;

    if (onChange) {
      onChange(hasChanges);
    }
  }, [title, description, lineItems, terms, opportunity, onChange]);

  /**
   * Validate form
   */
  const validateForm = () => {
    const errors = {};

    if (!title?.trim()) {
      errors.title = 'Title is required';
    }

    if (lineItems.length === 0) {
      errors.lineItems = 'At least one line item is required';
    }

    if (!validUntil) {
      errors.validUntil = 'Valid until date is required';
    } else if (validUntil < new Date()) {
      errors.validUntil = 'Valid until must be a future date';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    setError(null);

    if (!validateForm()) {
      setError('Please fix the validation errors before saving');
      return;
    }

    try {
      const proposalData = {
        opportunity_id: opportunity?.id,
        title,
        description,
        valid_until: validUntil.toISOString(),
        tax_rate: taxRate,
        terms_and_conditions: terms,
        // Line items will be created separately via useUpdateLineItems
        // For now, just create the proposal shell
      };

      const newProposal = await createProposal(proposalData);

      if (onSuccess) {
        onSuccess(newProposal);
      }
    } catch (err) {
      setError(err.message || 'Failed to create proposal');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ maxWidth: 1400, mx: 'auto', py: 3 }}>
        <Grid container spacing={3}>
          {/* Left Column - Form Fields and Line Items */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={3}>
              {/* Error Alert */}
              {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {/* Basic Info */}
              <Stack spacing={2}>
                <Typography variant="h6">Proposal Details</Typography>

                <TextField
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  error={!!validationErrors.title}
                  helperText={validationErrors.title}
                  required
                  fullWidth
                  placeholder="Enter proposal title..."
                />

                <TextField
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Optional description of this proposal..."
                />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DatePicker
                      label="Valid Until"
                      value={validUntil}
                      onChange={(newValue) => setValidUntil(newValue)}
                      minDate={new Date()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: !!validationErrors.validUntil,
                          helperText: validationErrors.validUntil,
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    {opportunity && (
                      <TextField
                        label="Opportunity"
                        value={opportunity.name}
                        disabled
                        fullWidth
                      />
                    )}
                  </Grid>
                </Grid>
              </Stack>

              {/* Line Items */}
              <Stack spacing={2}>
                <Typography variant="h6">Line Items</Typography>
                {validationErrors.lineItems && (
                  <Alert severity="error">{validationErrors.lineItems}</Alert>
                )}
                <LineItemsTable
                  lineItems={lineItems}
                  onChange={setLineItems}
                  readOnly={false}
                />
              </Stack>

              {/* Terms */}
              <Stack spacing={2}>
                <Typography variant="h6">Terms & Conditions</Typography>
                <ProposalTerms
                  value={terms}
                  onChange={setTerms}
                  readOnly={false}
                />
              </Stack>
            </Stack>
          </Grid>

          {/* Right Column - Summary */}
          <Grid size={{ xs: 12, md: 4 }}>
            <ProposalSummary
              lineItems={lineItems}
              taxRate={taxRate}
              onTaxRateChange={setTaxRate}
              readOnly={false}
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            mt: 4,
            pt: 3,
            borderTop: 1,
            borderColor: 'divider',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant="outlined"
            color="neutral"
            onClick={onCancel}
            disabled={isMutating}
            startIcon={<IconifyIcon icon="material-symbols:close-rounded" />}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={isMutating}
            startIcon={
              <IconifyIcon icon="material-symbols:save-rounded" />
            }
          >
            {isMutating ? 'Saving...' : 'Save as Draft'}
          </Button>
        </Stack>
      </Box>
    </LocalizationProvider>
  );
};

export default ProposalForm;
