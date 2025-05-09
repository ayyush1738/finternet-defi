'use client';

import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';

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

  // ✅ ✅ Helper → safely access window.solana
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
      setStatus(`Wallet connected: ${address}`);
    } catch (err) {
      console.error(err);
      setStatus('Wallet connection failed');
    }
  };

  const login = async () => {
    if (!walletAddress) {
      setStatus('Connect wallet first');
      return;
    }

    try {
      // ✅ Fetch nonce
      const nonceRes = await fetch(`http://localhost:8000/api/v1/auth/nonce?wallet_address=${walletAddress}`);
      const nonceData: NonceResponse = await nonceRes.json();
      const { nonce } = nonceData;

      // ✅ Sign nonce
      const provider = getProvider();
      if (!provider) {
        setStatus('Phantom wallet not available');
        return;
      }

      const encodedMsg = new TextEncoder().encode(nonce);
      const signedMessage: SignedMessage = await provider.signMessage(encodedMsg, 'utf8');

      console.log('Signed message:', signedMessage);

      // ✅ Send login request
      const loginRes = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          nonce: nonce,
          signature: Array.from(signedMessage.signature), // send as array
        }),
      });

      const data: LoginResponse = await loginRes.json();

      if (loginRes.ok) {
        setStatus('Login successful');
        setToken(data.token);
        localStorage.setItem('jwt', data.token);
        console.log('JWT saved:', data.token);
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
    if (provider && provider.isPhantom) {
      provider
        .connect({ onlyIfTrusted: true })
        .then((res: any) => {
          setWalletAddress(res.publicKey.toString());
          setStatus(`Wallet auto-connected: ${res.publicKey.toString()}`);
        })
        .catch(() => console.log('No trusted connection'));
    }
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Phantom Wallet Login (TS)</h2>

      {!walletAddress ? (
        <div className='bg-green-400'>
            <button onClick={connectWallet}>Connect Phantom </button>
        </div>
      ) : (
        <div className='bg-green-400'>
          <p>Connected wallet: {walletAddress}</p>
          <button onClick={login}>Login with Wallet</button>
        </div>
      )}

      {status && <p>{status}</p>}
    </div>
  );
}
