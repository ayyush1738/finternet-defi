import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';

export async function POST(req: NextRequest) {
  try {
    const { walletAddress } = await req.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const publicKey = new PublicKey(walletAddress);
    const lamports = await connection.getBalance(publicKey);
    const balance = lamports / 1e9;

    return NextResponse.json({ balance }, { status: 200 });
  } catch (err: any) {
    console.error('Balance fetch failed', err);
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
  }
}