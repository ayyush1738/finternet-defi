'use client';

import { useEffect, useState } from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { SiSolana } from 'react-icons/si';
import { Connection, PublicKey, Transaction, Keypair } from '@solana/web3.js';
import { useRouter } from 'next/navigation';

export default function MintPdfNFT({ walletAddress }: { walletAddress: string }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [name, setName] = useState('');
  const [pubKey, setPubKey] = useState('');
  const [description, setDescription] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [mintingStep, setMintingStep] = useState('');
  const [isMinting, setIsMinting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    const org = localStorage.getItem('organizationName');
    if (!token) {
      alert('Unauthorized. Please login again.');
      router.push('/');
    }
    if (org) setOrganizationName(org);
  }, [router]);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (walletAddress) {
          const connection = new Connection(
            'https://devnet.helius-rpc.com/?api-key=be8f1e5b-a9a6-4cd5-9338-c563b3ac43dd', 
            'confirmed'
          );
          const publicKey = new PublicKey(walletAddress);
          const lamports = await connection.getBalance(publicKey);
          setBalance(lamports / 1e9);
        }
      } catch (err) {
        console.error('Balance fetch failed', err);
        setBalance(null);
      }
    };
    fetchBalance();
  }, [walletAddress]);

  const getColorFromWallet = (address: string) => {
    const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ['#F87171', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#F472B6'];
    return colors[hash % colors.length];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('File too large. Max 50MB allowed.');
        return;
      }
      setFileName(file.name);
    }
  };

  const handleMint = async () => {
    if (!fileName || !name || !price || !pubKey) {
      alert('Please fill all required fields');
      return;
    }

    setIsMinting(true);
    const mintKeypair = Keypair.generate();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const token = localStorage.getItem('jwt');
    const provider = (window as any).solana;

    try {
      if (!fileInput?.files?.[0]) throw new Error('No file selected');
      if (!provider || !provider.isPhantom) throw new Error('Phantom Wallet not found');

      // Step 1: Upload to backend
      setMintingStep('Uploading file...');
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
      formData.append('amount', price);
      formData.append('due_ts', Math.floor(Date.now() / 1000).toString());
      formData.append('creator', walletAddress);
      formData.append('mint', mintKeypair.publicKey.toString());
      formData.append('name', name);
      formData.append('organization', organizationName || '');
      formData.append('description', description);
      formData.append('customer_pubkey', pubKey);

      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/enterprise/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.message || 'Upload failed');
      }

      const { ipfs_cid, transaction_base64 } = await uploadRes.json();

      // Step 2: Sign with Phantom
      setMintingStep('Signing transaction...');
      await provider.connect();
      const connection = new Connection('https://devnet.helius-rpc.com/?api-key=be8f1e5b-a9a6-4cd5-9338-c563b3ac43dd', 'confirmed');
      const transaction = Transaction.from(Buffer.from(transaction_base64, 'base64'));

      transaction.partialSign(mintKeypair);
      const signedTx = await provider.signTransaction(transaction);

      // Step 3: Submit to Solana
      setMintingStep('Submitting to Solana...');
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txid, 'confirmed');

      // Step 4: Finalize backend
      setMintingStep('Finalizing NFT...');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/enterprise/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          cid: ipfs_cid,
          creator: walletAddress,
          tx_sig: txid,
          amount: price,
        }),
      });

      alert(`✅ NFT Minted!\nTxID: ${txid}`);
      window.open(`https://explorer.solana.com/tx/${txid}?cluster=devnet`, '_blank');
    } catch (err: any) {
      console.error('Minting error:', err);
      alert(`Minting failed: ${err.message}`);
    } finally {
      setIsMinting(false);
      setMintingStep('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center py-10 px-4">
      <div className="w-full px-4 pt-4 max-w-5xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div
              className="w-14 h-14 rounded-full shrink-0"
              style={{ backgroundColor: getColorFromWallet(walletAddress) }}
            ></div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-300 break-all md:break-words">{walletAddress}</span>
              <span className="text-sm text-gray-400">Wallet Owner</span>
            </div>
          </div>

          <div className="relative flex items-center justify-between w-full md:w-auto">
            <span className="text-sm text-gray-300 mr-4 md:mr-2">
              {balance !== null ? `${balance.toFixed(2)} SOL` : 'Fetching...'}
            </span>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-10 h-10 rounded-full shrink-0 cursor-pointer"
              style={{ backgroundColor: getColorFromWallet(walletAddress) }}
            />
            {isDropdownOpen && (
              <div className="absolute right-0 top-14 w-56 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50">
                <div className="px-4 py-3 text-sm font-medium border-b border-zinc-700 text-white">
                  {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                  <div className="text-xs text-gray-400">{balance !== null ? `${balance.toFixed(2)} SOL` : '$0.00'}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-zinc-700 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <h1 className="text-4xl font-bold mb-6">Mint PDF as NFT</h1>

      <div className="w-full max-w-xl bg-zinc-800 rounded-2xl p-6 shadow-lg space-y-6">
        <div className="border-2 border-dashed border-zinc-600 rounded-lg p-6 text-center">
          <AiOutlineCloudUpload className="text-6xl mx-auto mb-4 text-zinc-500" />
          <p className="text-sm">Upload your PDF file</p>
          <p className="text-xs text-zinc-400">Only PDF. Max 50MB</p>
          <label className="mt-4 inline-block bg-gradient-to-br from-purple-600 to-green-500 px-6 py-2 rounded-xl cursor-pointer hover:opacity-80">
            Choose File
            <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
          </label>
          {fileName && <p className="mt-2 text-green-400 text-sm">Selected: {fileName}</p>}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm">NFT Name</label>
            <input
              type="text"
              className="w-full bg-zinc-700 rounded-lg px-4 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Description (optional)</label>
            <textarea
              rows={3}
              className="w-full bg-zinc-700 rounded-lg px-4 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm">Price</label>
              <div className="flex items-center bg-zinc-700 rounded-lg px-4 py-2">
                <input
                  type="number"
                  placeholder="0.1"
                  className="flex-1 bg-transparent focus:outline-none"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <SiSolana className="ml-2 text-emerald-400" />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm">Customer Public Key</label>
              <input
                type="text"
                className="w-full bg-zinc-700 rounded-lg px-4 py-2"
                placeholder="Enter Public Key of Your Client"
                value={pubKey}
                onChange={(e) => setPubKey(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleMint}
          disabled={!fileName || !name || !price || isMinting}
          className="w-full bg-gradient-to-br from-purple-600 to-green-500 py-3 rounded-xl font-semibold text-lg hover:opacity-80 disabled:opacity-40"
        >
          {isMinting ? mintingStep || 'Minting...' : 'Mint'}
        </button>
      </div>
    </div>
  );
}
