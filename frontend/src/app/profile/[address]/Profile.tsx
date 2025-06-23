'use client';

import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { FaSearch, FaPlus } from 'react-icons/fa';
import PendingPayments from './PendingPayments';
import PurchaseHistory from './PurchaseHistory';
import { useRouter } from 'next/navigation';

export default function Profile({ walletAddress }: { walletAddress: string }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('Pending Payments');
  const [hydrated, setHydrated] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Pending Payments':
        return <div className="text-white">
          <PendingPayments />
        </div>;
      case 'Purchase History':
        return <div className="text-white">
          <PurchaseHistory />
        </div>;
      case 'Tokens':
        return <div className="text-white">
          Tokens Content
          <p className = "mt-42 ml-96 text-4xl">Coming Soon</p>
        </div>;
      case 'Listings':
        return <div className="text-white">Listings Content</div>;
      case 'Offers':
        return <div className="text-white">Offers Content</div>;
      case 'Activity':
        return <div className="text-white">Activity Content</div>;
      default:
        return <div className="text-white">Select a Tab</div>;
    }
  };


  useEffect(() => {
    // ✅ Ensure this runs only on client (hydration guard)
    if (typeof window !== 'undefined') {
      setHydrated(true);

      const storedBalance = localStorage.getItem('balance');
      const storedWallet = localStorage.getItem('walletAddress');

      // ✅ Load from localStorage if wallet matches
      if (storedWallet === walletAddress && storedBalance) {
        setBalance(parseFloat(storedBalance));
      }

      // ✅ Fetch fresh balance from chain
      const fetchBalance = async () => {
        const connection = new Connection("https://api.devnet.solana.com", "confirmed");
        const pubKey = new PublicKey(walletAddress);
        const lamports = await connection.getBalance(pubKey);
        const sol = lamports / 1e9;
        setBalance(sol);
        localStorage.setItem('balance', sol.toString());
      };

      fetchBalance();
    }
  }, [walletAddress]);

  const getColorFromWallet = (address: string) => {
    const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ['#F87171', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#F472B6'];
    return colors[hash % colors.length];
  };


  if (!hydrated) {
    return <div className="text-white p-10">Loading profile...</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    router.push('/');
  };

  return (
    <div className="bg-gradient-to-b from-violet-400 via-gray-900 to-black text-white h-screen overflow-hidden w-full">
      {/* Header */}

      <div className="px-10 pt-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full" style={{ backgroundColor: getColorFromWallet(walletAddress) }} />
          <div>
            <div className="text-sm text-gray-300">
              {walletAddress}
            </div>
            <div className="text-sm text-gray-400">Wallet Owner</div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-300">
            {balance !== null ? `${balance.toFixed(2)} SOL` : 'Fetching balance...'}
          </div>
          <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-10 h-10 rounded-full cursor-pointer" style={{ backgroundColor: getColorFromWallet(walletAddress) }} />
        </div>
      </div>

      {isDropdownOpen && (
            <div className="absolute right-0 w-56 bg-gray-900 text-white rounded-md shadow-lg z-50 mr-10">
              <div className="px-4 py-2 font-semibold border-b border-gray-700">
                {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                <div className="text-sm text-gray-400">
                  {balance !== null ? `$${balance.toFixed(2)}` : '$0.00'}
                </div>
              </div>
              <button onClick={handleLogout}  className="w-full text-left px-4 py-2 hover:bg-gray-800 text-sm text-red-500 cursor-pointer">
                Logout
              </button>
            </div>
          )}

      {/* Stats */}
      <div className="px-10 mt-4 flex justify-between text-gray-400 text-sm">
        <div className="space-x-2">
          <span className="bg-gray-800 px-2 py-1 rounded">0 XP</span>
          <span className="bg-gray-800 px-2 py-1 rounded">LOYALTY 100%</span>
        </div>
        <div className="flex space-x-6">
          <div>NET WORTH: <span className="text-white">{balance !== null ? balance.toFixed(2) : '0.00'} SOL</span></div>
          <div>USD VALUE: <span className="text-white">$0.00</span></div>
          <div>NFTs: <span className="text-white">0%</span></div>
          <div>TOKENS: <span className="text-white">0%</span></div>
          <FaPlus />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 px-10 flex space-x-6 border-b border-gray-700">
        {['Pending Payments', 'Purchase History', 'Tokens', 'Offers', 'Activity'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer pb-2 ${activeTab === tab ? 'border-b-2 border-white' : 'text-gray-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex px-10 mt-6">
        <div className="w-1/4">
          <h2 className="text-lg font-semibold mb-2">Category</h2>
          <div className="flex flex-wrap gap-2 text-sm text-black cursor-not-allowed">
            {['All', 'Layer 1', 'Layer 2', 'Stablecoins', 'Smart Contract Platform', 'DeFi', 'AI', 'Pump.fun', 'Dog Themed'].map(cat => (
              <span key={cat} className="bg-white px-2 py-1 rounded">{cat}</span>
            ))}
          </div>

          <h2 className="text-lg font-semibold my-4">Chains</h2>
          <div className="h-12 bg-gray-800 mb-4 rounded cursor-not-allowed" />

          <h2 className="text-lg font-semibold mb-2">Market Cap</h2>
          <div className="h-12 bg-gray-800 mb-4 rounded cursor-not-allowed" />
        </div>

        <div className="w-3/4 pl-10">
          <div className="bg-gray-800 h-10 rounded flex items-center px-4 text-gray-400">
            <FaSearch className="mr-2" />
            <input className="bg-transparent outline-none w-full" placeholder="Search" />
          </div>

          <div className="mt-10">
            {renderTabContent()}
          </div>

        </div>
      </div>
    </div>
  );
}
