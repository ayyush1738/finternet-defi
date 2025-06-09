import db from '../config/dbConnect.js';

export const finalize = async (req, res) => {
  try {
    const { cid, tx_sig, creator } = req.body;

    if (!cid || !tx_sig || !creator) {
      return res.status(400).json({ message: 'cid, tx_sig, and creator are required' });
    }

    const result = await db.query(
      'UPDATE invoices SET tx_sig = $1 WHERE cid = $2 AND creator = $3 RETURNING *',
      [tx_sig, cid, creator]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Invoice not found or unauthorized' });
    }

    res.json({ success: true, updated: result.rows[0] });
  } catch (err) {
    console.error('❌ Finalize error:', err);
    res.status(500).json({ message: 'Internal error during finalize' });
  }
};
