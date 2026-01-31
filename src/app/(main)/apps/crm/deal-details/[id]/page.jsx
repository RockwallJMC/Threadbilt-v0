import DealDetails from 'components/sections/crm/deal-details';

const Page = async ({ params }) => {
  const { id: dealId } = await params;

  if (!dealId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Deal ID Required</h2>
        <p>Please provide a deal ID in the URL: /apps/crm/deal-details/[deal-id]</p>
      </div>
    );
  }

  return <DealDetails dealId={dealId} />;
};

export default Page;
