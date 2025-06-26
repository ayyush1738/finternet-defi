import db from '../config/dbConnect.js';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';


export const getPendingPayments = async (req, res) => {
  const { customer } = req.query;

  if (!customer) {
    return res.status(400).json({ message: 'Customer name is required' });
  }

  try {
    const invoiceResult = await db.query(
      `SELECT id, username, cid, inv_amount, created_at, paid 
       FROM invoices 
       WHERE customer_pubkey = $1 
       ORDER BY created_at DESC`,
      [customer]
    );

    res.json({ pendingPayments: invoiceResult.rows });
  } catch (err) {
    console.error('❌ Error fetching pending payments:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};




export const payInvoice = async (req, res) => {
  try {
    const { cid, customer, solPrice } = req.body;

    if (!cid || !customer || !solPrice) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await db.query(
      `SELECT inv_amount, investor_pubkey, customer_pubkey FROM invoices WHERE cid = $1`,
      [cid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const { inv_amount, investor_pubkey, customer_pubkey } = result.rows[0];

    if (customer_pubkey !== customer) {
      return res.status(400).json({ message: 'Unauthorized: wallet mismatch' });
    }

    const amountInSol = inv_amount / solPrice;
    const lamports = Math.floor(amountInSol * LAMPORTS_PER_SOL);

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const fromPub = new PublicKey(customer);
    const toPub = new PublicKey(investor_pubkey);
    const latestBlockhash = await connection.getLatestBlockhash();

    const tx = new Transaction({
      feePayer: fromPub,
      recentBlockhash: latestBlockhash.blockhash,
    }).add(
      SystemProgram.transfer({
        fromPubkey: fromPub,
        toPubkey: toPub,
        lamports,
      })
    );

    const serializedTx = tx.serialize({ requireAllSignatures: false }).toString('base64');
    res.json({ transaction_base64: serializedTx });

  } catch (err) {
    console.error('❌ Payment error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const confirmInvoicePayment = async (req, res) => {
  const { cid } = req.body;
  if (!cid) return res.status(400).json({ message: 'Missing CID' });

  try {
    const result = await db.query(
      `UPDATE invoices SET paid = TRUE WHERE cid = $1`,
      [cid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ message: 'Invoice marked as paid' });
  } catch (err) {
    console.error('❌ Error confirming invoice payment:', err);
    res.status(500).json({ message: 'Failed to mark invoice as paid' });
  }
};