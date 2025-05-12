import Profile from './Profile';

export default async function Page({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;

  return (
    <div>
      <Profile walletAddress={address} />
    </div>
  );
}
