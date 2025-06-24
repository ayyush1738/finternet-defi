import axios from 'axios';
import db from '../config/dbConnect.js';
// import { getProvider, getProgram } from '../config/anchorSetup.js';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
// import BN from 'bn.js';


export const upload = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const fileB64 = file.buffer.toString('base64');

    // 🔍 OCR + IPFS upload
    const ocrResp = await axios.post('http://localhost:8001/analyze', { file_b64: fileB64 });


    // 🧾 Create transaction via NFT minting service
    const web3Resp = await axios.post('http://localhost:5000/mint', {
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

export const getMyPurchases = async (req, res) => {
  const { buyer } = req.query;
  if (!buyer) return res.status(400).json({ message: 'Buyer address required' });

  try {
    const result = await db.query(
      `SELECT id, username, cid, amount, tx_sig, created_at, paid 
       FROM invoices 
       WHERE investor_pubkey = $1 
       ORDER BY created_at DESC`,
      [buyer]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Failed to fetch purchases:', err);
    res.status(500).json({ message: 'Failed to fetch purchases' });
  }
};


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

