import axios from 'axios';
import db from '../config/dbConnect.js';

export const upload = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const fileB64 = file.buffer.toString('base64');

    // 🔍 OCR + IPFS upload
    const ocrResp = await axios.post('http://localhost:8001/analyze', { file_b64: fileB64 });

    // 🧠 Risk score
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
      description: req.body.description,
      royalties: req.body.royalties || 10,
    });

    // 🗃️ Store invoice (without tx_sig yet)
    await db.query(
      "INSERT INTO invoices (username, cid, amount, creator, created_at) VALUES ($1, $2, $3, NOW())",
      [req.body.username, ocrResp.data.cid, req.body.amount, req.body.creator, req.body.profit]
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
    const result = await db.query("SELECT id, cid, tx_sig, amount, creator, created_at FROM invoices ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
};

export const purchaseInvoice = async (req, res) => {
  try {
    const { cid, tx_sig, amount, seller, buyer } = req.body;

    if (!cid || !amount || !seller || !buyer) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    // Simulate a payment instruction (native SOL transfer)
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
        lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
      })
    );

    const serialized = tx.serialize({ requireAllSignatures: false });
    res.json({ transaction_base64: serialized.toString('base64') });
  } catch (err) {
    console.error('❌ Purchase error:', err);
    res.status(500).json({ message: err.message });
  }
};

