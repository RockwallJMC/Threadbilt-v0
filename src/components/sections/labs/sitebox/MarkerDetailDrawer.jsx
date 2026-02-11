'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import EditIcon from '@mui/icons-material/Edit';

const DRAWER_WIDTH = 360;

const MarkerDetailDrawer = ({ open, annotation, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!annotation) return null;

  const title = annotation.properties?.title || 'Untitled Pin';
  const color = annotation.properties?.color || '#FF5252';
  const [lng, lat] = annotation.geometry?.coordinates || [0, 0];
  const createdAt = annotation.created_at
    ? new Date(annotation.created_at).toLocaleString()
    : 'Unknown';
  const updatedAt = annotation.updated_at
    ? new Date(annotation.updated_at).toLocaleString()
    : null;

  return (
    <Drawer
      anchor="right"
      variant="persistent"
      open={open}
      slotProps={{
        paper: {
          sx: {
            width: DRAWER_WIDTH,
            bgcolor: '#1e1e1e',
            color: '#fff',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            position: 'fixed',
            zIndex: 1350,
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            bgcolor: color,
            border: '2px solid rgba(255,255,255,0.3)',
            flexShrink: 0,
          }}
        />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }} noWrap>
          {title}
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: 'rgba(255,255,255,0.5)' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="fullWidth"
        sx={{
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          '& .MuiTab-root': {
            color: 'rgba(255,255,255,0.5)',
            minHeight: 44,
            textTransform: 'none',
            fontSize: '0.8rem',
          },
          '& .Mui-selected': { color: '#fff' },
          '& .MuiTabs-indicator': { bgcolor: '#3B82F6' },
        }}
      >
        <Tab label="Linked Data" />
        <Tab label="History" />
        <Tab label="Details" />
      </Tabs>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Tab 0: Linked Data (MVP - empty state) */}
        {activeTab === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              py: 4,
            }}
          >
            <LinkIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.15)' }} />
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}
            >
              No linked items yet
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}
            >
              Link tasks, photos, and documents to this marker location
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<LinkIcon />}
              disabled
              sx={{
                mt: 1,
                color: 'rgba(255,255,255,0.3)',
                borderColor: 'rgba(255,255,255,0.15)',
              }}
            >
              Link Item
            </Button>
          </Box>
        )}

        {/* Tab 1: History (MVP - created entry + coming soon) */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'rgba(255,255,255,0.04)',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#3B82F6',
                  mt: 0.8,
                  flexShrink: 0,
                }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="body2">Marker created</Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  {createdAt}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.3)',
                textAlign: 'center',
                py: 2,
              }}
            >
              Full activity history coming soon
            </Typography>
          </Box>
        )}

        {/* Tab 2: Annotation Details */}
        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Type */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Type
              </Typography>
              <Box>
                <Chip
                  label={annotation.type || 'pin'}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(59,130,246,0.15)',
                    color: '#3B82F6',
                    textTransform: 'capitalize',
                  }}
                />
              </Box>
            </Box>

            {/* Title */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Title
              </Typography>
              <Typography variant="body2">{title}</Typography>
            </Box>

            {/* Color */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Color
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: color,
                    border: '2px solid rgba(255,255,255,0.2)',
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  {color}
                </Typography>
              </Box>
            </Box>

            {/* Coordinates */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Coordinates
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {lat.toFixed(6)}, {lng.toFixed(6)}
              </Typography>
            </Box>

            {/* Created */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Created
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255,255,255,0.7)' }}
              >
                {createdAt}
              </Typography>
            </Box>

            {/* Last Modified */}
            {updatedAt && (
              <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  Last Modified
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  {updatedAt}
                </Typography>
              </Box>
            )}

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 1 }} />

            {/* Edit button */}
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => onEdit?.(annotation)}
              sx={{
                color: 'rgba(255,255,255,0.7)',
                borderColor: 'rgba(255,255,255,0.2)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.4)',
                  bgcolor: 'rgba(255,255,255,0.05)',
                },
              }}
            >
              Edit Marker
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default MarkerDetailDrawer;
