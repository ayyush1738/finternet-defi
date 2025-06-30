'use client';

import { useEffect, useState } from 'react';
import { Connection, Transaction } from '@solana/web3.js';

export default function PendingPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [solPrice, setSolPrice] = useState<number | null>(null);

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
        const connectedAddress = response.publicKey.toString();
        setWalletAddress(connectedAddress);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/customer/pending?customer=${connectedAddress}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed to fetch payments');

        setPayments(data.pendingPayments || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
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

    fetchPayments();
    fetchSolPrice();
  }, []);

  const handleCustomerPayment = async (inv: any) => {
    const provider = (window as any).solana;
    if (!provider || !provider.isPhantom) return alert('Phantom not found');
    if (!walletAddress || !solPrice) return alert('Connect wallet and wait for SOL price');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/customer/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cid: inv.cid,
          customer: walletAddress,
          solPrice,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.transaction_base64) {
        throw new Error(data.message || 'Failed to get transaction from server');
      }

      const { transaction_base64 } = data;

      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      const tx = Transaction.from(Buffer.from(transaction_base64, 'base64'));
      const signedTx = await provider.signTransaction(tx);
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txid, 'confirmed');

      alert(`Invoice paid successfully!\nTx: ${txid}`);
      window.open(`https://explorer.solana.com/tx/${txid}?cluster=devnet`, '_blank');

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/customer/confirm-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cid: inv.cid }),
      });

      setPayments((prev) =>
        prev.map((p) => (p.cid === inv.cid ? { ...p, paid: true } : p))
      );
    } catch (err: any) {
      console.error(err);
      alert('Payment failed: ' + err.message);
    }
  };

  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-semibold mb-6 text-white">Pending Payments</h2>

      {loading && <p className="text-gray-300">Loading pending invoices...</p>}

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
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No pending invoices found.                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-700/50 transition duration-200">
                    <td className="px-6 py-4 font-medium">INV-{payment.id}</td>
                    <td className="px-6 py-4">{new Date(payment.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{payment.username}</td>
                    <td className="px-6 py-4">
                      {payment.inv_amount && solPrice
                        ? `${(payment.inv_amount / solPrice).toFixed(4)} SOL`
                        : '...'}
                    </td>
                    <td className="px-6 py-4">
                      {payment.paid ? (
                        <span className="inline-block bg-green-500/20 text-green-400 px-3 py-1 text-xs font-semibold rounded-full">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-block bg-yellow-500/20 text-yellow-400 px-3 py-1 text-xs font-semibold rounded-full">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleCustomerPayment(payment)}
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow disabled:opacity-50"
                        disabled={payment.paid}
                      >
                        {payment.paid ? 'Paid' : 'Pay Now'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
