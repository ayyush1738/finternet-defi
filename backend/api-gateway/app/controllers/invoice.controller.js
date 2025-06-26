import db from '../config/dbConnect.js';
// import { getProvider, getProgram } from '../config/anchorSetup.js';
// import BN from 'bn.js';

export const getInvoices = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, username, cid, tx_sig, amount, inv_amount, creator, mint, investor_pubkey, created_at 
       FROM invoices ORDER BY created_at DESC;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
};








