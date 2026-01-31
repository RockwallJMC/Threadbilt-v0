'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  DataGrid,
  GridToolbar,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Box,
  Chip,
  Stack,
  Link as MuiLink,
  Snackbar,
  Alert,
  Button,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material';
import { useCRMContacts, useUpdateCRMContact, useArchiveContact } from '@/services/swr/api-hooks/useCRMContactApi';
import paths from '@/routes/paths';

export default function ContactsDataGrid() {
  const router = useRouter();
  const { contacts, isLoading, mutate } = useCRMContacts();
  const { updateContact } = useUpdateCRMContact();
  const { archiveContact, unarchiveContact } = useArchiveContact();

  // Toast state
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success',
    action: null,
  });

  // Pending archive state (for undo)
  const [pendingArchive, setPendingArchive] = useState(null);

  // Handle cell edit commit (optimistic update)
  const handleCellEditCommit = useCallback(
    async (params) => {
      const { id, field, value } = params;

      // Find the current contact for rollback
      const currentContact = contacts.find((c) => c.id === id);
      const oldValue = currentContact?.[field];

      // Optimistic update - update local state immediately
      mutate(
        (data) => ({
          contacts: data.contacts.map((c) =>
            c.id === id ? { ...c, [field]: value } : c
          ),
        }),
        false // Don't revalidate yet
      );

      try {
        // Send update to API
        await updateContact(id, { [field]: value });

        // Show success toast
        setToast({
          open: true,
          message: 'Contact updated successfully',
          severity: 'success',
          action: null,
        });

        // Revalidate in background
        mutate();
      } catch (error) {
        console.error('Failed to update contact:', error);

        // Rollback optimistic update
        mutate(
          (data) => ({
            contacts: data.contacts.map((c) =>
              c.id === id ? { ...c, [field]: oldValue } : c
            ),
          }),
          false
        );

        // Show error toast
        setToast({
          open: true,
          message: `Failed to update contact: ${error.message}`,
          severity: 'error',
          action: null,
        });
      }
    },
    [contacts, mutate, updateContact]
  );

  // Handle archive with undo
  const handleArchive = useCallback(
    (contactId) => {
      const contact = contacts.find((c) => c.id === contactId);
      if (!contact) return;

      // Optimistically remove from grid
      mutate(
        (data) => ({
          contacts: data.contacts.filter((c) => c.id !== contactId),
        }),
        false
      );

      // Store for undo
      setPendingArchive({ contactId, contact });

      // Show toast with undo
      setToast({
        open: true,
        message: 'Contact archived',
        severity: 'info',
        action: (
          <Button
            color="inherit"
            size="small"
            onClick={() => handleUndo(contactId, contact)}
          >
            Undo
          </Button>
        ),
      });

      // Set timeout to permanently archive
      const timeout = setTimeout(async () => {
        try {
          await archiveContact(contactId);
          setPendingArchive(null);
          mutate(); // Revalidate
        } catch (error) {
          console.error('Failed to archive contact:', error);
          // Restore on error
          mutate(
            (data) => ({
              contacts: [...data.contacts, contact],
            }),
            false
          );
          setToast({
            open: true,
            message: `Failed to archive contact: ${error.message}`,
            severity: 'error',
            action: null,
          });
        }
      }, 10000); // 10 second undo window

      // Store timeout ID for cleanup
      setPendingArchive((prev) => ({ ...prev, timeout }));
    },
    [contacts, mutate, archiveContact]
  );

  // Handle undo
  const handleUndo = useCallback(
    (contactId, contact) => {
      // Clear timeout
      if (pendingArchive?.timeout) {
        clearTimeout(pendingArchive.timeout);
      }

      // Restore contact to grid
      mutate(
        (data) => ({
          contacts: [...data.contacts, contact],
        }),
        false
      );

      setPendingArchive(null);

      // Show restored toast
      setToast({
        open: true,
        message: 'Contact restored',
        severity: 'success',
        action: null,
      });
    },
    [pendingArchive, mutate]
  );

  // Handle view contact
  const handleView = useCallback(
    (contactId) => {
      router.push(paths.contactDetails(contactId));
    },
    [router]
  );

  // Handle row double-click
  const handleRowDoubleClick = useCallback(
    (params) => {
      router.push(paths.contactDetails(params.id));
    },
    [router]
  );

  // Column definitions
  const columns = [
    {
      field: 'first_name',
      headerName: 'First Name',
      width: 150,
      editable: true,
    },
    {
      field: 'last_name',
      headerName: 'Last Name',
      width: 150,
      editable: true,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      editable: true,
      type: 'email',
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 140,
      editable: true,
    },
    {
      field: 'mobile',
      headerName: 'Mobile',
      width: 140,
      editable: true,
    },
    {
      field: 'title',
      headerName: 'Title',
      width: 150,
      editable: true,
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 130,
      editable: true,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      editable: true,
      type: 'singleSelect',
      valueOptions: ['active', 'inactive'],
    },
    {
      field: 'account',
      headerName: 'Company',
      width: 180,
      editable: false,
      valueGetter: (value, row) => row.account?.name || '',
      renderCell: (params) => {
        if (!params.row.account?.name) return null;
        return (
          <MuiLink
            href={`/apps/crm/account-details/${params.row.account.id}`}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/apps/crm/account-details/${params.row.account.id}`);
            }}
            sx={{ cursor: 'pointer' }}
          >
            {params.row.account.name}
          </MuiLink>
        );
      },
    },
    {
      field: 'lead_status',
      headerName: 'Lead Status',
      width: 130,
      editable: false,
      renderCell: (params) => {
        if (!params.value) return null;
        return (
          <Chip
            label={params.value}
            size="small"
            color="primary"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'lead_source',
      headerName: 'Lead Source',
      width: 130,
      editable: false,
    },
    {
      field: 'tags',
      headerName: 'Tags',
      width: 200,
      editable: false,
      renderCell: (params) => {
        if (!params.value || params.value.length === 0) return null;
        return (
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
            {params.value.map((tag, idx) => (
              <Chip key={idx} label={tag} size="small" />
            ))}
          </Stack>
        );
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<ViewIcon />}
          label="View"
          onClick={() => handleView(params.id)}
          showInMenu={false}
        />,
        <GridActionsCellItem
          icon={<ArchiveIcon />}
          label="Archive"
          onClick={() => handleArchive(params.id)}
          showInMenu={false}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={contacts}
        columns={columns}
        loading={isLoading}
        slots={{
          toolbar: GridToolbar,
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        onCellEditStop={handleCellEditCommit}
        onRowDoubleClick={handleRowDoubleClick}
        checkboxSelection
        disableRowSelectionOnClick
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25 },
          },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
      />

      {/* Toast Notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={toast.severity === 'info' ? 10000 : 3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          action={toast.action}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
