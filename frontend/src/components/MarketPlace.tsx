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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/invoice/list`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setInvoices(data);
      } catch (err) {
        console.error('Failed to load invoices:', err);
        alert('Failed to fetch invoices. Please try again later or contact support.');
      }
    };

    const checkWallet = async () => {
      const provider = (window as any).solana;
      if (provider?.isPhantom) {
        const resp = await provider.connect();
        setWalletAddress(resp.publicKey.toString());
      }
    };

    const fetchSolPrice = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await res.json();
        setSolPrice(data.solana.usd);
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
    if (!provider?.isPhantom) return alert('Phantom Wallet not found');
    if (!walletAddress) return alert('Connect wallet first');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/investor/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cid: inv.cid,
          tx_sig: inv.tx_sig,
          amount: inv.amount,
          seller: inv.creator,
          buyer: walletAddress,
        }),
      });

      if (!res.ok) throw new Error('Failed to create transaction');

      const { transaction_base64 } = await res.json();
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      const tx = Transaction.from(Buffer.from(transaction_base64, 'base64'));

      const signedTx = await provider.signTransaction(tx);
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txid, 'confirmed');

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/investor/purchase/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cid: inv.cid,
          tx_sig: txid,
          seller: inv.creator,
          buyer: walletAddress,
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
    <div className="py-32 px-6 md:px-20 text-white min-h-screen bg-gradient-to-b from-[#020009] via-[#1f2937] to-[#7c3aed]">
      <h2 className="text-3xl font-bold mb-4 text-white">📄 Invoice Marketplace</h2>
      <section className="mb-8 ml-6 text-gray-400">Invoices will be listed here after the mint</section>

      {/* Desktop Table */}
      <div className="hidden md:block bg-gray-900/60 rounded-xl shadow-lg backdrop-blur">
        <div className="max-h-[480px] overflow-y-auto custom-scrollbar rounded-xl">
          <table className="min-w-full table-auto text-sm text-left text-gray-300">
            <thead className="bg-gray-800 sticky top-0 z-10 text-xs uppercase text-gray-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Date Uploaded</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Profit</th>
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Tx</th>
                <th className="px-6 py-4">Purchase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    No data available
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-800 transition duration-200">
                    <td className="px-6 py-4 font-medium">INV-{inv.id}</td>
                    <td className="px-6 py-4">{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{inv.username}</td>
                    <td className="px-6 py-4">{inv.amount} SOL</td>
                    <td className="px-6 py-4">
                      {inv.inv_amount && solPrice
                        ? `${((inv.inv_amount / solPrice) - inv.amount).toFixed(4)} SOL`
                        : '...'}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`https://ipfs.io/ipfs/${inv.cid}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded shadow"
                      >
                        View PDF
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`https://explorer.solana.com/tx/${inv.tx_sig}?cluster=devnet`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 underline text-xs"
                      >
                        View Tx
                      </a>
                    </td>
                    <td className="px-6 py-4">
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
      <div className="md:hidden space-y-4 mt-6 max-h-[600px] overflow-y-auto rounded-xl custom-scrollbar backdrop-blur p-2">
        {invoices.length === 0 ? (
          <div className="text-center text-gray-400">No data available</div>
        ) : (
          invoices.map((inv) => (
            <div
              key={inv.id}
              className="bg-gray-800/70 rounded-xl p-4 shadow-lg border border-gray-700 backdrop-blur"
            >
              <p><strong>Invoice ID:</strong> INV-{inv.id}</p>
              <p><strong>Date:</strong> {new Date(inv.created_at).toLocaleDateString()}</p>
              <p><strong>Owner:</strong> {inv.username}</p>
              <p><strong>Amount:</strong> {inv.amount} SOL</p>
              <p><strong>Profit:</strong> {
                inv.inv_amount && solPrice
                  ? `${((inv.inv_amount / solPrice) - inv.amount).toFixed(4)} SOL`
                  : '...'
              }</p>
              <p className="mt-2">
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
  );
}