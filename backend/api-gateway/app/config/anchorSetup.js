import fs from 'fs';
import path from 'path';
import { AnchorProvider, Program } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';

const __dirname = path.resolve();
const idlPath = path.resolve(__dirname, '../idl/idl.json');
const idl = JSON.parse(fs.readFileSync(idlPath, 'utf-8'));

const PROGRAM_ID = new PublicKey('2UUG2M9mkNb9Mz2UUvZqq2zkM2JjeXPpPsjqGYuAQYvv');

export function getProvider(customerPubkey) {
  const dummyWallet = {
    publicKey: new PublicKey(customerPubkey),
    signTransaction: async () => {},
    signAllTransactions: async () => {},
  };

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  return new AnchorProvider(connection, dummyWallet, {});
}

export function getProgram(provider) {
  return new Program(idl, PROGRAM_ID, provider);
}
