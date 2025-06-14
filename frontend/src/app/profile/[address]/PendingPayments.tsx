'use client';

import { useEffect, useState } from 'react';

export default function PendingPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const wallet = (window as any).solana;
        if (!wallet || !wallet.isPhantom) {
          setError('Phantom wallet not found');
          setLoading(false);
          return;
        }

        const response = await wallet.connect();
        const walletAddress = response.publicKey.toString();

        // Replace `buyer` with `creator` or any correct query param if needed
        const res = await fetch(`http://localhost:8000/api/v1/invoice/pending?customer=${walletAddress}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed to fetch payments');

        setPayments(data.pendingPayments || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-semibold mb-6 text-white">Pending Payments</h2>

      {loading && <p className="text-gray-300">Loading pending invoices...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && payments.length === 0 && (
        <p className="text-gray-400">No pending invoices found.</p>
      )}

      {!loading && (
        <div className="overflow-x-auto rounded-xl shadow-lg bg-gray-800/60 backdrop-blur-lg">
          <table className="min-w-full table-auto text-left text-sm text-gray-300">
            <thead className="bg-gray-900/80">
              <tr>
                <th className="px-6 py-3">Invoice ID</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Recipient</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-700/50 transition duration-200">
                  <td className="px-6 py-4 font-medium">INV-{payment.id}</td>
                  <td className="px-6 py-4">{new Date(payment.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{payment.username}</td>
                  <td className="px-6 py-4">{parseFloat(payment.amount).toFixed(2)} SOL</td>
                  <td className="px-6 py-4">
                    <span className="inline-block bg-yellow-500/20 text-yellow-400 px-3 py-1 text-xs font-semibold rounded-full">
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow">
                      Pay Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
