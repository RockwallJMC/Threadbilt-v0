import LeadDetails from 'components/sections/crm/lead-details';

const Page = async ({ searchParams }) => {
  const params = await searchParams;
  const contactId = params.id;

  if (!contactId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Contact ID required. Please provide ?id=[uuid] in URL.</p>
      </div>
    );
  }

  return <LeadDetails contactId={contactId} />;
};

export default Page;
