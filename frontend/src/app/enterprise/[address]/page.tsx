import EnterprisePage from './Enterprise';

export default async function Page({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;

  return <EnterprisePage walletAddress={address} />;
}
