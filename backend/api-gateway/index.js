// Express backend (index.js) to return a transaction
// that allows Phantom to mint an NFT (creator = signer)

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';
import {
  createCreateMetadataAccountV3Instruction,
} from '@metaplex-foundation/mpl-token-metadata';

const app = express();
app.use(cors());
app.use(express.json());

dotenv.config();
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// Helper to find Metadata PDA
const getMetadataPDA = (mint) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  )[0];
};

app.post('/mint', async (req, res) => {
  try {
    const { mint, creator, name, description, cid, royalties } = req.body;

    if (!mint || !creator || !cid || !name) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const mintPubkey = new PublicKey(mint);
    const creatorPubkey = new PublicKey(creator);
    const metadataPDA = getMetadataPDA(mintPubkey);

    const metadataIx = createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataPDA,
        mint: mintPubkey,
        mintAuthority: creatorPubkey,
        payer: creatorPubkey,
        updateAuthority: creatorPubkey,
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name,
            symbol: '',
            uri: `https://ipfs.io/ipfs/${cid}`,
            sellerFeeBasisPoints: parseInt(royalties) * 100 || 1000,
            creators: [
              {
                address: creatorPubkey,
                verified: false,
                share: 100,
              },
            ],
            collection: null,
            uses: null,
          },
          isMutable: true,
          collectionDetails: null,
        },
      }
    );

    const recent = await connection.getLatestBlockhash();
    const transaction = new Transaction({
      feePayer: creatorPubkey,
      recentBlockhash: recent.blockhash,
    });

    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: creatorPubkey,
        newAccountPubkey: mintPubkey,
        lamports: await connection.getMinimumBalanceForRentExemption(82),
        space: 82,
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      }),
      metadataIx
    );

    const serialized = transaction.serialize({ requireAllSignatures: false });
    res.json({ transaction_base64: serialized.toString('base64') });
  } catch (err) {
    console.error('Mint error:', err);
    res.status(500).json({ message: err.message });
  }
});

app.listen(5000, () => {
  console.log('⚡ NFT minting service running on http://localhost:5000');
});