'use client';
import { useEffect, useState } from 'react';

export default function Market() {
  const [invoices, setInvoices] = useState<any[]>([]);

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
    fetchInvoices();
  }, []);

  return (
    <div className="p-20 text-white h-auto" style={{ background: 'linear-gradient(to bottom, #020009, #1f2937, #7c3aed)' }}>
      <h2 className="text-2xl font-semibold mb-6 text-white">#Invoice Listing</h2>
      <div className="overflow-x-auto rounded-xl shadow-lg bg-gray-800/60 backdrop-blur-lg">
        <table className="min-w-full table-auto text-left text-sm text-gray-300">
          <thead className="bg-gray-900/80 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3">Invoice ID</th>
              <th className="px-6 py-3">Date Uploaded</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Invoice</th>
              <th className="px-6 py-3">Tx</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-700/50 transition duration-200">
                <td className="px-10 py-4 font-medium">INV-{inv.id}</td>
                <td className="px-14 py-4">{new Date(inv.created_at).toLocaleDateString()}</td>
                <td className="px-12 py-4">{inv.amount} SOL</td>
                <td className="px-8 py-4">
                  <a href={`https://ipfs.io/ipfs/${inv.cid}`} target="_blank" rel="noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded shadow">
                    View PDF
                  </a>
                </td>
                <td className="px-8 py-4">
                  <a href={`https://explorer.solana.com/tx/${inv.tx_sig}?cluster=devnet`} target="_blank" rel="noreferrer" className="text-emerald-400 underline">
                    View Tx
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
