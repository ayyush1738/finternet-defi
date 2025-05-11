'use client';

import { useState } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';


export default function Profile() {
  const [activeTab, setActiveTab] = useState('Tokens');

  return (
    <div className="bg-gradient-to-b from-amber-900 via-gray-900 to-black text-white  h-screen overflow-hidden w-full">
      {/* Header */}
      <div className="px-10 pt-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-orange-400" />
          <div>
            <h1 className="text-xl font-semibold">3RJHbR...4TDH</h1>
            <div className="text-sm text-gray-400">JOINED MAY 2025</div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-300">0.00 SOL</div>
          <div className="w-10 h-10 rounded-full bg-orange-400" />
        </div>
      </div>

      {/* Stats */}
      <div className="px-10 mt-4 flex justify-between text-gray-400 text-sm">
        <div className="space-x-2">
          <span className="bg-gray-800 px-2 py-1 rounded">0 XP</span>
          <span className="bg-gray-800 px-2 py-1 rounded">LOYALTY 100%</span>
        </div>
        <div className="flex space-x-6">
          <div>NET WORTH: <span className="text-white">0.00 SOL</span></div>
          <div>USD VALUE: <span className="text-white">$0.00</span></div>
          <div>NFTs: <span className="text-white">0%</span></div>
          <div>TOKENS: <span className="text-white">0%</span></div>
          <FaPlus />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 px-10 flex space-x-6 border-b border-gray-700">
        {['Galleries', 'NFTs', 'Tokens', 'Listings', 'Offers', 'Portfolio', 'Created', 'Watchlist', 'Favorites', 'Activity'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 ${activeTab === tab ? 'border-b-2 border-white' : 'text-gray-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex px-10 mt-6">
        {/* Left Sidebar */}
        <div className="w-1/4">
          <h2 className="text-lg font-semibold mb-2">Category</h2>
          <div className="flex flex-wrap gap-2 text-sm text-black">
            {['All', 'Layer 1', 'Layer 2', 'Stablecoins', 'Smart Contract Platform', 'DeFi', 'AI', 'Pump.fun', 'Dog Themed'].map(cat => (
              <span key={cat} className="bg-white px-2 py-1 rounded">{cat}</span>
            ))}
          </div>

          <h2 className="text-lg font-semibold my-4">Chains</h2>
          <div className="h-12 bg-gray-800 mb-4 rounded" />

          <h2 className="text-lg font-semibold mb-2">Market Cap</h2>
          <div className="h-12 bg-gray-800 mb-4 rounded" />
        </div>

        {/* Right Content */}
        <div className="w-3/4 pl-10">
          <div className="bg-gray-800 h-10 rounded flex items-center px-4 text-gray-400">
            <FaSearch className="mr-2" />
            <input className="bg-transparent outline-none w-full" placeholder="Search" />
          </div>

          <div className="mt-20 flex justify-center items-center">
            <div className="bg-gray-900 p-6 rounded-full">
              🔍
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
