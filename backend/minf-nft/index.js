import express from 'express';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: '*',  // ✅ Use '*' or specific domain e.g. 'http://localhost:3000'
    credentials: true,
}));

const connection = new Connection("https://api.devnet.solana.com", 'confirmed');

// ✅ Make sure you have stored the PRIVATE KEY as JSON array in env
const secret = JSON.parse(process.env.MINT_AUTHORITY_PRIVATE_KEY);
const mintAuthority = Keypair.fromSecretKey(Uint8Array.from(secret));

app.post('/mint', async (req, res) => {
  try {
    const { amount, due_ts, risk, cid, creator } = req.body;

    if (!amount || !due_ts || !cid || !creator) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const creatorPubkey = new PublicKey(creator); // Validate creator address

    // Create transaction where user is sender and payer
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: creatorPubkey,
        toPubkey: mintAuthority.publicKey,
        lamports: 1000, // For demo only
      })
    );

    transaction.feePayer = creatorPubkey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const serializedTx = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    }).toString('base64');

    const txSig = uuidv4(); // ❗Mock sig only for backend reference

    res.json({
      transaction_base64: serializedTx,
      txSig: txSig,
    });
  } catch (err) {
    console.error('Mint service error:', err);
    res.status(500).json({ message: 'Minting error', error: err.message });
  }
});

app.listen(5000, () => console.log('Web3 Minting Service running on port 5000'));
