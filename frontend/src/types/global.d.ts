// types/global.d.ts

import type { PublicKey } from '@solana/web3.js';

export {};

declare global {
  interface Window {
    solana?: SolanaProvider;
  }

  interface SolanaProvider {
    isPhantom?: boolean;
    publicKey?: PublicKey;
    isConnected?: boolean;
    connect: (opts?: { onlyIfTrusted: boolean }) => Promise<{ publicKey: PublicKey }>;
    disconnect: () => Promise<void>;
    signMessage: (
      message: Uint8Array,
      display?: string
    ) => Promise<{ signature: Uint8Array; publicKey: PublicKey }>;
    signTransaction: (transaction: import('@solana/web3.js').Transaction) => Promise<import('@solana/web3.js').Transaction>;
    signAllTransactions?: (
      transactions: import('@solana/web3.js').Transaction[]
    ) => Promise<import('@solana/web3.js').Transaction[]>;
    on: (event: string, handler: (args: any) => void) => void;
    off: (event: string, handler: (args: any) => void) => void;
  }
}
