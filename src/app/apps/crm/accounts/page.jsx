'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DataGrid } from '@mui/x-data-grid';

const seedAccounts = [
  { id: 'acc-1', name: 'Acme Corporation', industry: 'Manufacturing', website: 'https://acme.com', phone: '+1-555-1111' },
  { id: 'acc-2', name: 'Globex Industries', industry: 'Energy', website: 'https://globex.com', phone: '+1-555-2222' },
  { id: 'acc-3', name: 'Initech', industry: 'Technology', website: 'https://initech.com', phone: '+1-555-3333' },
];

const AccountsPage = () => {
  const [rows, setRows] = useState(seedAccounts);
  const [filter, setFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [form, setForm] = useState({ name: '', industry: '', website: '', phone: '' });

  useEffect(() => {
    setRows(seedAccounts);
  }, []);

  const filtered = useMemo(() => {
    if (!filter) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()));
  }, [filter, rows]);

  const handleSave = () => {
    if (editing) {
      setRows((prev) => prev.map((r) => (r.id === editing ? { ...r, ...form } : r)));
    } else {
      setRows((prev) => [...prev, { id: `acc-${prev.length + 1}`, ...form }]);
    }
    setDialogOpen(false);
    setEditing(null);
    setViewMode(false);
  };

  const handleDelete = (id) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'industry', headerName: 'Industry', flex: 1 },
    { field: 'website', headerName: 'Website', flex: 1 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            onClick={() => {
              setEditing(params.row.id);
              setForm(params.row);
              setViewMode(true);
              setDialogOpen(true);
            }}
          >
            View
          </Button>
          <Button
            size="small"
            onClick={() => {
              setEditing(params.row.id);
              setForm(params.row);
              setViewMode(false);
              setDialogOpen(true);
            }}
          >
            Edit
          </Button>
          <Button size="small" color="error" onClick={() => handleDelete(params.row.id)}>
            Delete
          </Button>
        </Stack>
      ),
      flex: 1,
    },
  ];

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Accounts</Typography>
        <Button variant="contained" onClick={() => { setEditing(null); setViewMode(false); setForm({ name: '', industry: '', website: '', phone: '' }); setDialogOpen(true); }}>
          Add Account
        </Button>
      </Stack>

      <TextField
        placeholder="Search"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        inputProps={{ role: 'searchbox' }}
      />

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          disableColumnMenu
          initialState={{ sorting: { sortModel: [{ field: 'name', sort: 'asc' }] } }}
        />
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {viewMode ? 'View Account' : editing ? 'Edit Account' : 'Create Account'}
          <IconButton onClick={() => setDialogOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField label="Account Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={viewMode} />
            <TextField label="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} disabled={viewMode} />
            <TextField label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} disabled={viewMode} />
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={viewMode} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          {!viewMode && <Button variant="contained" onClick={handleSave}>Save</Button>}
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default AccountsPage;
