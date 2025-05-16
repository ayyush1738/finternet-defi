import axios from 'axios';
import db from '../config/dbConnect.js';

export const upload = async (req, res) => {
  try {
    // Assuming req.user injected by middleware, mock it here
    const mockUser = { id: 'sme-123', role: 'enterprise' };

    if (mockUser.role !== 'enterprise') {
      return res.status(403).json({ message: 'Forbidden: Enterprise role required' });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileB64 = file.buffer.toString('base64');

    const ocrResp = await axios.post('http://localhost:8001/analyze', { file_b64: fileB64 });
    const fraudResp = await axios.post('http://localhost:8002/check', { hash: ocrResp.data.hash });
    if (!fraudResp.data.is_legit) return res.status(400).json({ message: 'Fraud check failed' });

    const riskResp = await axios.post('http://localhost:8003/score', { text: ocrResp.data.text });
    const web3Resp = await axios.post('http://localhost:8004/mint', {
      amount: req.body.amount,
      due_ts: req.body.due_ts,
      risk: riskResp.data.risk,
      cid: ocrResp.data.cid,
      creator: mockUser.id,
    });

    await db.query(
      "INSERT INTO invoices (cid, tx_sig, amount, creator, created_at) VALUES ($1, $2, $3, $4, NOW())",
      [ocrResp.data.cid, web3Resp.data.txSig, req.body.amount, mockUser.id]
    );

    return res.json({
      ipfs_cid: ocrResp.data.cid,
      transaction_base64: web3Resp.data.transaction_base64,
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ message: 'Internal error' });
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

