import express from 'express';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

const app = express();
app.use(express.json());

// Solana connection
const connection = new Connection("https://api.devnet.solana.com", 'confirmed');

// Load mint authority keypair from env
const secret = JSON.parse(process.env.MINT_AUTHORITY_PRIVATE_KEY); // Put your private key as JSON array in env
const mintAuthority = Keypair.fromSecretKey(Uint8Array.from(secret));

app.post('/mint', async (req, res) => {
  try {
    const { amount, due_ts, risk, cid, creator } = req.body;

    if (!amount || !due_ts || !cid || !creator) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Generate a fake mint (In real-world, integrate with Anchor program here)
    const invoiceMint = Keypair.generate();

    // Create fake transaction for demo purpose
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: mintAuthority.publicKey,
        toPubkey: new PublicKey(creator), // In real, will be creator's associated token account
        lamports: 1000, // Mock transfer (e.g. for staking, setup)
      })
    );

    transaction.feePayer = mintAuthority.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.sign(mintAuthority);

    const serializedTx = transaction.serialize().toString('base64');
    const txSig = uuidv4(); // You can also get real txid using connection.sendRawTransaction

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
