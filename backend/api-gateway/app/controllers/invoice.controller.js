import axios from 'axios';

export const upload = async (req, res) => {
  try {
    if (req.user.role !== 'SME') {
      return res.status(403).json({ message: 'Forbidden: SME role required' });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileB64 = file.buffer.toString('base64');

    const ocrResp = await axios.post('http://ocr-service:8000/analyze', {
      file_b64: fileB64,
    });

    if (!ocrResp.data.hash || !ocrResp.data.cid) {
      return res.status(400).json({ message: 'OCR failed' });
    }

    const fraudResp = await axios.post('http://fraud-check-service:8001/check', {
      hash: ocrResp.data.hash,
    });

    if (!fraudResp.data.is_legit) {
      return res.status(400).json({ message: 'Fraud check failed' });
    }

    // 🟢 CALL RISK-SCORE
    const riskResp = await axios.post('http://risk-score-service:8002/score', {
      text: ocrResp.data.text,
    });

    // 🟢 CALL WEB3-SERVICE to mint token
    const web3Resp = await axios.post('http://web3-service:5000/mint', {
      amount: req.body.amount,
      due_ts: req.body.due_ts,
      risk: riskResp.data.risk,
      cid: ocrResp.data.cid,
      creator: req.user.id,
    });

    return res.json({
      txSig: web3Resp.data.txSig,
      risk: riskResp.data.risk,
      cid: ocrResp.data.cid,
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ message: 'Internal error' });
  }
};
