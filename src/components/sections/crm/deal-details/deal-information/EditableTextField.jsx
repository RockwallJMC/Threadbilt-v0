import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import IconifyIcon from 'components/base/IconifyIcon';
import EditableField from './EditableField';

const EditableTextField = ({ value, onSave, label, multiline = false, rows = 1 }) => {
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
        {currentValue || 'Click to add...'}
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
      <TextField
        variant="filled"
        fullWidth
        multiline={multiline}
        rows={rows}
        autoFocus
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => handleSave(editValue)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            handleCancel();
          } else if (e.key === 'Enter' && !multiline) {
            handleSave(editValue);
          }
        }}
        disabled={isSaving}
        label={label}
      />
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

export default EditableTextField;
