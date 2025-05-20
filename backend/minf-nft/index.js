import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  Connection,
  PublicKey,
  Transaction,
} from '@solana/web3.js';

import {
  createCreateMetadataAccountV3Instruction,
} from '@metaplex-foundation/mpl-token-metadata';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');


// 🧠 Find PDA for metadata account
const findMetadataPDA = async (mintPublicKey) => {
  const [pda] = await PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintPublicKey.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  return pda;
};

app.post('/mint', async (req, res) => {
  try {
    const {
      amount,
      due_ts,
      risk,
      cid,
      creator,
      mint,
      name,
      description,
      royalties,
    } = req.body;

    if (!cid || !creator || !mint) {
      return res
        .status(400)
        .json({ message: 'Missing required fields: cid, creator, or mint' });
    }

    console.log('[REQUEST]', { mint, creator });

    let mintPublicKey, userPublicKey;
    try {
      mintPublicKey = new PublicKey(mint);
      userPublicKey = new PublicKey(creator);
    } catch (err) {
      console.error('Invalid PublicKey:', err.message);
      return res.status(400).json({ message: 'Invalid creator or mint address' });
    }

    const metadataPDA = await findMetadataPDA(mintPublicKey);

    const metadataURI = `https://ipfs.io/ipfs/${cid}`;
    const nftName = name || 'Untitled NFT';
    const nftDescription = description || '';
    const sellerFeeBasisPoints = parseInt(royalties) * 100 || 1000;

    const metadataIx =   createCreateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        mint: mintPublicKey,
        mintAuthority: userPublicKey,
        payer: userPublicKey,
        updateAuthority: userPublicKey,
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name: nftName,
            symbol: '',
            uri: metadataURI,
            sellerFeeBasisPoints,
            creators: [
              {
                address: userPublicKey,
                verified: false,
                share: 100,
              },
            ],
          },
          isMutable: true,
          collectionDetails: null,
        },
      }
    );

    const latestBlockhash = await connection.getLatestBlockhash();

    const transaction = new Transaction({
      feePayer: userPublicKey,
      recentBlockhash: latestBlockhash.blockhash,
    });

    transaction.add(metadataIx);

    const serialized = transaction.serialize({
      requireAllSignatures: false,
    });

    const transaction_base64 = serialized.toString('base64');

    res.json({ transaction_base64 });
  } catch (err) {
    console.error('❌ Mint error:', err.stack || err.message);
    res.status(500).json({ message: err.message || 'Minting failed' });
  }
});

app.listen(5000, () => {
  console.log('⚡ Minting service running at http://localhost:5000');
});
