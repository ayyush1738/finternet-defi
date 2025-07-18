import { FaTwitter, FaGithub } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 px-10 py-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-700 pb-6">
        
        <div className="mb-6 md:mb-0">
          <div className="flex">
            <h1 className="text-white font-bold mb-4">Cha</h1>
            <h1 className="text-fuchsia-600 font-bold mb-4">inVoice</h1>
          </div>
          <p className="text-sm mt-2">Empowering Enterprises with decentralized finance.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-10 w-full md:w-auto justify-between md:justify-end">
          
          <div>
            <h4 className="text-white font-semibold mb-2">Company</h4>
            <ul className="space-y-1">
              <li><a href="#" className="hover:text-white text-sm">About Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Connect</h4>
            <div className="flex gap-4 text-xl">
              <a href="https://github.com/ayyush1738" target='_blank' className="hover:text-white"><FaGithub /></a>
              <a href="https://x.com/AyushSingh1738" target='_blank' className="hover:text-white"><FaTwitter /></a>
            </div>
          </div>

        </div>
      </div>

      <div className="text-center text-xs text-gray-500 mt-6">
        © 2025 ChaInvoice, Inc. All rights reserved.
      </div>
    </footer>
  );
}
