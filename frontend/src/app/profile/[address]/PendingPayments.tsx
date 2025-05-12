export default function PendingPayments() {
  const payments = [
    { id: 'INV-001', date: '2025-05-12', recipient: 'Alice Wallet', amount: '2.5 SOL', status: 'Pending' },
    { id: 'INV-002', date: '2025-05-10', recipient: 'Bob Wallet', amount: '1.0 SOL', status: 'Pending' },
    { id: 'INV-003', date: '2025-05-08', recipient: 'Charlie Wallet', amount: '5.2 SOL', status: 'Pending' },
  ];

  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-semibold mb-6 text-white">Pending Payments</h2>
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
            {payments.map((payment, index) => (
              <tr
                key={payment.id}
                className="hover:bg-gray-700/50 transition duration-200"
              >
                <td className="px-6 py-4 font-medium">{payment.id}</td>
                <td className="px-6 py-4">{payment.date}</td>
                <td className="px-6 py-4">{payment.recipient}</td>
                <td className="px-6 py-4">{payment.amount}</td>
                <td className="px-6 py-4">
                  <span className="inline-block bg-yellow-500/20 text-yellow-400 px-3 py-1 text-xs font-semibold rounded-full">
                    {payment.status}
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
    </div>
  );
}
