'use client';
import { useEffect, useState } from 'react';
import { Connection, Transaction } from '@solana/web3.js';

export default function Market() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [solPrice, setSolPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/invoice/list');
        const data = await res.json();
        setInvoices(data);
      } catch (err) {
        console.error('Failed to load invoices', err);
      }
    };

    const checkWallet = async () => {
      const provider = (window as any).solana;
      if (provider && provider.isPhantom) {
        const resp = await provider.connect();
        setWalletAddress(resp.publicKey.toString());
      }
    };

    const fetchSolPrice = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await res.json();
        setSolPrice(data.solana.usd);
        console.log(solPrice);
      } catch (err) {
        console.error('Failed to fetch SOL price:', err);
      }
    };

    fetchInvoices();
    checkWallet();
    fetchSolPrice();
  }, []);

  const handlePurchase = async (inv: any) => {
    const provider = (window as any).solana;
    if (!provider || !provider.isPhantom) {
      alert('Phantom Wallet not found');
      return;
    }

    const address = walletAddress;
    if (!address) {
      alert('Connect wallet first');
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/v1/investor/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cid: inv.cid,
          tx_sig: inv.tx_sig,
          amount: inv.amount,
          seller: inv.creator,
          buyer: address,
        }),
      });

      if (!res.ok) throw new Error('Failed to create transaction');

      const { transaction_base64 } = await res.json();

      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      const tx = Transaction.from(Buffer.from(transaction_base64, 'base64'));

      const signedTx = await provider.signTransaction(tx);
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txid, 'confirmed');

      await fetch('http://localhost:8000/api/v1/investor/purchase/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cid: inv.cid,
          tx_sig: txid,
          seller: inv.creator,
          buyer: address,
        }),
      });

      alert(`Purchase Successful!\nTx: ${txid}`);
      window.open(`https://explorer.solana.com/tx/${txid}?cluster=devnet`, '_blank');
      window.location.reload();
    } catch (err: any) {
      console.error('Purchase failed', err);
      alert('Purchase failed: ' + err.message);
    }
  };

  return (
  <div className="p-20 text-white h-auto" style={{ background: 'linear-gradient(to bottom, #020009, #1f2937, #7c3aed)' }}>
    <h2 className="text-2xl font-semibold mb-6 text-white">#Invoice Listing</h2>
    <p className="text-sm text-gray-400 mb-3">Invoices Will be listed here after the upload</p>

    <div className="hidden md:block overflow-x-auto rounded-xl shadow-lg bg-gray-800/60 backdrop-blur-lg">
      <table className="min-w-full table-auto text-left text-sm text-gray-300">
        <thead className="bg-gray-900/80 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3">Invoice ID</th>
            <th className="px-6 py-3">Date Uploaded</th>
            <th className="px-6 py-3">Owner</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">Profit</th>
            <th className="px-6 py-3">Invoice</th>
            <th className="px-6 py-3">Tx</th>
            <th className="px-6 py-3">Purchase</th>
          </tr>
        </thead>
      </table>

      <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
        <table className="min-w-full table-auto text-left text-sm text-gray-300">
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-400">
                  No data available
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-700/50 transition duration-200">
                  <td className="px-10 py-4 font-medium">INV-{inv.id}</td>
                  <td className="px-14 py-4">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="px-12 py-4">{inv.username}</td>
                  <td className="px-12 py-4">{inv.amount} SOL</td>
                  <td className="px-12 py-4">
                    {inv.inv_amount && solPrice
                      ? `${((inv.inv_amount / solPrice) - inv.amount).toFixed(4)} SOL`
                      : '...'}
                  </td>
                  <td className="px-8 py-4">
                    <a
                      href={`https://ipfs.io/ipfs/${inv.cid}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded shadow"
                    >
                      View PDF
                    </a>
                  </td>
                  <td className="px-8 py-4">
                    <a
                      href={`https://explorer.solana.com/tx/${inv.tx_sig}?cluster=devnet`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 underline"
                    >
                      View Tx
                    </a>
                  </td>
                  <td className="px-8 py-4">
                    <button
                      onClick={() => handlePurchase(inv)}
                      disabled={inv.investor_pubkey}
                      className={`${inv.investor_pubkey
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-600'
                        } text-white text-xs font-semibold px-3 py-1 rounded shadow`}
                    >
                      {inv.investor_pubkey ? 'Sold' : 'Buy'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Mobile Cards */}
    <div className="md:hidden p-4 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
      {invoices.length === 0 ? (
        <div className="text-center text-gray-400">No data available</div>
      ) : (
        invoices.map((inv) => (
          <div key={inv.id} className="bg-gray-700/40 rounded-lg p-4 shadow-md">
            <p><strong>Invoice ID:</strong> INV-{inv.id}</p>
            <p><strong>Date:</strong> {new Date(inv.created_at).toLocaleDateString()}</p>
            <p><strong>Owner:</strong> {inv.username}</p>
            <p><strong>Amount:</strong> {inv.amount} SOL</p>
            <p><strong>Profit:</strong> {
              inv.inv_amount && solPrice
                ? `${((inv.inv_amount / solPrice) - inv.amount).toFixed(4)} SOL`
                : '...'
            }</p>
            <p className="mt-1">
              <a
                href={`https://ipfs.io/ipfs/${inv.cid}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded shadow"
              >
                View PDF
              </a>
            </p>
            <p className="mt-1">
              <a
                href={`https://explorer.solana.com/tx/${inv.tx_sig}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 underline text-xs"
              >
                View Tx
              </a>
            </p>
            <p className="mt-2">
              <button
                onClick={() => handlePurchase(inv)}
                disabled={inv.investor_pubkey}
                className={`${inv.investor_pubkey
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600'
                  } text-white text-xs font-semibold px-3 py-1 rounded shadow`}
              >
                {inv.investor_pubkey ? 'Sold' : 'Buy'}
              </button>
            </p>
          </div>
        ))
      )}
    </div>
  </div>
)}