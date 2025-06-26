import db from '../config/dbConnect.js';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

export const purchaseInvoice = async (req, res) => {
  try {
    const { cid, amount, seller, buyer } = req.body;

    if (!cid || !amount || !seller || !buyer) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const fromPub = new PublicKey(buyer);
    const toPub = new PublicKey(seller);
    const latestBlockhash = await connection.getLatestBlockhash();

    const tx = new Transaction({
      feePayer: fromPub,
      recentBlockhash: latestBlockhash.blockhash,
    }).add(
      SystemProgram.transfer({
        fromPubkey: fromPub,
        toPubkey: toPub,
        lamports: Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL),
      })
    );

    const serializedTx = tx.serialize({ requireAllSignatures: false }).toString('base64');
    res.json({ transaction_base64: serializedTx });

  } catch (err) {
    console.error('❌ Purchase error:', err);
    res.status(500).json({ message: err.message });
  }
};


export const confirmPurchase = async (req, res) => {
  try {
    const { cid, seller, buyer, tx_sig } = req.body;

    if (!cid || !seller || !buyer || !tx_sig) {
      return res.status(400).json({ message: 'Missing confirmation fields' });
    }

    await db.query(
      `UPDATE invoices 
       SET investor_pubkey = $1, tx_sig = $2 
       WHERE cid = $3 AND creator = $4`,
      [buyer, tx_sig, cid, seller]
    );

    res.json({ message: 'Purchase recorded' });
  } catch (err) {
    console.error('❌ Confirmation error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getMyPurchases = async (req, res) => {
  const { buyer } = req.query;
  if (!buyer) return res.status(400).json({ message: 'Buyer address required' });

  try {
    const result = await db.query(
      `SELECT id, username, cid, amount, inv_amount, tx_sig, created_at, paid 
       FROM invoices 
       WHERE investor_pubkey = $1 
       ORDER BY created_at DESC`,
      [buyer]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Failed to fetch purchases:', err);
    res.status(500).json({ message: 'Failed to fetch purchases' });
  }
};