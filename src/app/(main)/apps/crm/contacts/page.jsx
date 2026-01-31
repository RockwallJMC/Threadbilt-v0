import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import paths from '@/routes/paths';
import ContactsDataGrid from '@/components/sections/crm/contacts-list/ContactsDataGrid';

export const metadata = {
  title: 'Contacts | CRM',
};

export default function ContactsListPage() {
  return (
    <Container maxWidth="xl">
      <Stack spacing={3} sx={{ py: 3 }}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h4">Contacts</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            href={paths.addContact}
          >
            Add Contact
          </Button>
        </Stack>

        {/* Data Grid */}
        <ContactsDataGrid />
      </Stack>
    </Container>
  );
}
