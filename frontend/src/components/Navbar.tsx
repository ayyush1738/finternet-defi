import WalletLogin from "./WalletLogin";

export default function Navbar() {
  return (
    <div className="absolute top-0 left-0 w-full z-30 flex items-center px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex sm:flex-row sm:items-center ml-4 sm:ml-10">
        <h1 className="text-white text-md sm:text-3xl font-bold leading-tight">Cha</h1>
        <h1 className="text-fuchsia-600 text-md sm:text-3xl font-bold leading-tight">inVoice</h1>
      </div>
      <div className="ml-auto">
        <WalletLogin />
      </div>
    </div>
  );
}
