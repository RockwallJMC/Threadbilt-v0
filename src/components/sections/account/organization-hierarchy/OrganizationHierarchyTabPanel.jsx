'use client';

import { useState, useCallback, useMemo } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import {
  Box,
  Stack,
  Typography,
  Avatar,
  Chip,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Button,
  Paper,
} from '@mui/material';
import {
  useOrganizationHierarchy,
  ROLE_STYLES,
} from 'services/swr/api-hooks/useOrganizationHierarchyApi';
import OrgChartFlow from './OrgChartFlow';

const ROLE_ORDER = ['owner', 'admin', 'manager', 'member'];

const pickParent = (candidates, fallback, index) => {
  if (candidates.length > 0) {
    return candidates[index % candidates.length];
  }
  return fallback;
};

const buildHierarchyTree = (members, orgName) => {
  if (!members || members.length === 0) {
    return null;
  }

  const root = {
    id: 'org-root',
    name: orgName || 'Organization',
    attributes: { kind: 'root' },
    children: [],
  };

  const byRole = ROLE_ORDER.reduce((acc, role) => {
    acc[role] = [];
    return acc;
  }, {});

  members.forEach((member) => {
    const role = ROLE_ORDER.includes(member.type) ? member.type : 'member';
    byRole[role].push({
      id: member.id,
      name: member.label || member.email || 'Unknown',
      attributes: {
        role,
        email: member.email,
        kind: 'member',
      },
      member,
      children: [],
    });
  });

  byRole.owner.forEach((owner) => {
    root.children.push(owner);
  });

  if (byRole.owner.length === 0) {
    root.children.push({
      id: 'unassigned-owner-group',
      name: 'Owners',
      attributes: { kind: 'role-group', role: 'owner' },
      children: [],
    });
  }

  byRole.admin.forEach((admin, index) => {
    const parent = pickParent(byRole.owner, root, index);
    parent.children.push(admin);
  });

  byRole.manager.forEach((manager, index) => {
    const parent = pickParent(byRole.admin, pickParent(byRole.owner, root, index), index);
    parent.children.push(manager);
  });

  byRole.member.forEach((member, index) => {
    const parent = pickParent(
      byRole.manager,
      pickParent(byRole.admin, pickParent(byRole.owner, root, index), index),
      index,
    );
    parent.children.push(member);
  });

  return root;
};

/**
 * Role badge with color styling
 */
const RoleBadge = ({ role }) => {
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

/**
 * Member details display component using Card pattern
 */
const MemberDetailsCard = ({ member }) => {
  if (!member) return null;

  const style = ROLE_STYLES[member.type] || ROLE_STYLES.member;

  return (
    <Card background={1} variant="outlined">
      <CardHeader
        avatar={
          <Avatar
            src={member.avatar}
            alt={member.label}
            sx={{
              width: 48,
              height: 48,
              border: `3px solid ${style.color}`,
            }}
          >
            {member.label?.charAt(0)?.toUpperCase()}
          </Avatar>
        }
        title={member.label}
        subheader={member.email}
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
        subheaderTypographyProps={{ variant: 'body2' }}
      />
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Role:
            </Typography>
            <RoleBadge role={member.type} />
          </Stack>
          {member.joinedAt && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Joined:
              </Typography>
              <Typography variant="body2">
                {new Date(member.joinedAt).toLocaleDateString()}
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
      <CardActions>
        <Button size="small">View Profile</Button>
        <Button size="small">Send Message</Button>
      </CardActions>
    </Card>
  );
};

/**
 * Role legend showing the hierarchy levels with color indicators
 */
const RoleLegend = () => {
  const roles = ['owner', 'admin', 'manager', 'member'];

  return (
    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
      {roles.map((role) => (
        <Stack key={role} direction="row" alignItems="center" spacing={0.75}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: ROLE_STYLES[role].color,
              flexShrink: 0,
            }}
          />
          <Typography variant="caption" sx={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
            {role}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
};

/**
 * Organization Hierarchy Tab Panel
 * Displays a React Flow tree visualization of organization members by role
 */
const OrganizationHierarchyTabPanel = () => {
  const [selectedMember, setSelectedMember] = useState(null);

  const { data: graphData, isLoading, error, mutate } = useOrganizationHierarchy();

  const orgName = graphData?.metadata?.organizationName || 'ACME Corporation';
  const treeData = useMemo(
    () => buildHierarchyTree(graphData?.nodes || [], orgName),
    [graphData?.nodes, orgName],
  );

  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleCloseDetails = useCallback(() => {
    setSelectedMember(null);
  }, []);

  const handleNodeClick = useCallback((member) => {
    setSelectedMember(member);
  }, []);

  // Empty state
  if (!isLoading && (!graphData?.nodes || graphData.nodes.length === 0)) {
    return (
      <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ minHeight: 300, py: 5 }}>
        <Typography color="text.secondary">No organization members found</Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={handleRefresh}
          startIcon={<RefreshRoundedIcon />}
        >
          Refresh
        </Button>
      </Stack>
    );
  }

  return (
    <Stack direction="column" spacing={3}>
      {/* Header/stats section */}
      <Paper background={1} sx={{ p: { xs: 3, md: 4 }, borderRadius: 6 }}>
        <Stack spacing={2}>
          {/* Header with title and refresh button */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6">{orgName} Hierarchy</Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={handleRefresh}
              disabled={isLoading}
              startIcon={<RefreshRoundedIcon />}
            >
              Refresh
            </Button>
          </Stack>

          {/* Subtitle */}
          <Typography variant="body2" color="text.secondary">
            Organization hierarchy showing members by role
          </Typography>

          {/* Member breakdown: count + role breakdown + legend */}
          {graphData?.metadata && (
            <Stack spacing={1}>
              <Typography variant="subtitle2" fontWeight={600}>
                {graphData.metadata.nodeCount}{' '}
                {graphData.metadata.nodeCount === 1 ? 'member' : 'members'}
              </Typography>
              {graphData.metadata.roleBreakdown && (
                <Typography variant="caption" color="text.secondary">
                  {graphData.metadata.roleBreakdown.owner}{' '}
                  {graphData.metadata.roleBreakdown.owner === 1 ? 'owner' : 'owners'},{' '}
                  {graphData.metadata.roleBreakdown.admin}{' '}
                  {graphData.metadata.roleBreakdown.admin === 1 ? 'admin' : 'admins'},{' '}
                  {graphData.metadata.roleBreakdown.manager}{' '}
                  {graphData.metadata.roleBreakdown.manager === 1 ? 'manager' : 'managers'},{' '}
                  {graphData.metadata.roleBreakdown.member}{' '}
                  {graphData.metadata.roleBreakdown.member === 1 ? 'member' : 'members'}
                </Typography>
              )}
              <RoleLegend />
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* Main content section - OrgChartFlow */}
      <Paper background={1} sx={{ borderRadius: 6, minHeight: 500, overflow: 'hidden' }}>
        <Box sx={{ height: 600, minHeight: 500 }}>
          <OrgChartFlow
            treeData={treeData}
            isLoading={isLoading}
            error={error}
            onNodeClick={handleNodeClick}
            onRefresh={handleRefresh}
          />
        </Box>
      </Paper>

      {/* Member details panel - replaces the Drawer */}
      {selectedMember && (
        <Paper background={1} sx={{ p: 3, borderRadius: 6 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Member Details
            </Typography>
            <IconButton size="small" onClick={handleCloseDetails} aria-label="Close member details">
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
          <MemberDetailsCard member={selectedMember} />
        </Paper>
      )}
    </Stack>
  );
};

export default OrganizationHierarchyTabPanel;
