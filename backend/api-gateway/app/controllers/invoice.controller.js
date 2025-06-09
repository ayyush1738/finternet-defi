import axios from 'axios';
import db from '../config/dbConnect.js';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';


export const upload = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const fileB64 = file.buffer.toString('base64');

    // 🔍 OCR + IPFS upload
    const ocrResp = await axios.post('http://localhost:8001/analyze', { file_b64: fileB64 });

    const riskResp = await axios.post('http://localhost:8002/score', { text: ocrResp.data.text });

    // 🧾 Create transaction via NFT minting service
    const web3Resp = await axios.post('http://localhost:5000/mint', {
      amount: req.body.amount,
      profit: req.body.profit,
      due_ts: req.body.due_ts,
      risk: riskResp.data.risk,
      cid: ocrResp.data.cid,
      creator: req.body.creator,
      mint: req.body.mint,
      name: req.body.name,
      organizationName: req.body.organization,
      description: req.body.description,
      royalties: req.body.royalties || 10,
    });

    console.log(req.body.organization)

    // 🗃️ Store invoice (without tx_sig yet)
    await db.query(
      "INSERT INTO invoices (username, cid, amount, creator, mint, created_at) VALUES ($1, $2, $3, $4, $5, NOW())",
      [req.body.organization, ocrResp.data.cid, req.body.amount, req.body.creator, req.body.mint]
    );


    // 📨 Respond with transaction
    res.json({
      ipfs_cid: ocrResp.data.cid,
      transaction_base64: web3Resp.data.transaction_base64,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: 'Internal error' });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, username, cid, tx_sig, amount, creator, mint, investor_pubkey, created_at 
       FROM invoices ORDER BY created_at DESC;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
};

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
