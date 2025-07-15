'use client';

import React from 'react';

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
      className="py-32 px-6 md:px-20 text-white min-h-screen"
      style={{
        background: 'linear-gradient(to bottom, #7c3aed, #1f2937)',
      }}
    >
      <h2 className="text-3xl font-bold mt-80 mb-8 text-white">📦 Top Collections (Mock Data)</h2>

      {/* Desktop Table */}
      <div className="hidden md:block bg-gray-900/60 rounded-xl shadow-lg overflow-hidden backdrop-blur">
        <div className="w-full">
          <table className="min-w-full text-sm text-left text-gray-200 table-fixed">
            <thead className="bg-gray-800 sticky top-0 z-10 text-xs uppercase text-gray-300 tracking-wider">
              <tr>
                <th className="px-6 py-4 w-1/6">Invoice ID</th>
                <th className="px-6 py-4 w-1/6">Date Uploaded</th>
                <th className="px-6 py-4 w-1/6">Owner</th>
                <th className="px-6 py-4 w-1/6">Amount</th>
                <th className="px-6 py-4 w-1/6">Profit</th>
                <th className="px-6 py-4 w-1/6">Invoice</th>
              </tr>
            </thead>
          </table>

          {/* Scrollable tbody in sync with header */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            <table className="min-w-full text-sm text-left text-gray-200 table-fixed">
              <tbody className="divide-y divide-gray-700">
                {purchases.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-800 transition duration-200 ease-in-out">
                    <td className="px-6 py-4 w-1/6 font-medium">{p.id}</td>
                    <td className="px-6 py-4 w-1/6">{p.date}</td>
                    <td className="px-6 py-4 w-1/6">{p.owner}</td>
                    <td className="px-6 py-4 w-1/6">{p.amount}</td>
                    <td className="px-6 py-4 w-1/6">2.5</td>
                    <td className="px-6 py-4 w-1/6">
                      <a
                        href={p.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-sm"
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
      </div>


      {/* Mobile Cards - Scrollable */}
      <div className="md:hidden space-y-4 mt-6 max-h-[600px] overflow-y-auto rounded-xl custom-scrollbar backdrop-blur p-2">
        {purchases.map((p, i) => (
          <div
            key={i}
            className="bg-gray-800/70 rounded-xl p-4 shadow-lg backdrop-blur border border-gray-700"
          >
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="font-semibold text-gray-300">Invoice ID:</span>
              <span>{p.id}</span>
              <span className="font-semibold text-gray-300">Date:</span>
              <span>{p.date}</span>
              <span className="font-semibold text-gray-300">Owner:</span>
              <span>{p.owner}</span>
              <span className="font-semibold text-gray-300">Amount:</span>
              <span>{p.amount}</span>
              <span className="font-semibold text-gray-300">Profit:</span>
              <span>2.5</span>
            </div>
            <a
              href={p.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-md shadow"
            >
              View PDF
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
