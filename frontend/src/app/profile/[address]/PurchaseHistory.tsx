'use client';
import { useEffect, useState } from 'react';

export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [solPrice, setSolPrice] = useState<number | null>(null);


  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const wallet = (window as any).solana;
        if (!wallet || !wallet.isPhantom) return;
        const response = await wallet.connect();
        const walletAddress = response.publicKey.toString();

        const res = await fetch(`http://localhost:8000/api/v1/investor/myPurchases?buyer=${walletAddress}`);
        const data = await res.json();
        setPurchases(data);
      } catch (err) {
        console.error('Failed to fetch purchase history:', err);
      }
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

    fetchPurchases();
    fetchSolPrice()
  }, []);


  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-semibold mb-6 text-white">Purchase History</h2>
      <div className="overflow-x-auto rounded-xl shadow-lg bg-gray-800/60 backdrop-blur-lg">
        <table className="min-w-full table-auto text-left text-sm text-gray-300">
          <thead className="bg-gray-900/80">
            <tr>
              <th className="px-6 py-3">Invoice ID</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Profit</th>
              <th className="px-6 py-3">Organization</th>
              <th className="px-6 py-3">Invoice</th>
              {/* <th className="px-6 py-3">Action</th> */}
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  No Purchase History Found.
                </td>
              </tr>
            ) : (
              purchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-700/50 transition duration-200">
                  <td className="px-6 py-4 font-medium">INV-{purchase.id}</td>
                  <td className="px-6 py-4">{new Date(purchase.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{purchase.amount} SOL</td>
                  <td className="px-6 py-4">
                    {purchase.inv_amount && solPrice
                      ? `${((purchase.inv_amount / solPrice) - purchase.amount).toFixed(4)} SOL`
                      : '...'}
                  </td>
                  <td className="px-6 py-4">{purchase.username}</td>
                  <td className="px-6 py-4">
                    <a
                      href={`https://ipfs.io/ipfs/${purchase.cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded shadow"
                    >
                      View PDF
                    </a>
                  </td>
                  {/* <td className="px-6 py-4">
                    <button
                      disabled={purchase.paid}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow disabled:opacity-50"
                    >
                      Sell Token
                    </button>

                  </td> */}
                  <td className="px-6 py-4">
                    {purchase.paid ? (
                      <span className="inline-block bg-green-500/20 text-green-400 px-3 py-1 text-xs font-semibold rounded-full">
                        Paid
                      </span>
                    ) : (
                      <span className="inline-block bg-yellow-500/20 text-yellow-400 px-3 py-1 text-xs font-semibold rounded-full">
                        Awaiting Payment
                      </span>
                    )}
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
