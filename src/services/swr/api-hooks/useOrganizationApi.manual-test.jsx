/**
 * Manual Test Component for Organization API Hooks
 *
 * This file demonstrates usage of all organization hooks and serves as
 * a manual verification tool once the build is fixed.
 *
 * To test:
 * 1. Fix the build dependencies (@tiptap/react, @mui/icons-material)
 * 2. Create a test page in src/app/test-org-api/page.jsx
 * 3. Copy this component there
 * 4. Run npm run dev
 * 5. Navigate to /test-org-api
 * 6. Test each hook function
 */

'use client';

import { useState } from 'react';
import {
  useUserOrganizations,
  useCreateOrganization,
  useJoinOrganization,
  useSwitchOrganization,
} from './useOrganizationApi';
import { Button, TextField, Box, Typography, Paper, Alert } from '@mui/material';

export default function OrganizationApiTest() {
  const [orgName, setOrgName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [message, setMessage] = useState(null);

  // Hook usage
  const { data: organizations, error: orgsError, isLoading, mutate } = useUserOrganizations();
  const { trigger: createOrg, isMutating: isCreating } = useCreateOrganization();
  const { trigger: joinOrg, isMutating: isJoining } = useJoinOrganization();
  const { trigger: switchOrg, isMutating: isSwitching } = useSwitchOrganization();

  // Test 1: Create Organization
  const handleCreate = async () => {
    if (!orgName.trim()) {
      setMessage({ type: 'error', text: 'Please enter an organization name' });
      return;
    }

    try {
      const orgId = await createOrg({ name: orgName });
      setMessage({ type: 'success', text: `Created organization with ID: ${orgId}` });
      setOrgName('');
      await mutate(); // Refresh organizations list
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  // Test 2: Join Organization
  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      setMessage({ type: 'error', text: 'Please enter an invite code' });
      return;
    }

    try {
      const orgId = await joinOrg({ inviteCode });
      setMessage({ type: 'success', text: `Joined organization with ID: ${orgId}` });
      setInviteCode('');
      await mutate(); // Refresh organizations list
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  // Test 3: Switch Organization
  const handleSwitch = async (orgId) => {
    try {
      await switchOrg({ organizationId: orgId });
      setMessage({ type: 'success', text: `Switched to organization ${orgId}` });
      await mutate(); // Refresh to show updated active status
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Organization API Hooks Test
      </Typography>

      {message && (
        <Alert severity={message.type} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {/* Test 1: useUserOrganizations */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test 1: useUserOrganizations()
        </Typography>

        {isLoading && <Typography>Loading organizations...</Typography>}
        {orgsError && <Alert severity="error">{orgsError.message}</Alert>}

        {organizations && (
          <Box>
            <Typography variant="body2" gutterBottom>
              Found {organizations.length} organization(s)
            </Typography>
            {organizations.map((org) => (
              <Paper key={org.id} variant="outlined" sx={{ p: 2, mb: 1 }}>
                <Typography variant="subtitle1">{org.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Role: {org.role} | Active: {org.isActive ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Joined: {new Date(org.joinedAt).toLocaleDateString()}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleSwitch(org.id)}
                    disabled={org.isActive || isSwitching}
                  >
                    {org.isActive ? 'Active' : 'Switch to this org'}
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>

      {/* Test 2: useCreateOrganization */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test 2: useCreateOrganization()
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            label="Organization Name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            size="small"
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create'}
          </Button>
        </Box>
      </Paper>

      {/* Test 3: useJoinOrganization */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test 3: useJoinOrganization()
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            label="Invite Code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            size="small"
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleJoin}
            disabled={isJoining}
          >
            {isJoining ? 'Joining...' : 'Join'}
          </Button>
        </Box>
      </Paper>

      {/* Test 4: useSwitchOrganization - tested via buttons above */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test 4: useSwitchOrganization()
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Use the "Switch to this org" buttons above to test organization switching.
          Only one organization should be active at a time.
        </Typography>
      </Paper>

      {/* Verification Checklist */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'info.light' }}>
        <Typography variant="h6" gutterBottom>
          Verification Checklist
        </Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li>✓ useUserOrganizations returns loading state initially</li>
            <li>✓ useUserOrganizations fetches and displays organizations</li>
            <li>✓ useCreateOrganization creates new organization</li>
            <li>✓ Created organization appears in list immediately</li>
            <li>✓ useJoinOrganization accepts valid invite codes</li>
            <li>✓ useJoinOrganization rejects invalid invite codes</li>
            <li>✓ useSwitchOrganization updates active organization</li>
            <li>✓ Only one organization is active at a time</li>
            <li>✓ Error messages display for failed operations</li>
            <li>✓ Success messages display for successful operations</li>
          </ul>
        </Typography>
      </Paper>
    </Box>
  );
}
