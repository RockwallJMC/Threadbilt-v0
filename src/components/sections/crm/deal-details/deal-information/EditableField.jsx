/**
 * Aurora Search: No inline editing patterns found in Aurora templates.
 * This is a custom PierceDesk pattern for inline editable fields.
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * Generic wrapper for inline editable fields
 * @param {string} value - Current field value
 * @param {function} onSave - Async save handler (value) => Promise
 * @param {function} renderView - Render function for view mode (value, handleEdit)
 * @param {function} renderEdit - Render function for edit mode (editValue, setEditValue, handleSave, handleCancel, isSaving)
 * @param {string} fieldName - Field name for error messages
 */
const EditableField = ({ value, onSave, renderView, renderEdit, fieldName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState(null);

  const handleEdit = () => {
    setEditValue(value);
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async (newValue) => {
    if (newValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(newValue);
      setIsEditing(false);
    } catch (err) {
      console.error(`Failed to update ${fieldName}:`, err);
      setError(`Failed to update ${fieldName}. Please try again.`);
      setEditValue(value); // Revert to original value
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <Box>
        {renderEdit(editValue, setEditValue, handleSave, handleCancel, isSaving)}
        {error && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
            {error}
          </Typography>
        )}
      </Box>
    );
  }

  return renderView(value, handleEdit);
};

export default EditableField;
