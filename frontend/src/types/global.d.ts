interface Window {
    solana?: SolanaProvider;
}

interface SolanaProvider {
    isPhantom?: boolean;
    publicKey?: import('@solana/web3.js').PublicKey;
    connect: (opts?: any) => Promise<{ publicKey: import('@solana/web3.js').PublicKey }>;
    signMessage: (message: Uint8Array, display?: string) => Promise<{ signature: Uint8Array; publicKey: import('@solana/web3.js').PublicKey }>;
}
