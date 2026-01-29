import Link from 'next/link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';

/**
 * ConvertedFromLead Component
 *
 * Displays a notice when an opportunity was converted from a lead,
 * with a link back to the original lead detail page.
 *
 * @param {Object} props
 * @param {string} props.convertedFromLeadId - ID of the original lead
 * @param {string} [props.leadName] - Optional name of the lead for display
 */
const ConvertedFromLead = ({ convertedFromLeadId, leadName }) => {
  if (!convertedFromLeadId) {
    return null;
  }

  return (
    <Paper
      data-testid="converted-from-lead"
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        bgcolor: 'info.lighter',
        border: 1,
        borderColor: 'info.main',
      }}
      background={1}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <IconifyIcon
          icon="material-symbols:arrow-back"
          sx={{ fontSize: 24, color: 'info.main' }}
        />
        <Stack direction="column" spacing={0.5} sx={{ flexGrow: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'info.dark' }}>
            Converted from lead
          </Typography>
          <Link
            href={`/apps/crm/leads/${convertedFromLeadId}`}
            style={{ textDecoration: 'none' }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'info.main',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              View original lead{leadName ? `: ${leadName}` : ''}
            </Typography>
          </Link>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default ConvertedFromLead;
