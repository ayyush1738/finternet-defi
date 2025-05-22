import db from '../config/dbConnect.js';

export const finalize = async (req, res) => {
  try {
    const { cid, tx_sig } = req.body;
    if (!cid || !tx_sig)
      return res.status(400).json({ message: 'cid and tx_sig are required' });

    const result = await db.query(
      'UPDATE invoices SET tx_sig = $1 WHERE cid = $2 RETURNING *',
      [tx_sig, cid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ success: true, updated: result.rows[0] });
  } catch (err) {
    console.error('❌ Finalize error:', err);
    res.status(500).json({ message: 'Internal error during finalize' });
  }
};
