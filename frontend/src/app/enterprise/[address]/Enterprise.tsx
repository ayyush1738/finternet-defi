'use client';

import { useEffect, useState } from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { FaEthereum } from 'react-icons/fa';
import { Connection, PublicKey } from '@solana/web3.js';
import { useRouter } from 'next/navigation';

export default function MintPdfNFT({ walletAddress }: { walletAddress: string }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [royalties, setRoyalties] = useState('10');
  const [balance, setBalance] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      alert('Unauthorized. Please login again.');
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (walletAddress) {
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        const publicKey = new PublicKey(walletAddress);
        const lamports = await connection.getBalance(publicKey);
        setBalance(lamports / 1e9);
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
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleMint = () => {
    alert(`Minting NFT for ${fileName}`);
    // TODO: Call minting logic
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center py-10 px-4">
      <div className="px-10 pt-6 flex justify-between items-center w-full max-w-5xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full" style={{ backgroundColor: getColorFromWallet(walletAddress) }} />
          <div>
            <div className="text-sm text-gray-300">
              {walletAddress}
            </div>
            <div className="text-sm text-gray-400">Wallet Owner</div>
          </div>
        </div>
        <div className="flex items-center space-x-4 relative">
          <div className="text-sm text-gray-300">
            {balance !== null ? `${balance.toFixed(2)} SOL` : 'Fetching balance...'}
          </div>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-10 h-10 rounded-full cursor-pointer"
            style={{ backgroundColor: getColorFromWallet(walletAddress) }}
          />
          {isDropdownOpen && (
            <div className="absolute right-0 w-56 bg-gray-900 text-white rounded-md shadow-lg z-50 top-12">
              <div className="px-4 py-2 font-semibold border-b border-gray-700">
                {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                <div className="text-sm text-gray-400">
                  {balance !== null ? `${balance.toFixed(2)} SOL` : '$0.00'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-800 text-sm text-red-500"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <h1 className="text-4xl font-bold mb-6">Mint PDF as NFT</h1>

      <div className="w-full max-w-xl bg-zinc-800 rounded-2xl p-6 shadow-lg space-y-6">
        {/* Upload Section */}
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

        {/* NFT Details */}
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm">NFT Name</label>
            <input
              type="text"
              className="w-full bg-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-purple-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Description (optional)</label>
            <textarea
              rows={3}
              className="w-full bg-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-purple-500"
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
                <FaEthereum className="ml-2 text-emerald-400" />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm">Royalties (%)</label>
              <input
                type="number"
                className="w-full bg-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-purple-500"
                value={royalties}
                onChange={(e) => setRoyalties(e.target.value)}
                min="0"
                max="50"
              />
            </div>
          </div>
        </div>

        {/* Mint Button */}
        <button
          onClick={handleMint}
          disabled={!fileName || !name || !price}
          className="w-full bg-gradient-to-br from-purple-600 to-green-500 py-3 rounded-xl font-semibold text-lg hover:opacity-80 disabled:opacity-40"
        >
          Mint NFT
        </button>
      </div>
    </div>
  );
}
