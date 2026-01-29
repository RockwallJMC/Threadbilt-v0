'use client';

import { TextField, Typography, Stack } from '@mui/material';
import { DEFAULT_TERMS_TEMPLATE } from 'constants/crm/proposalDefaults';

const MAX_CHARACTERS = 5000;

/**
 * ProposalTerms Component
 *
 * Multi-line text area for proposal terms and conditions with character count.
 *
 * @param {Object} props
 * @param {string} props.value - Current terms text
 * @param {Function} props.onChange - Change handler: (value) => void
 * @param {boolean} props.readOnly - If true, field is read-only
 * @param {boolean} props.error - If true, shows error state
 * @param {string} props.helperText - Helper text to display
 */
const ProposalTerms = ({
  value = DEFAULT_TERMS_TEMPLATE,
  onChange,
  readOnly = false,
  error = false,
  helperText = '',
}) => {
  const characterCount = value?.length || 0;
  const isOverLimit = characterCount > MAX_CHARACTERS;

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <Stack spacing={1}>
      <TextField
        label="Terms & Conditions"
        multiline
        rows={8}
        value={value}
        onChange={handleChange}
        disabled={readOnly}
        error={error || isOverLimit}
        helperText={
          helperText || (isOverLimit ? 'Character limit exceeded' : '')
        }
        fullWidth
        placeholder="Enter payment terms, guarantees, and other conditions..."
        slotProps={{
          input: {
            sx: {
              fontFamily: 'monospace',
              fontSize: '0.875rem',
            },
          },
        }}
      />
      <Typography
        variant="caption"
        color={isOverLimit ? 'error' : 'text.secondary'}
        align="right"
      >
        {characterCount} / {MAX_CHARACTERS} characters
      </Typography>
    </Stack>
  );
};

export default ProposalTerms;
