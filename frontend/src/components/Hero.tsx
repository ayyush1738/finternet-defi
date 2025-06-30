'use client';

import { useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { TextGenerateEffect } from './ui/TextGenerateEffect';
import MagicButton from './MagicButton';
import { FaLocationArrow } from 'react-icons/fa6';
import { WavyBackground } from './ui/wavy-background';
import { useRouter } from 'next/navigation';

type SignedMessage = {
  signature: Uint8Array;
  publicKey: PublicKey;
};

type NonceResponse = { nonce: string };
type LoginResponse = { token: string; message: string; role: string };

export default function Hero() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [loadingNextPage, setLoadingNextPage] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const router = useRouter();

  const getProvider = (): any | null => {
    if (typeof window !== 'undefined' && 'solana' in window) {
      return (window as any).solana;
    }
    return null;
  };

  const connectWallet = async (): Promise<string | null> => {
    const provider = getProvider();
    if (!provider || !provider.isPhantom) {
      setStatus('Please install Phantom Wallet');
      return null;
    }

    setIsConnecting(true);
    try {
      const response = await provider.connect();
      const address = response.publicKey.toString();
      setWalletAddress(address);

      const connection = new Connection('https://api.devnet.solana.com', "confirmed");
      const pubKey = new PublicKey(address);
      const lamports = await connection.getBalance(pubKey);
      const sol = lamports / 1e9;
      console.log(`Balance: ${sol} SOL`);
      
      setStatus('Wallet connected successfully');
      return address; // ✅ Return the address for immediate use
    } catch (err) {
      console.error('Wallet connection failed', err);
      setStatus('Wallet connection failed');
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEnterpriseLogin = async () => {
    if (!organizationName.trim()) {
      setStatus('Please enter organization name');
      return;
    }

    setStatus(''); // Clear previous status
    
    // ✅ Get current wallet address or connect
    let currentWalletAddress = walletAddress;
    if (!currentWalletAddress) {
      setStatus('Connecting wallet...');
      currentWalletAddress = await connectWallet();
      if (!currentWalletAddress) {
        setStatus('Please connect your wallet first');
        return;
      }
    }

    setStatus('Authenticating...');

    try {
      // Fetch nonce
      const nonceRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/nonce?wallet_address=${currentWalletAddress}`
      );
      
      if (!nonceRes.ok) {
        throw new Error(`Failed to get nonce: ${nonceRes.status}`);
      }
      
      const nonceData: NonceResponse = await nonceRes.json();
      const { nonce } = nonceData;

      // Sign message
      const provider = getProvider();
      if (!provider) {
        throw new Error('Wallet provider not found');
      }

      setStatus('Please sign the message in your wallet...');
      const encodedMsg = new TextEncoder().encode(nonce);
      const signedMessage: SignedMessage = await provider.signMessage(encodedMsg, 'utf8');

      // Submit login
      setStatus('Verifying credentials...');
      const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/enterprise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: currentWalletAddress,
          nonce: nonce,
          signature: Array.from(signedMessage.signature),
          username: organizationName.trim(),
        }),
      });

      const data: LoginResponse = await loginRes.json();

      if (loginRes.ok) {
        if (data.role !== 'enterprise') {
          setStatus('Access denied: Only enterprises can login here');
          return;
        }

        setStatus('Login successful! Redirecting...');
        localStorage.setItem('jwt', data.token);
        localStorage.setItem('organizationName', organizationName.trim());

        setLoadingNextPage(true);
        
        // ✅ Remove setTimeout - redirect immediately
        setShowModal(false);
        router.push(`/enterprise/${currentWalletAddress}`);
      } else {
        setStatus(data.message || 'Login failed');
      }

    } catch (err: any) {
      console.error('Login error:', err);
      setStatus(`Login error: ${err.message || 'Unknown error occurred'}`);
    }
  };

  const openModal = async () => {
    setStatus('');
    if (!walletAddress) {
      const address = await connectWallet();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setStatus('');
    setLoadingNextPage(false);
  };

  return (
    <div className="relative h-screen overflow-hidden w-full">
      <div className="z-10 absolute inset-0">
        <WavyBackground backgroundFill="#020009" />
      </div>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-10" />

      <div className="relative z-20 flex flex-col items-center justify-center h-full w-full text-center px-4">
        <div className="flex">
          <h1 className="text-white text-5xl font-bold mb-4">Cha</h1>
          <h1 className="text-fuchsia-600 text-5xl font-bold mb-4">inVoice</h1>
        </div>

        <div className="w-full sm:w-4/5 md:w-3/4 lg:w-1/2 mx-auto">
          <TextGenerateEffect
            className="text-white text-[10px] md:text-xl lg:text-2xl"
            words="A decentralized marketplace for tokenized invoices, enabling instant liquidity for SMEs and returns for investors"
          />

          {loadingNextPage && (
            <div className="mb-4">
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-white text-sm mt-2">Redirecting...</p>
            </div>
          )}

          <div onClick={openModal} className="w-56 mx-auto mt-6">
            <MagicButton
              title="For Enterprises"
              icon={<FaLocationArrow />}
              position="right"
            />
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 text-white rounded-xl p-8 w-full max-w-md shadow-lg space-y-6">
            <h2 className="text-2xl font-bold text-center">Enterprise Login</h2>

            <div>
              <label className="block mb-1 text-sm">Organization Name</label>
              <input
                type="text"
                className="w-full bg-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-purple-500"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Enter your organization name"
                disabled={loadingNextPage || isConnecting}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Wallet Address</label>
              <input
                type="text"
                value={walletAddress || ''}
                readOnly
                className="w-full bg-zinc-700 rounded-lg px-4 py-2 text-zinc-400"
                placeholder={isConnecting ? "Connecting..." : "Wallet will appear here"}
              />
            </div>

            {/* ✅ Display status messages to user */}
            {status && (
              <div className={`text-sm p-2 rounded ${
                status.includes('error') || status.includes('failed') || status.includes('denied')
                  ? 'bg-red-500/20 text-red-300'
                  : status.includes('successful')
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-blue-500/20 text-blue-300'
              }`}>
                {status}
              </div>
            )}

            <div className="flex justify-between gap-4">
              <button
                onClick={handleEnterpriseLogin}
                disabled={loadingNextPage || isConnecting || !organizationName.trim()}
                className="flex-1 bg-gradient-to-br from-purple-600 to-green-500 px-6 py-2 rounded-lg font-semibold hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {loadingNextPage ? 'Redirecting...' : isConnecting ? 'Connecting...' : 'Proceed'}
              </button>
              <button
                onClick={closeModal}
                disabled={loadingNextPage}
                className="px-6 py-2 rounded-lg border border-zinc-600 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {(loadingNextPage || isConnecting) && (
              <div className="flex justify-center">
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}