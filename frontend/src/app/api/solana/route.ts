import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';

// Cache to store recent balance results (1-minute TTL)
const balanceCache = new Map<string, { balance: number; timestamp: number }>();

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { walletAddress } = await req.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Validate wallet address format
    try {
      new PublicKey(walletAddress);
    } catch {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    // Check cache (1-minute TTL)
    const cacheKey = walletAddress;
    const cached = balanceCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 60000) {
      return NextResponse.json({ balance: cached.balance }, { status: 200 });
    }

    // Configure RPC endpoint (use environment variable or fallback to devnet)
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    // Fetch balance
    const publicKey = new PublicKey(walletAddress);
    const lamports = await connection.getBalance(publicKey);
    const balance = lamports / 1e9; // Convert lamports to SOL

    // Update cache
    balanceCache.set(cacheKey, { balance, timestamp: Date.now() });

    return NextResponse.json({ balance }, { status: 200 });
  } catch (err: any) {
    console.error('Balance fetch failed:', err.message);
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
  }
}