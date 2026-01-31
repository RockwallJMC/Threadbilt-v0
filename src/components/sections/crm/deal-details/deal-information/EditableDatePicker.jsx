/**
 * EditableDatePicker - Inline editable date picker field
 *
 * Architecture:
 * - Wraps EditableField with DatePicker from @mui/x-date-pickers
 * - Auto-saves on date selection (no explicit save button needed)
 * - Shows formatted date in view mode (MMM D, YYYY)
 * - Uses dayjs for date manipulation and formatting
 *
 * Usage:
 * <EditableDatePicker
 *   value={deal.closing_date}
 *   onSave={async (newDate) => await updateDeal({ closing_date: newDate })}
 *   label="Closing Date"
 * />
 *
 * Aurora Search: No inline date picker patterns found in Aurora templates.
 * This is a custom PierceDesk pattern for inline editable date fields.
 */

import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import dayjs from 'dayjs';
import IconifyIcon from 'components/base/IconifyIcon';
import EditableField from './EditableField';

/**
 * Inline editable date picker field
 * @param {string} value - Current date value (ISO string)
 * @param {function} onSave - Async save handler (isoString) => Promise
 * @param {string} label - Field label for the date picker
 */
const EditableDatePicker = ({ value, onSave, label }) => {
  const renderView = (currentValue, handleEdit) => (
    <Stack
      direction="row"
      gap={1}
      onClick={handleEdit}
      sx={{
        cursor: 'pointer',
        p: 1,
        borderRadius: 1,
        '&:hover': {
          bgcolor: 'action.hover',
          '& .edit-icon': { opacity: 1 }
        }
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
        {currentValue ? dayjs(currentValue).format('MMM D, YYYY') : 'Click to set...'}
      </Typography>
      <IconifyIcon
        icon="material-symbols:edit-outline"
        className="edit-icon"
        sx={{ fontSize: 16, opacity: 0, transition: 'opacity 0.2s' }}
      />
    </Stack>
  );

  const renderEdit = (editValue, setEditValue, handleSave, handleCancel, isSaving) => {
    const [dateValue, setDateValue] = useState(editValue ? dayjs(editValue) : null);

    return (
      <Stack direction="row" gap={1} alignItems="flex-start">
        <DatePicker
          label={label}
          value={dateValue}
          onChange={(newValue) => {
            setDateValue(newValue);
            if (newValue) {
              handleSave(newValue.toISOString());
            }
          }}
          slotProps={{
            textField: {
              variant: 'filled',
              fullWidth: true,
              autoFocus: true,
              onBlur: handleCancel,
              onKeyDown: (e) => {
                if (e.key === 'Escape') handleCancel();
              }
            }
          }}
          disabled={isSaving}
        />
        {isSaving && <CircularProgress size={20} sx={{ mt: 2 }} />}
      </Stack>
    );
  };

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

export default EditableDatePicker;
