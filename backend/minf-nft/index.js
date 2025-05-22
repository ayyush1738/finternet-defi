import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  createCreateMetadataAccountV3Instruction,
} from '@metaplex-foundation/mpl-token-metadata';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);

// 🧠 Helper: Find PDA for metadata account
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
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const mintPublicKey = new PublicKey(mint);
    const userPublicKey = new PublicKey(creator);
    const metadataPDA = await findMetadataPDA(mintPublicKey);
    const metadataURI = `https://ipfs.io/ipfs/${cid}`;
    const nftName = name || 'Untitled NFT';
    const nftDescription = description || '';
    const sellerFeeBasisPoints = parseInt(royalties) * 100 || 500;

    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    // 🧾 Instructions to create and initialize mint account
    const createMintAccountIx = SystemProgram.createAccount({
      fromPubkey: userPublicKey,
      newAccountPubkey: mintPublicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    });

    const initMintIx = createInitializeMintInstruction(
      mintPublicKey,
      0, // decimals
      userPublicKey, // mint authority
      userPublicKey // freeze authority
    );

    // 🧠 Metadata instruction
    const metadataIx = createCreateMetadataAccountV3Instruction(
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
            collection: null,
            uses: null,
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

    // ⛓️ Order matters
    transaction.add(createMintAccountIx);
    transaction.add(initMintIx);
    transaction.add(metadataIx);

    const serialized = transaction.serialize({
      requireAllSignatures: false, // Phantom will sign
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
