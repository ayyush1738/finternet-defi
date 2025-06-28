import axios from 'axios';
import db from '../config/dbConnect.js';

export const upload = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const fileB64 = file.buffer.toString('base64');

    // 🔍 OCR + IPFS upload
    const ocrResp = await axios.post('https://finternet-ocr-service-production.up.railway.app/analyze', { file_b64: fileB64 });


    // 🧾 Create transaction via NFT minting service
    const web3Resp = await axios.post('https://mint.linkpc.net/mint', {
      amount: req.body.amount,
      profit: req.body.profit,
      due_ts: req.body.due_ts,
      cid: ocrResp.data.cid,
      inv_amount: ocrResp.data.total_amount,
      creator: req.body.creator,
      mint: req.body.mint,
      name: req.body.name,
      organizationName: req.body.organization,
      description: req.body.description,
      customer_pubkey: req.body.customer_pubkey,
    });

    console.log(req.body.organization)

    await db.query(
      "INSERT INTO invoices (username, cid, amount, inv_amount, creator, mint, customer_pubkey, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())",
      [req.body.organization, ocrResp.data.cid, req.body.amount, ocrResp.data.total_amount, req.body.creator, req.body.mint, req.body.customer_pubkey]
    );


    res.json({
      ipfs_cid: ocrResp.data.cid,
      transaction_base64: web3Resp.data.transaction_base64,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: 'Internal error' });
  }
};