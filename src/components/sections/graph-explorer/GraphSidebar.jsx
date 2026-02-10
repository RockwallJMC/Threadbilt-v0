'use client';

import {
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  Skeleton,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { useNodeDetails } from 'services/swr/api-hooks/useGraphApi';
import { nodeTypeConfig } from 'data/graph/nodeStyles';
import { useRouter } from 'next/navigation';
import paths from 'routes/paths';

/**
 * Sidebar panel showing details of the selected node
 */
export default function GraphSidebar({ selectedNode, onClose }) {
  const router = useRouter();
  const { data: nodeDetails, isLoading } = useNodeDetails(
    selectedNode?.type,
    selectedNode?.entityId
  );

  if (!selectedNode) {
    return (
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'text.secondary',
        }}
      >
        <Typography variant="body2">
          Click on a node to view details
        </Typography>
      </Box>
    );
  }

  const typeConfig = nodeTypeConfig[selectedNode.type] || {};

  // Get navigation path based on node type
  const getEntityPath = () => {
    const entityId = selectedNode.entityId;
    switch (selectedNode.type) {
      case 'accounts':
        return paths.contactDetails?.(entityId) || paths.contacts;
      case 'contacts':
        return paths.contactDetails?.(entityId) || paths.contacts;
      case 'opportunities':
        return paths.dealDetails?.(entityId) || paths.deals;
      case 'deals':
        return paths.dealDetails?.(entityId) || paths.deals;
      case 'projects':
        return paths.projectBoards;
      case 'leads':
        return paths.leadDetails;
      default:
        return null;
    }
  };

  const handleNavigate = () => {
    const path = getEntityPath();
    if (path) {
      router.push(path);
    }
  };

  // Format value for display
  const formatValue = (value) => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(value);
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (value instanceof Date || (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/))) {
      return new Date(value).toLocaleDateString();
    }
    return String(value);
  };

  // Fields to display based on node type
  const getDisplayFields = () => {
    if (!nodeDetails) return [];

    const commonFields = ['name', 'email', 'phone', 'status', 'stage', 'value', 'created_at'];
    const fields = [];

    for (const key of commonFields) {
      if (nodeDetails[key] !== undefined && nodeDetails[key] !== null) {
        fields.push({ key, value: nodeDetails[key] });
      }
    }

    return fields;
  };

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Chip
            label={typeConfig.label || selectedNode.type}
            size="small"
            sx={{
              mb: 1,
              bgcolor: `${typeConfig.color?.split('.')[0] || 'grey'}.100`,
              color: `${typeConfig.color?.split('.')[0] || 'grey'}.700`,
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {selectedNode.label || selectedNode.name || 'Unknown'}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Details */}
      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="40%" />
        </Box>
      ) : nodeDetails ? (
        <List dense disablePadding>
          {getDisplayFields().map(({ key, value }) => (
            <ListItem key={key} disablePadding sx={{ py: 0.5 }}>
              <ListItemText
                primary={
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                    {key.replace(/_/g, ' ')}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatValue(value)}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Additional details not available
        </Typography>
      )}

      {/* Actions */}
      {getEntityPath() && (
        <Box sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            endIcon={<OpenInNewRoundedIcon />}
            onClick={handleNavigate}
          >
            View Full Details
          </Button>
        </Box>
      )}

      {/* Metadata */}
      <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          ID: {selectedNode.entityId || selectedNode.id}
        </Typography>
      </Box>
    </Box>
  );
}
