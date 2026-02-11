'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Stack,
  Typography,
  Avatar,
  Chip,
  Button,
} from '@mui/material';
import { ROLE_STYLES } from 'services/swr/api-hooks/useOrganizationHierarchyApi';

const RoleBadge = ({ role }) => {
  if (!role) return null;
  const style = ROLE_STYLES[role] || ROLE_STYLES.member;
  return (
    <Chip
      label={role.charAt(0).toUpperCase() + role.slice(1)}
      size="small"
      sx={{
        bgcolor: style.color,
        color: 'white',
        fontWeight: 600,
        textTransform: 'capitalize',
      }}
    />
  );
};

const ExpandedOrgNode = ({ data }) => {
  const role = data.attributes?.role;
  const style = ROLE_STYLES[role] || ROLE_STYLES.member;
  const member = data.member;

  return (
    <>
      <Handle type="target" position={Position.Left} style={{ visibility: 'hidden' }} />
      <Card
        background={1}
        variant="outlined"
        sx={{
          width: 300,
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: 3,
            transform: 'translateX(2px)',
          },
        }}
      >
        <CardHeader
          avatar={
            <Avatar
              src={member?.avatar}
              alt={data.name}
              sx={{
                width: 40,
                height: 40,
                border: `3px solid ${style.color}`,
              }}
            >
              {data.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          }
          title={data.name}
          subheader={data.attributes?.email}
          titleTypographyProps={{ variant: 'subtitle2', fontWeight: 600, noWrap: true }}
          subheaderTypographyProps={{ variant: 'caption', noWrap: true }}
          sx={{ pb: 1, '& .MuiCardHeader-content': { minWidth: 0 } }}
        />
        <CardContent sx={{ pt: 0, pb: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: 'wrap' }}>
            <RoleBadge role={role} />
            {member?.joinedAt && (
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                Joined {new Date(member.joinedAt).toLocaleDateString()}
              </Typography>
            )}
          </Stack>
        </CardContent>
        <CardActions sx={{ pt: 0 }}>
          <Button size="small" data-action="view-details">
            View Details
          </Button>
          <Button size="small" data-action="collapse">
            Collapse
          </Button>
        </CardActions>
      </Card>
      <Handle type="source" position={Position.Right} style={{ visibility: 'hidden' }} />
    </>
  );
};

export default memo(ExpandedOrgNode);
