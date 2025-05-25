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
  const router = useRouter();

  const getProvider = (): any | null => {
    if (typeof window !== 'undefined' && 'solana' in window) {
      return (window as any).solana;
    }
    return null;
  };

  const connectWallet = async () => {
    const provider = getProvider();
    if (!provider || !provider.isPhantom) {
      alert('Please install Phantom Wallet');
      return;
    }

    try {
      const response = await provider.connect();
      const address = response.publicKey.toString();
      setWalletAddress(address);

      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      const pubKey = new PublicKey(address);
      const lamports = await connection.getBalance(pubKey);
      const sol = lamports / 1e9;
      console.log(`Balance: ${sol} SOL`);
    } catch (err) {
      console.error('Wallet connection failed', err);
    }
  };

  const handleEnterpriseLogin = async () => {
    if (!organizationName) {
      setStatus('Please enter organization name');
      return;
    }

    if (!walletAddress) {
      await connectWallet();
      if (!walletAddress) {
        setStatus('Connect wallet first');
        return;
      }
    }

    try {
      const nonceRes = await fetch(`http://localhost:8000/api/v1/auth/nonce?wallet_address=${walletAddress}`);
      const nonceData: NonceResponse = await nonceRes.json();
      const { nonce } = nonceData;

      const provider = getProvider();
      if (!provider) return;

      const encodedMsg = new TextEncoder().encode(nonce);
      const signedMessage: SignedMessage = await provider.signMessage(encodedMsg, 'utf8');

      const loginRes = await fetch('http://localhost:8000/api/v1/auth/enterprise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          nonce: nonce,
          signature: Array.from(signedMessage.signature),
          username: organizationName,  
        }),
      });

      const data: LoginResponse = await loginRes.json();

      if (loginRes.ok) {
        if (data.role !== 'enterprise') {
          setStatus('Access denied: Only enterprises can login here');
          return;
        }

        setStatus('Login successful');
        localStorage.setItem('jwt', data.token);
        localStorage.setItem('organizationName', organizationName);
        setShowModal(false);

        router.push(`/enterprise/${walletAddress}`);
      } else {
        setStatus(`Login failed: ${data.message}`);
      }
    } catch (err: any) {
      console.error(err);
      setStatus(`Login error: ${err.message}`);
    }
  };

  const openModal = async () => {
    await connectWallet();
    setShowModal(true);
  };

  return (
    <div className="relative h-screen overflow-hidden w-full">
      <div className='z-10 absolute inset-0'>
        <WavyBackground backgroundFill="#020009" />
      </div>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-10" />

      <div className="relative z-20 flex flex-col items-center justify-center h-full w-full text-center px-4">
        <div className='flex'>
          <h1 className="text-white text-5xl font-bold mb-4">Cha</h1>
          <h1 className="text-fuchsia-600 text-5xl font-bold mb-4">inVoice</h1>
        </div>
        <div className='w-1/2'>
          <TextGenerateEffect
            className="text-white text-[10px] md:text-xl lg:text-2xl"
            words="A decentralized marketplace for tokenized invoices, enabling instant liquidity for SMEs and returns for investors"
          />

          <div onClick={openModal} className="w-56 mx-auto mt-6">
            <MagicButton
              title="For Enterprises"
              icon={<FaLocationArrow />}
              position="right"
            />
          </div>
          {status && <p className="mt-4 text-sm text-red-400">{status}</p>}
        </div>
      </div>

      {/* Modal */}
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
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Wallet Address</label>
              <input
                type="text"
                value={walletAddress || ''}
                readOnly
                className="w-full bg-zinc-700 rounded-lg px-4 py-2 text-zinc-400"
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleEnterpriseLogin}
                className="bg-gradient-to-br from-purple-600 to-green-500 px-6 py-2 rounded-lg font-semibold hover:opacity-80"
              >
                Proceed
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 rounded-lg border border-zinc-600 hover:bg-zinc-700"
              >
                Cancel
              </button>
            </div>
            {status && <p className="text-center text-sm text-green-400">{status}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
