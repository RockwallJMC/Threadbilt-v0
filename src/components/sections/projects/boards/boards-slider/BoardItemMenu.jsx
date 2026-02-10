import { useState } from 'react';
import { Grow, ListItemIcon, ListItemText } from '@mui/material';
import Button from '@mui/material/Button';
import Menu, { menuClasses } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import IconifyIcon from 'components/base/IconifyIcon';

const menuItems = [
  {
    id: 'viewBoard',
    label: 'View Board',
    icon: 'material-symbols:dashboard-outline',
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: 'material-symbols:edit-outline',
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: 'material-symbols:archive-outline',
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: 'material-symbols:delete-outline',
    color: 'error.main',
  },
];

const BoardItemMenu = ({ isHovered, boardId, onViewBoard, onEdit, onArchive, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { up } = useBreakpoints();
  const upSm = up('sm');

  const isOpen = Boolean(anchorEl);

  const actionButton = (
    <Button
      variant="soft"
      color="neutral"
      shape="circle"
      id="board-item-menu"
      aria-controls={isOpen ? 'board-item-menu' : undefined}
      aria-expanded={isOpen ? 'true' : undefined}
      aria-haspopup="true"
      onClick={(e) => setAnchorEl(e.currentTarget)}
      sx={{ position: 'absolute', zIndex: 1, top: 16, right: 16 }}
    >
      <IconifyIcon
        icon="material-symbols:more-horiz"
        sx={{ fontSize: 20, pointerEvents: 'none' }}
      />
    </Button>
  );

  return (
    <>
      {upSm ? <Grow in={isHovered}>{actionButton}</Grow> : actionButton}
      <Menu
        id="board-item-menu"
        anchorEl={anchorEl}
        open={isOpen}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          list: {
            'aria-labelledby': 'board-item-menu',
          },
        }}
        sx={{
          [`& .${menuClasses.paper}`]: {
            minWidth: 120,
          },
        }}
      >
        {menuItems.map((item) => (
          <MenuItem
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              setAnchorEl(null);
              if (item.id === 'viewBoard' && onViewBoard) onViewBoard(boardId);
              if (item.id === 'edit' && onEdit) onEdit(boardId);
              if (item.id === 'archive' && onArchive) onArchive(boardId);
              if (item.id === 'delete' && onDelete) onDelete(boardId);
            }}
            sx={[{ textTransform: 'capitalize' }, item.color && { color: item.color }]}
            disableRipple
          >
            <ListItemIcon sx={{ color: item.color || 'inherit', minWidth: 32 }}>
              <IconifyIcon icon={item.icon} sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default BoardItemMenu;
