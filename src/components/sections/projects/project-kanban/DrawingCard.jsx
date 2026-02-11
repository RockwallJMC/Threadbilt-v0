'use client';

import { memo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconifyIcon from 'components/base/IconifyIcon';

const DrawingCard = memo(({ drawing }) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const isImage = drawing.mime_type?.startsWith('image/');
  const isPdf = drawing.mime_type === 'application/pdf';

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDrawingLab = () => {
    handleMenuClose();
    router.push(`/apps/labs/sitebox/${drawing.project_id}/${drawing.id}`);
  };

  const handleEditSettings = () => {
    handleMenuClose();
    // TODO: open edit settings dialog
  };

  return (
    <Card
      data-testid="drawing-card"
      sx={{
        borderRadius: 4,
        outline: 'none',
        bgcolor: 'background.elevation2',
        '&:hover': { bgcolor: 'background.elevation3' },
      }}
    >
      {isImage && drawing.signed_url && (
        <CardMedia
          component="img"
          image={drawing.signed_url}
          alt={drawing.title}
          sx={{
            height: 140,
            objectFit: 'cover',
            p: 1,
            borderRadius: 4,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
        />
      )}

      {isPdf && (
        <Box
          sx={{
            height: 140,
            bgcolor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
            borderRadius: 4,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
        >
          <IconifyIcon icon="material-symbols:picture-as-pdf" sx={{ fontSize: 48, color: 'error.main' }} />
        </Box>
      )}

      <CardContent sx={{ p: 2, pb: (theme) => `${theme.spacing(2)} !important` }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {drawing.title}
          </Typography>
          <IconButton size="small" onClick={handleMenuOpen} sx={{ mt: -0.5, mr: -0.5 }}>
            <IconifyIcon icon="material-symbols:more-vert" sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Chip
            size="small"
            label={drawing.drawing_type}
            color="primary"
            variant="outlined"
            sx={{ height: 24, textTransform: 'capitalize' }}
          />
          <Chip
            size="small"
            label={drawing.version}
            color="default"
            variant="outlined"
            sx={{ height: 24 }}
          />
        </Stack>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { sx: { minWidth: 180 } } }}
      >
        <MenuItem onClick={handleOpenDrawingLab}>
          <ListItemIcon>
            <IconifyIcon icon="material-symbols:draw-outline" sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText>Open in Drawing Lab</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditSettings}>
          <ListItemIcon>
            <IconifyIcon icon="material-symbols:settings-outline" sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText>Edit Settings</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
});

export default DrawingCard;
