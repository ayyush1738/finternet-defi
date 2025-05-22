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
      "INSERT INTO invoices (cid, amount, creator, created_at) VALUES ($1, $2, $3, NOW())",
      [ocrResp.data.cid, req.body.amount, req.body.creator]
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
