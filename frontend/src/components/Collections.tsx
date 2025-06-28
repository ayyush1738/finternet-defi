export default function Collections() {
  const purchases = [
    { id: 'INV-101', date: '2025-05-01', owner: 'Tesla', amount: '3.0 SOL', invoiceUrl: '/invoices/INV-101.pdf' },
    { id: 'INV-102', date: '2025-04-25', owner: 'Tesla', amount: '1.5 SOL', invoiceUrl: '/invoices/INV-102.pdf' },
    { id: 'INV-103', date: '2025-04-15', owner: 'Tesla', amount: '4.8 SOL', invoiceUrl: '/invoices/INV-103.pdf' },
    { id: 'INV-104', date: '2025-05-04', owner: 'Tesla', amount: '2.1 SOL', invoiceUrl: '/invoices/INV-104.pdf' },
    { id: 'INV-105', date: '2025-05-05', owner: 'Tesla', amount: '3.5 SOL', invoiceUrl: '/invoices/INV-105.pdf' },
    { id: 'INV-106', date: '2025-05-06', owner: 'Tesla', amount: '1.2 SOL', invoiceUrl: '/invoices/INV-106.pdf' },
    { id: 'INV-107', date: '2025-05-07', owner: 'Tesla', amount: '2.9 SOL', invoiceUrl: '/invoices/INV-107.pdf' },
    { id: 'INV-108', date: '2025-05-08', owner: 'Tesla', amount: '5.0 SOL', invoiceUrl: '/invoices/INV-108.pdf' },
    { id: 'INV-109', date: '2025-05-09', owner: 'Tesla', amount: '1.8 SOL', invoiceUrl: '/invoices/INV-109.pdf' },
    { id: 'INV-110', date: '2025-05-10', owner: 'Tesla', amount: '2.3 SOL', invoiceUrl: '/invoices/INV-110.pdf' },
    { id: 'INV-111', date: '2025-05-11', owner: 'Tesla', amount: '4.2 SOL', invoiceUrl: '/invoices/INV-111.pdf' },
  ];

  return (
    <div
      className="pt-96 p-20 text-white h-auto"
      style={{
        background: 'linear-gradient(to bottom, #7c3aed, #1f2937)',
      }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-white">#Top Collections (Mock Data)</h2>

      <div className="overflow-x-auto rounded-xl shadow-lg bg-gray-800/60 backdrop-blur-lg">
        <div className="hidden md:block">
          <table className="min-w-full text-sm text-left text-gray-300">
            <thead className="bg-gray-900/80 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3">Invoice ID</th>
                <th className="px-6 py-3">Date Uploaded</th>
                <th className="px-6 py-3">Owner</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Profit</th>
                <th className="px-6 py-3">Invoice</th>
              </tr>
            </thead>
          </table>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            <table className="min-w-full text-sm text-left text-gray-300">
              <tbody>
                {purchases.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-700/50 transition duration-200">
                    <td className="px-6 py-4">{p.id}</td>
                    <td className="px-6 py-4">{p.date}</td>
                    <td className="px-6 py-4">{p.owner}</td>
                    <td className="px-6 py-4">{p.amount}</td>
                    <td className="px-6 py-4">2.5</td>
                    <td className="px-6 py-4">
                      <a
                        href={p.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded shadow"
                      >
                        View PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 max-h-[600px] overflow-y-auto space-y-4 custom-scrollbar">
          {purchases.map((p, i) => (
            <div key={i} className="bg-gray-700/40 rounded-lg p-4 shadow-md">
              <div className="mb-2">
                <span className="font-semibold">Invoice ID:</span> {p.id}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Date:</span> {p.date}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Owner:</span> {p.owner}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Amount:</span> {p.amount}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Profit:</span> 2.5
              </div>
              <a
                href={p.invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded shadow"
              >
                View PDF
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
