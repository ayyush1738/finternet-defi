'use client';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { FaCheckCircle } from 'react-icons/fa';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function OnDemandOffset() {
  const [dataPoints, setDataPoints] = useState<number[]>([10, 20, 15, 30, 25, 40, 35, 50]);
  const [currentOffset, setCurrentOffset] = useState<number>(39);

  useEffect(() => {
    const interval = setInterval(() => {
      const newPoint = Math.floor(Math.random() * 50);
      setDataPoints((prev) => [...prev.slice(1), newPoint]);
      setCurrentOffset(newPoint);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const data = {
    labels: Array(dataPoints.length).fill(''),
    datasets: [
      {
        data: dataPoints,
        borderColor: '#22c55e', // Tailwind green-500
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
      x: { display: false },
      y: { display: false },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <div className='flex absolute m-5'>
    <div className='ml-20'>
        <h2 className="text-4xl font-bold mb-4">On-Demand Offset</h2>
        <p className="text-lg mb-8">
          Offset your emissions in real-time with verified carbon credits.
        </p>

        <div className="space-y-6 mr-30">
          {[
            { title: 'Instant Verification', desc: 'All carbon credits are instantly verified on the blockchain.' },
            { title: 'Real-Time Tracking', desc: 'Monitor your carbon footprint reduction in real-time.' },
            { title: 'Transparent Reporting', desc: 'Generate detailed reports for sustainability initiatives.' },
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
        <h3 className="text-lg font-semibold mb-2">Carbon Offset Tracking</h3>
        <p className="text-sm text-gray-400 mb-4">Real-time monitoring of your carbon credits</p>
        <button className="text-green-400 text-xs mb-4">(Mock)Live Data</button>

        <div className="relative w-full h-40">
          <Line data={data} options={options} />
          <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-md text-green-400 text-sm">
            Current Offset<br /><span className="text-2xl font-bold">{currentOffset} tCO₂e</span>
          </div>
        </div>

        <div className="flex justify-between text-sm text-white mt-6">
          <div>
            <p className="text-gray-400">Total Offset</p>
            <p className="font-semibold">1,245 tCO₂e</p>
          </div>
          <div>
            <p className="text-gray-400">Projects</p>
            <p className="font-semibold">12 Active</p>
          </div>
          <div>
            <p className="text-gray-400">Certificates</p>
            <p className="font-semibold">35 Issued</p>
          </div>
        </div>
      </div>
      </div>
  );
}
