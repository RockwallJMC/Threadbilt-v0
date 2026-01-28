'use client';

import { useState } from 'react';
import { Button, Chip, Paper, Stack, Typography, Link as MuiLink } from '@mui/material';
import { useRouter } from 'next/navigation';
import accounts from 'data/crm/accounts';
import LinkAccountModal from '../contacts/LinkAccountModal';
import UnlinkAccountDialog from '../contacts/UnlinkAccountDialog';

const ContactSidebar = ({ contact }) => {
  const router = useRouter();
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);

  // Find linked account if exists
  const linkedAccount = contact.account_id
    ? accounts.find((acc) => acc.id === contact.account_id)
    : null;

  const handleUnlink = () => {
    setUnlinkDialogOpen(true);
  };

  const handleLink = () => {
    setLinkModalOpen(true);
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    alert('Edit functionality coming soon');
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    alert('Delete functionality coming soon');
  };

  const handleAccountClick = () => {
    if (linkedAccount) {
      router.push(`/apps/crm/accounts/${linkedAccount.id}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Paper background={1} sx={{ p: { xs: 3, md: 5 } }}>
        <Stack spacing={3}>
        {/* Full Name */}
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            Full Name
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {contact.first_name} {contact.last_name}
          </Typography>
        </Stack>

        {/* Title/Job Role */}
        {contact.title && (
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Title
            </Typography>
            <Typography variant="body2">{contact.title}</Typography>
          </Stack>
        )}

        {/* Email */}
        {contact.email && (
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Email
            </Typography>
            <MuiLink href={`mailto:${contact.email}`} variant="body2">
              {contact.email}
            </MuiLink>
          </Stack>
        )}

        {/* Phone */}
        {contact.phone && (
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Phone
            </Typography>
            <Typography variant="body2">{contact.phone}</Typography>
          </Stack>
        )}

        {/* LinkedIn URL */}
        {contact.linkedin_url && (
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              LinkedIn
            </Typography>
            <MuiLink
              href={contact.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
            >
              View Profile
            </MuiLink>
          </Stack>
        )}

        {/* Account Association Section */}
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            Account Association
          </Typography>
          {linkedAccount ? (
            <Stack spacing={1}>
              <Chip
                label={linkedAccount.name}
                size="small"
                onClick={handleAccountClick}
                sx={{ cursor: 'pointer', alignSelf: 'flex-start' }}
              />
              {contact.role && (
                <Chip
                  label={contact.role}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ alignSelf: 'flex-start' }}
                />
              )}
              <Button
                variant="outlined"
                size="small"
                onClick={handleUnlink}
                sx={{ alignSelf: 'flex-start' }}
              >
                Unlink
              </Button>
            </Stack>
          ) : (
            <Button
              variant="outlined"
              size="small"
              onClick={handleLink}
              sx={{ alignSelf: 'flex-start' }}
            >
              Link to Account
            </Button>
          )}
        </Stack>

        {/* Notes */}
        {contact.notes && (
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Notes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {contact.notes}
            </Typography>
          </Stack>
        )}

        {/* Created Date */}
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            Created
          </Typography>
          <Typography variant="body2">{formatDate(contact.created_at)}</Typography>
        </Stack>

        {/* Updated Date */}
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            Updated
          </Typography>
          <Typography variant="body2">{formatDate(contact.updated_at)}</Typography>
        </Stack>

        {/* Action Buttons */}
        <Stack spacing={2}>
          <Button variant="contained" onClick={handleEdit} fullWidth>
            Edit
          </Button>
          <Button variant="outlined" color="error" onClick={handleDelete} fullWidth>
            Delete
          </Button>
        </Stack>
      </Stack>
    </Paper>

    {/* Link Account Modal */}
    <LinkAccountModal
      open={linkModalOpen}
      onClose={() => setLinkModalOpen(false)}
      contactId={contact.id}
      contactName={`${contact.first_name} ${contact.last_name}`}
    />

    {/* Unlink Account Dialog */}
    <UnlinkAccountDialog
      open={unlinkDialogOpen}
      onClose={() => setUnlinkDialogOpen(false)}
      contactId={contact.id}
      contactName={`${contact.first_name} ${contact.last_name}`}
      accountName={linkedAccount?.name || ''}
    />
    </>
  );
};

export default ContactSidebar;
