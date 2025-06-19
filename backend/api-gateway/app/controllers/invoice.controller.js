import axios from 'axios';
import db from '../config/dbConnect.js';
import { getProvider, getProgram } from '../config/anchorSetup.js';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import BN from 'bn.js';


export const upload = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const fileB64 = file.buffer.toString('base64');

    // 🔍 OCR + IPFS upload
    const ocrResp = await axios.post('http://localhost:8001/analyze', { file_b64: fileB64 });

    const riskResp = await axios.post('http://localhost:8002/score', { text: ocrResp.data.text });

    // 🧾 Create transaction via NFT minting service
    const web3Resp = await axios.post('http://localhost:5000/mint', {
      amount: req.body.amount,
      profit: req.body.profit,
      due_ts: req.body.due_ts,
      risk: riskResp.data.risk,
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

    if (!cid || !seller || !buyer || !tx_sig ) {
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
      `SELECT id, username, cid, amount, tx_sig, created_at 
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
    // Step 1: Check if user exists
    const userResult = await db.query(
      'SELECT * FROM invoices WHERE customer_pubkey = $1',
      [customer]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found in user database' });
    }

    // Step 2: Fetch pending invoices for this user
    const invoiceResult = await db.query(
      `SELECT id, username, inv_amount, created_at 
       FROM invoices 
       ORDER BY created_at DESC`
    );

    res.json({ pendingPayments: invoiceResult.rows });
  } catch (err) {
    console.error('❌ Error fetching pending payments:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const payInvoiceViaContract = async (req, res) => {
  try {
    const { id, customer } = req.body;

    if (!id || !customer) {
      return res.status(400).json({ message: 'Missing ID or Customer' });
    }

    // Step 1: Fetch invoice info from DB
    const result = await db.query(
      `SELECT inv_amount, investor_pubkey FROM invoices WHERE id = $1 AND customer_pubkey = $2`,
      [id, customer]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found or access denied' });
    }

    const { inv_amount, investor_pubkey } = result.rows[0];
    const lamports = Math.floor(parseFloat(inv_amount) * 1e9); // convert to lamports

    // Step 2: Load Anchor Program
    const provider = getProvider(customer);
    const program = getProgram(provider);

    // Step 3: Derive Invoice PDA
    const [invoicePda] = await PublicKey.findProgramAddress(
      [Buffer.from("invoice"), Buffer.from(id.toString())],  // ✅ fix: id must be a string here
      program.programId
    );

    // Step 4: Build the transaction
    const tx = await program.methods
      .payInvoice(new BN(id), new BN(lamports))  // ✅ fix: both must be BN
      .accounts({
        customer: new PublicKey(customer),
        investor: new PublicKey(investor_pubkey),
        invoice: invoicePda,
        systemProgram: PublicKey.default,
      })
      .transaction();

    tx.feePayer = new PublicKey(customer);
    tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;

    const txBase64 = tx.serialize({ requireAllSignatures: false }).toString('base64');
    return res.json({ transaction_base64: txBase64 });

  } catch (err) {
    console.error('❌ payInvoiceViaContract error:', err);
    return res.status(500).json({ message: 'Smart contract payment error' });
  }
};