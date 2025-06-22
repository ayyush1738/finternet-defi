'use client';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { FaCheckCircle } from 'react-icons/fa';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function OnDemandOffset() {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'], // x-axis (months)
    datasets: [
      {
        label: 'Credits Earned',
        data: [100, 120, 150, 130, 170, 190, 180, 210], // y-axis (mock credits)
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        pointRadius: 4,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Month',
          color: '#ccc',
        },
        ticks: {
          color: '#ccc',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Average Credits Used',
          color: '#ccc',
        },
        ticks: {
          color: '#ccc',
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  return (
    <div className='flex absolute m-5'>
      <div className='ml-20'>
        <h2 className="text-4xl font-bold mb-4">On-Chain Verification</h2>
        <p className="text-lg mb-8">
          Solana powered on-chain user verification.
        </p>

        <div className="space-y-6 mr-30">
          {[
            { title: 'Instant Verification', desc: 'You just need a Phantom wallet to instantly buy or sell the tokenized invoices.' },
            { title: 'Real-Time Tracking', desc: 'Monitor the purchased/sold tokens with the intutive UI.' },
            { title: 'Transparent Reporting', desc: 'Track your transactions seamlessly through Solana explorer.' },
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <FaCheckCircle className="text-black mt-1" />
              <div>
                <h4 className="font-semibold">{item.title}</h4>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Graph Card */}
      <div className="bg-black/50 border border-gray-700 rounded-xl p-6 w-1/2 ml-30 h-80 relative">
        <h3 className="text-lg font-semibold mb-2">Tokenization Real Time Tracking</h3>
        <p className="text-sm text-gray-400 mb-3">Average credits Used</p>
        <button className="text-green-400 text-xs mb-5">(Mock)Historic Data</button>

        {/* Chart */}
        <div className="relative w-full h-40">
          <Line data={data} options={options} />
        </div>

      </div>
    </div>
  );
}
