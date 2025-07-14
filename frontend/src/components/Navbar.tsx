import WalletLogin from "./WalletLogin"

export default function Navbar() {
  return (
    <div className="absolute top-0 left-0 w-full z-30 flex items-center px-6 py-4">
      <div className="flex ml-10">
            <h1 className="text-white text-3xl font-bold mb-4">Cha</h1>
            <h1 className="text-fuchsia-600 text-3xl font-bold mb-4">inVoice</h1>
          </div>
      <div className="ml-auto">
        <WalletLogin />
      </div>
    </div>
  );
}
