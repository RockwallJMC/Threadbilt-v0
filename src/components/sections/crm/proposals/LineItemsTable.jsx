'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import IconifyIcon from 'components/base/IconifyIcon';
import { ITEM_TYPES } from 'constants/crm/proposalDefaults';
import { calculateLineItemTotal } from 'utils/crm/proposalCalculations';

/**
 * SortableRow component for drag-and-drop row reordering
 */
const SortableRow = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

/**
 * LineItemsTable Component
 *
 * Editable table for managing proposal line items with:
 * - Inline cell editing (500ms debounce)
 * - Drag-and-drop row reordering
 * - Real-time total calculation
 * - Add/delete rows
 * - Validation
 * - Mobile responsive (stacked cards on < 900px)
 *
 * @param {Object} props
 * @param {Array} props.lineItems - Array of line item objects
 * @param {Function} props.onChange - Callback when line items change: (newLineItems) => void
 * @param {boolean} props.readOnly - If true, editing is disabled
 */
const LineItemsTable = ({ lineItems = [], onChange, readOnly = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingCells, setEditingCells] = useState({});
  const [debounceTimers, setDebounceTimers] = useState({});

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  /**
   * Handle cell edit with 500ms debounce
   */
  const handleCellEdit = useCallback(
    (params) => {
      const { id, field, value } = params;

      // Clear existing timer for this cell
      const cellKey = `${id}-${field}`;
      if (debounceTimers[cellKey]) {
        clearTimeout(debounceTimers[cellKey]);
      }

      // Set new timer
      const timer = setTimeout(() => {
        const updatedItems = lineItems.map((item) => {
          if (item.id !== id) return item;

          let newValue = value;

          // Parse numeric values
          if (field === 'quantity' || field === 'unit_price') {
            newValue = parseFloat(value) || 0;
            if (newValue < 0) newValue = 0;
          }

          // Validate description
          if (field === 'description' && typeof newValue === 'string' && newValue.length < 3) {
            // Don't update if description is too short
            return item;
          }

          const updated = { ...item, [field]: newValue };

          // Recalculate total if quantity or unit_price changed
          if (field === 'quantity' || field === 'unit_price') {
            updated.total_price = calculateLineItemTotal(updated.quantity, updated.unit_price);
          }

          return updated;
        });

        onChange(updatedItems);

        // Clean up timer
        setDebounceTimers((prev) => {
          const newTimers = { ...prev };
          delete newTimers[cellKey];
          return newTimers;
        });
      }, 500);

      setDebounceTimers((prev) => ({ ...prev, [cellKey]: timer }));
    },
    [lineItems, onChange, debounceTimers],
  );

  /**
   * Handle drag end for row reordering
   */
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = lineItems.findIndex((item) => item.id === active.id);
      const newIndex = lineItems.findIndex((item) => item.id === over.id);

      const reordered = arrayMove(lineItems, oldIndex, newIndex).map((item, index) => ({
        ...item,
        sort_order: index,
      }));

      onChange(reordered);
    }
  };

  /**
   * Add a new row
   */
  const handleAddRow = () => {
    const newItem = {
      id: `temp_${Date.now()}`, // Temporary ID until saved to database
      item_type: 'service',
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      sort_order: lineItems.length,
    };

    onChange([...lineItems, newItem]);
  };

  /**
   * Open delete confirmation dialog
   */
  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  /**
   * Confirm delete
   */
  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      const filtered = lineItems
        .filter((item) => item.id !== itemToDelete)
        .map((item, index) => ({ ...item, sort_order: index }));

      onChange(filtered);
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  /**
   * Cancel delete
   */
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  /**
   * DataGrid columns
   */
  const columns = useMemo(
    () => [
      {
        field: 'dragHandle',
        headerName: '',
        width: 50,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: () => (
          <IconButton size="small" sx={{ cursor: 'grab' }}>
            <IconifyIcon icon="material-symbols:drag-indicator" />
          </IconButton>
        ),
      },
      {
        field: 'item_type',
        headerName: 'Type',
        width: 130,
        editable: !readOnly,
        type: 'singleSelect',
        valueOptions: ITEM_TYPES,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
            {params.value || '—'}
          </Typography>
        ),
      },
      {
        field: 'description',
        headerName: 'Description',
        minWidth: 300,
        flex: 1,
        editable: !readOnly,
      },
      {
        field: 'quantity',
        headerName: 'Quantity',
        width: 110,
        type: 'number',
        editable: !readOnly,
        align: 'right',
        headerAlign: 'right',
      },
      {
        field: 'unit_price',
        headerName: 'Unit Price',
        width: 130,
        type: 'number',
        editable: !readOnly,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <Typography variant="body2">{formatCurrency(params.value)}</Typography>
        ),
      },
      {
        field: 'total_price',
        headerName: 'Total',
        width: 130,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {formatCurrency(params.value)}
          </Typography>
        ),
      },
      {
        field: 'actions',
        headerName: '',
        width: 60,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteClick(params.row.id)}
            disabled={readOnly}
          >
            <IconifyIcon icon="material-symbols:delete-outline-rounded" />
          </IconButton>
        ),
      },
    ],
    [readOnly],
  );

  /**
   * Mobile Card View (< 900px)
   */
  if (isMobile) {
    return (
      <Box>
        <Stack spacing={2}>
          {lineItems.map((item, index) => (
            <Box
              key={item.id}
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper',
              }}
            >
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    #{index + 1} • {item.item_type || 'No Type'}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(item.id)}
                    disabled={readOnly}
                  >
                    <IconifyIcon icon="material-symbols:delete-outline-rounded" />
                  </IconButton>
                </Stack>
                <Typography variant="body2">{item.description || 'No description'}</Typography>
                <Stack direction="row" spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Qty
                    </Typography>
                    <Typography variant="body2">{item.quantity}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Unit Price
                    </Typography>
                    <Typography variant="body2">{formatCurrency(item.unit_price)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Total
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(item.total_price)}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>

        {!readOnly && (
          <Button
            variant="outlined"
            color="primary"
            onClick={handleAddRow}
            startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
            sx={{ mt: 2 }}
          >
            Add Row
          </Button>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Delete Line Item</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this line item? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  /**
   * Desktop DataGrid with Drag-and-Drop
   */
  return (
    <Box>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={lineItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <DataGrid
            rows={lineItems}
            columns={columns}
            autoHeight
            disableRowSelectionOnClick
            hideFooter
            processRowUpdate={(newRow) => {
              const updatedItems = lineItems.map((item) =>
                item.id === newRow.id ? newRow : item,
              );
              onChange(updatedItems);
              return newRow;
            }}
            onProcessRowUpdateError={(error) => {
              console.error('Row update error:', error);
            }}
            slots={{
              row: SortableRow,
            }}
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-cell:focus-within': {
                outline: '2px solid',
                outlineColor: 'primary.main',
              },
            }}
          />
        </SortableContext>
      </DndContext>

      {!readOnly && (
        <Button
          variant="outlined"
          color="primary"
          onClick={handleAddRow}
          startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
          sx={{ mt: 2 }}
        >
          Add Row
        </Button>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Line Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this line item? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LineItemsTable;
