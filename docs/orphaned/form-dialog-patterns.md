# Form and Dialog Layout Patterns

This reference provides copy-paste ready patterns for common form and dialog layouts in PierceDesk.

## Basic Dialog with Form

```jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from '@mui/material';

const BasicFormDialog = ({ open, onClose, onSubmit }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Item</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={12}>
            <TextField
              fullWidth
              required
              label="Title"
              name="title"
              autoFocus
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              name="description"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

## Multi-Column Dialog Form

```jsx
const TaskFormDialog = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Task</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Full width title field */}
          <Grid size={12}>
            <TextField fullWidth required label="Title" />
          </Grid>

          {/* Two-column row */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth select label="Column">
              {columns.map((col) => (
                <MenuItem key={col.id} value={col.id}>{col.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth select label="Priority">
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
          </Grid>

          {/* Full width description */}
          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              placeholder="Enter task description..."
            />
          </Grid>

          {/* Two-column row for dates */}
          <Grid size={{ xs: 12, md: 6 }}>
            <DatePicker
              label="Due Date"
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth select label="Assignee">
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary">
          Create Task
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

## Contact/Address Form Dialog

```jsx
const ContactFormDialog = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Contact</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Name row */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth required label="First Name" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth required label="Last Name" />
          </Grid>

          {/* Contact info */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth type="email" label="Email" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth type="tel" label="Phone" />
          </Grid>

          {/* Address - full width street */}
          <Grid size={12}>
            <TextField fullWidth label="Street Address" />
          </Grid>

          {/* City, State, ZIP pattern */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="City" />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField fullWidth label="State" />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField fullWidth label="ZIP Code" />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained">Save Contact</Button>
      </DialogActions>
    </Dialog>
  );
};
```

## Settings/Edit Dialog with Sections

```jsx
const SettingsDialog = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Section 1: General */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              General
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField fullWidth label="Display Name" />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth multiline rows={2} label="Bio" />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Section 2: Notifications */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Notifications
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <FormControlLabel
                  control={<Switch />}
                  label="Email notifications"
                />
              </Grid>
              <Grid size={12}>
                <FormControlLabel
                  control={<Switch />}
                  label="Push notifications"
                />
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained">Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
};
```

## Page-Level Form Card

```jsx
const FormPageCard = () => {
  return (
    <Paper
      background={1}
      sx={{
        p: { xs: 3, md: 5 },
        borderRadius: 6,
      }}
    >
      <Stack spacing={3}>
        <Typography variant="h6">Project Details</Typography>

        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid size={12}>
            <TextField fullWidth required label="Project Name" />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth select label="Status">
              <MenuItem value="planning">Planning</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth select label="Priority">
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button>Cancel</Button>
          <Button variant="contained">Save</Button>
        </Box>
      </Stack>
    </Paper>
  );
};
```

## Inline Edit Form (within Table/List)

```jsx
const InlineEditRow = ({ item, onSave, onCancel }) => {
  return (
    <TableRow>
      <TableCell>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              defaultValue={item.name}
              label="Name"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              select
              defaultValue={item.status}
              label="Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={onCancel}>Cancel</Button>
          <Button size="small" variant="contained" onClick={onSave}>Save</Button>
        </Stack>
      </TableCell>
    </TableRow>
  );
};
```

## Filter Form (Sidebar/Header)

```jsx
const FilterForm = ({ onApply, onReset }) => {
  return (
    <Paper background={1} sx={{ p: 3, borderRadius: 4 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle2">Filters</Typography>

        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField fullWidth size="small" label="Search" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth size="small" select label="Status">
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth size="small" select label="Category">
              <MenuItem value="">All</MenuItem>
              <MenuItem value="a">Category A</MenuItem>
              <MenuItem value="b">Category B</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button size="small" onClick={onReset}>Reset</Button>
          <Button size="small" variant="contained" onClick={onApply}>Apply</Button>
        </Stack>
      </Stack>
    </Paper>
  );
};
```

## Key Principles Recap

1. **Dialog maxWidth**: Use `"sm"` for simple forms, `"md"` for complex multi-column
2. **fullWidth on Dialog**: Always pair `maxWidth` with `fullWidth` prop
3. **mt: 1 in DialogContent**: Prevents label overlap with title
4. **fullWidth on ALL inputs**: TextField, Select, Autocomplete, DatePicker
5. **Grid for columns**: Never use flex or inline styles for column layout
6. **Stack for sections**: Vertical spacing between form sections
7. **Responsive sizes**: `size={{ xs: 12, md: 6 }}` - full width mobile, half on desktop
