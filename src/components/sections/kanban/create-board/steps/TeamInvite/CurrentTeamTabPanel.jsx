'use client';

import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { TabPanel } from '@mui/lab';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

// Map org roles to project roles
const ORG_TO_PROJECT_ROLE_MAP = {
  owner: 'Admin',
  admin: 'Admin',
  manager: 'Admin',
  member: 'Member',
};

const CurrentTeamTabPanel = ({ value, orgMembers = [] }) => {
  const { control } = useFormContext();
  const { fields, append } = useFieldArray({
    control,
    name: 'team',
  });

  const [selectedMembers, setSelectedMembers] = useState([]);

  const handleToggleMember = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    const availableMembers = orgMembers.filter(
      (m) => !fields.some((f) => f.id === m.id)
    );
    if (selectedMembers.length === availableMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(availableMembers.map((m) => m.id));
    }
  };

  const handleImportSelected = () => {
    const existingIds = fields.map((f) => f.id);
    const membersToAdd = orgMembers
      .filter((m) => selectedMembers.includes(m.id) && !existingIds.includes(m.id))
      .map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        avatar: m.avatar,
        role: ORG_TO_PROJECT_ROLE_MAP[m.orgRole] || 'Guest',
      }));

    membersToAdd.forEach((member) => append(member));
    setSelectedMembers([]);
  };

  if (!orgMembers || orgMembers.length === 0) {
    return (
      <TabPanel value={value} sx={{ px: 0 }}>
        <Typography variant="h5" color="text.disabled" fontWeight={400}>
          No organization members found.
        </Typography>
      </TabPanel>
    );
  }

  const availableMembers = orgMembers.filter(
    (m) => !fields.some((f) => f.id === m.id)
  );

  return (
    <TabPanel value={value} sx={{ px: 0 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2">
            Select members from your organization to add to this project
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={handleImportSelected}
            disabled={selectedMembers.length === 0}
          >
            Import Selected ({selectedMembers.length})
          </Button>
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={availableMembers.length > 0 && selectedMembers.length === availableMembers.length}
                  indeterminate={selectedMembers.length > 0 && selectedMembers.length < availableMembers.length}
                  onChange={handleSelectAll}
                  disabled={availableMembers.length === 0}
                />
              </TableCell>
              <TableCell>Member</TableCell>
              <TableCell>Org Role</TableCell>
              <TableCell>Project Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orgMembers.map((member) => {
              const isAlreadyAdded = fields.some((f) => f.id === member.id);
              return (
                <TableRow
                  key={member.id}
                  sx={{ opacity: isAlreadyAdded ? 0.5 : 1 }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedMembers.includes(member.id)}
                      onChange={() => handleToggleMember(member.id)}
                      disabled={isAlreadyAdded}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar src={member.avatar} sx={{ width: 32, height: 32 }}>
                        {member.name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{member.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={member.orgRole}
                      size="small"
                      color={member.orgRole === 'owner' || member.orgRole === 'admin' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {isAlreadyAdded ? (
                      <Chip label="Already added" size="small" color="success" />
                    ) : (
                      <Typography variant="body2">
                        {ORG_TO_PROJECT_ROLE_MAP[member.orgRole] || 'Guest'}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Stack>
    </TabPanel>
  );
};

export default CurrentTeamTabPanel;
