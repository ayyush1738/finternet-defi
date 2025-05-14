export default function Collections() {
    const purchases = [
        { id: 'INV-101', date: '2025-05-01', amount: '3.0 SOL', invoiceUrl: '/invoices/INV-101.pdf' },
        { id: 'INV-102', date: '2025-04-25', amount: '1.5 SOL', invoiceUrl: '/invoices/INV-102.pdf' },
        { id: 'INV-103', date: '2025-04-15', amount: '4.8 SOL', invoiceUrl: '/invoices/INV-103.pdf' },
        { id: 'INV-101', date: '2025-05-01', amount: '3.0 SOL', invoiceUrl: '/invoices/INV-101.pdf' },
        { id: 'INV-102', date: '2025-04-25', amount: '1.5 SOL', invoiceUrl: '/invoices/INV-102.pdf' },
        { id: 'INV-103', date: '2025-04-15', amount: '4.8 SOL', invoiceUrl: '/invoices/INV-103.pdf' },
        { id: 'INV-101', date: '2025-05-01', amount: '3.0 SOL', invoiceUrl: '/invoices/INV-101.pdf' },
        { id: 'INV-102', date: '2025-04-25', amount: '1.5 SOL', invoiceUrl: '/invoices/INV-102.pdf' },
        { id: 'INV-103', date: '2025-04-15', amount: '4.8 SOL', invoiceUrl: '/invoices/INV-103.pdf' },
        { id: 'INV-101', date: '2025-05-01', amount: '3.0 SOL', invoiceUrl: '/invoices/INV-101.pdf' },
        { id: 'INV-102', date: '2025-04-25', amount: '1.5 SOL', invoiceUrl: '/invoices/INV-102.pdf' },
        { id: 'INV-103', date: '2025-04-15', amount: '4.8 SOL', invoiceUrl: '/invoices/INV-103.pdf' },
        { id: 'INV-101', date: '2025-05-01', amount: '3.0 SOL', invoiceUrl: '/invoices/INV-101.pdf' },
        { id: 'INV-102', date: '2025-04-25', amount: '1.5 SOL', invoiceUrl: '/invoices/INV-102.pdf' },
        { id: 'INV-103', date: '2025-04-15', amount: '4.8 SOL', invoiceUrl: '/invoices/INV-103.pdf' },
    ];

    return (
        <div
            className="pt-96 p-20 text-white h-auto"
            style={{
                background: 'linear-gradient(to bottom, #7c3aed, #1f2937)',
            }}
        >
            <h2 className="text-2xl font-semibold mb-6 text-white">#Collections</h2>
            <div className="overflow-x-auto rounded-xl shadow-lg bg-gray-800/60 backdrop-blur-lg">
                <table className="min-w-full table-auto text-left text-sm text-gray-300">
                    <thead className="bg-gray-900/80 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-3">Invoice ID</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Invoice</th>
                            <th className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                </table>
                {/* Scrollable tbody wrapper with custom scrollbar */}
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    <table className="min-w-full table-auto text-left text-sm text-gray-300">
                        <tbody>
                            {purchases.map((purchase, index) => (
                                <tr
                                    key={index}
                                    className="hover:bg-gray-700/50 transition duration-200"
                                >
                                    <td className="px-6 py-4 font-medium">{purchase.id}</td>
                                    <td className="px-6 py-4">{purchase.date}</td>
                                    <td className="px-6 py-4">{purchase.amount}</td>
                                    <td className="px-6 py-4">
                                        <a
                                            href={purchase.invoiceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded shadow"
                                        >
                                            View PDF
                                        </a>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow">
                                            Sell Token
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
