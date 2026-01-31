/**
 * EditableCurrencyInput - Inline editable currency input for deal fields
 *
 * Wraps EditableField with FilledInput and InputAdornment for currency values.
 * Used for Budget Forecast and other monetary fields in Deal Information panel.
 *
 * Features:
 * - Shows formatted currency in view mode (e.g., "$1,234.56")
 * - Input with $ adornment in edit mode
 * - Auto-save on blur or Enter key
 * - Cancel on Escape key
 * - Loading state during save
 * - Edit icon appears on hover
 *
 * Aurora Search: No inline currency editing patterns found in Aurora templates.
 * This is a custom PierceDesk pattern for inline editable currency fields.
 */

import FilledInput from '@mui/material/FilledInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { currencyFormat } from 'lib/utils';
import IconifyIcon from 'components/base/IconifyIcon';
import EditableField from './EditableField';

/**
 * Inline editable currency input component
 * @param {number|null} value - Current currency value
 * @param {function} onSave - Async save handler (value) => Promise
 * @param {string} label - Field label for input
 */
const EditableCurrencyInput = ({ value, onSave, label }) => {
  const renderView = (currentValue, handleEdit) => (
    <Stack
      direction="row"
      gap={1}
      onClick={handleEdit}
      data-testid="currency-view"
      sx={{
        cursor: 'pointer',
        p: 1,
        borderRadius: 1,
        '&:hover': {
          bgcolor: 'action.hover',
          '& .edit-icon': { opacity: 1 },
        },
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
        {currentValue !== null && currentValue !== undefined
          ? currencyFormat(currentValue)
          : 'Click to set...'}
      </Typography>
      <IconifyIcon
        icon="material-symbols:edit-outline"
        className="edit-icon"
        sx={{ fontSize: 16, opacity: 0, transition: 'opacity 0.2s' }}
      />
    </Stack>
  );

  const renderEdit = (editValue, setEditValue, handleSave, handleCancel, isSaving) => (
    <Stack direction="row" gap={1} alignItems="flex-start">
      <FormControl variant="filled" fullWidth>
        <InputLabel>{label}</InputLabel>
        <FilledInput
          type="number"
          autoFocus
          value={editValue || ''}
          onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
          onBlur={() => handleSave(editValue)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleCancel();
            } else if (e.key === 'Enter') {
              handleSave(editValue);
            }
          }}
          startAdornment={<InputAdornment position="start">$</InputAdornment>}
          disabled={isSaving}
        />
      </FormControl>
      {isSaving && <CircularProgress size={20} sx={{ mt: 2 }} />}
    </Stack>
  );

  return (
    <EditableField
      value={value}
      onSave={onSave}
      renderView={renderView}
      renderEdit={renderEdit}
      fieldName={label}
    />
  );
};

export default EditableCurrencyInput;
