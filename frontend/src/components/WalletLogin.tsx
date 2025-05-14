'use client';

import { useState, useEffect, useRef } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useRouter } from 'next/navigation';

type SignedMessage = {
  signature: Uint8Array;
  publicKey: PublicKey;
};

type NonceResponse = { nonce: string };
type LoginResponse = { token: string; message: string; role: string };

export default function WalletLogin() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter(); // ✅ Next Router

  const getProvider = (): any | null => {
    if (typeof window !== 'undefined' && 'solana' in window) {
      return (window as any).solana;
    }
    return null;
  };

  const checkPhantom = (): boolean => {
    const provider = getProvider();
    if (!provider || !provider.isPhantom) {
      alert('Please install Phantom Wallet');
      return false;
    }
    return true;
  };

  const connectWallet = async () => {
    const provider = getProvider();
    if (!provider) return;
    if (!checkPhantom()) return;

    try {
      const response = await provider.connect();
      const address = response.publicKey.toString();
      setWalletAddress(address);
      setStatus(`Wallet connected`);
      localStorage.removeItem('phantom-disconnected');

      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      const pubKey = new PublicKey(address);
      const lamports = await connection.getBalance(pubKey);
      const sol = lamports / 1e9;
      setBalance(sol);
    } catch (err) {
      console.error(err);
      setStatus('Wallet connection failed');
    }
  };

  const disconnectWallet = async () => {
    const provider = getProvider();
    if (provider && provider.isPhantom) {
      try {
        await provider.disconnect();
        setWalletAddress(null);
        setBalance(null);
        setToken(null);
        setStatus('Wallet disconnected');
        localStorage.removeItem('jwt');
        localStorage.setItem('phantom-disconnected', 'true');
      } catch (err) {
        console.error(err);
        setStatus('Wallet disconnect failed');
      }
    }
  };

  const login = async () => {
    if (!walletAddress) {
      setStatus('Connect wallet first');
      return;
    }

    try {
      const nonceRes = await fetch(`http://localhost:8000/api/v1/auth/nonce?wallet_address=${walletAddress}`);
      const nonceData: NonceResponse = await nonceRes.json();
      const { nonce } = nonceData;

      const provider = getProvider();
      if (!provider) return;

      const encodedMsg = new TextEncoder().encode(nonce);
      const signedMessage: SignedMessage = await provider.signMessage(encodedMsg, 'utf8');

      const loginRes = await fetch('http://localhost:8000/api/v1/auth/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          nonce: nonce,
          signature: Array.from(signedMessage.signature),
        }),
      });

      const data: LoginResponse = await loginRes.json();

      if (loginRes.ok) {
        if (data.role !== 'investor') {
          setStatus('Access denied: Only investors can login');
          return;
        }

        setStatus('Login successful');
        setToken(data.token);
        localStorage.setItem('jwt', data.token);

        router.push(`/profile/${walletAddress}`);
      } else {
        setStatus(`Login failed: ${data.message}`);
      }

    } catch (err: any) {
      console.error(err);
      setStatus(`Login error: ${err.message}`);
    }
  };

  useEffect(() => {
    const provider = getProvider();
    const manuallyDisconnected = localStorage.getItem('phantom-disconnected') === 'true';

    if (provider && provider.isPhantom && !manuallyDisconnected) {
      provider
        .connect({ onlyIfTrusted: true })
        .then(async (res: any) => {
          const address = res.publicKey.toString();
          setWalletAddress(address);
          setStatus(`Wallet Connected`);

          const connection = new Connection("https://api.devnet.solana.com", "confirmed");
          const pubKey = new PublicKey(address);
          const lamports = await connection.getBalance(pubKey);
          const sol = lamports / 1e9;
          setBalance(sol);
        })
        .catch(() => console.log('No trusted connection'));
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='w-full'>
      {!walletAddress ? (
        <div className="flex items-center gap-4">
          <div className="w-40 rounded-2xl bg-gradient-to-br from-purple-800 to-green-800 hover:cursor-pointer">
            <button
              onClick={connectWallet}
              type="button"
              className="w-full h-10 cursor-pointer text-white text-sm font-medium rounded-md flex items-center justify-center gap-2"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 relative" ref={dropdownRef}>
          <div className="flex items-center bg-gradient-to-br from-purple-600 to-green-400 rounded-2xl px-4 py-2">
            <svg
              className="w-4 h-4 text-white mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="m23.876 18.032-3.962 4.14a.92.92 0 0 1-.673.284H.46a.469.469 0 0 1-.252-.074.437.437 0 0 1-.084-.68l3.965-4.14a.92.92 0 0 1 .67-.284H23.54a.47.47 0 0 1 .252.073.438.438 0 0 1 .084.68Zm-3.962-8.336a.92.92 0 0 0-.673-.285H.46a.469.469 0 0 0-.252.074.438.438 0 0 0-.084.68l3.965 4.14a.92.92 0 0 0 .67.284H23.54a.453.453 0 0 0 .422-.27.438.438 0 0 0-.086-.483l-3.962-4.14ZM.46 6.723h18.781a.942.942 0 0 0 .673-.285l3.962-4.14a.444.444 0 0 0 .086-.484.453.453 0 0 0-.17-.196.469.469 0 0 0-.252-.073H4.76a.94.94 0 0 0-.671.285L.125 5.97a.444.444 0 0 0-.086.483.469.469 0 0 0 .421.27Z" />
            </svg>
            <span className="font-bold text-white text-sm">{balance?.toFixed(2)}</span>
            <span className="ml-2 text-white font-bold">SOL</span>
          </div>
          <div className="w-px h-10 bg-gray-400 mx-4"></div>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center cursor-pointer h-10 hover:bg-gray-800 rounded-md px-3 gap-2 min-w-[140px]"
          >
            <div className="w-6 h-6 rounded-full bg-orange-300 flex items-center justify-center overflow-hidden">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 10a4 4 0 100-8 4 4 0 000 8zM2 18a8 8 0 1116 0H2z" />
              </svg>
            </div>            <span className="text-sm font-medium text-white truncate max-w-[80px]">
              {walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : "Connect"}
            </span>

            <svg
              className={`w-4 h-4 text-white transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.353a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 w-56 bg-gray-900 text-white rounded-md shadow-lg z-50 mt-60">
              <div className="px-4 py-2 font-semibold border-b border-gray-700">
                {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                <div className="text-sm text-gray-400">
                  {balance !== null ? `$${balance.toFixed(2)}` : '$0.00'}
                </div>
              </div>
              <button onClick={connectWallet} className="w-full text-left px-4 py-2 hover:bg-gray-800 text-sm">
                Connect Wallet
              </button>
              <button onClick={login} className="w-full text-left px-4 py-2 hover:bg-gray-800 text-sm">
                Profile
              </button>
              <button onClick={disconnectWallet} className="w-full text-left px-4 py-2 hover:bg-gray-800 text-sm text-red-500">
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
