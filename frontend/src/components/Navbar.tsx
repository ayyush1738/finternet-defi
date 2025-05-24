import WalletLogin from "./WalletLogin"

export default function Navbar() {
  return (
    <div className="absolute top-0 left-0 w-full z-30 flex items-center px-6 py-4">
      <div className="ml-auto">
        <WalletLogin />
      </div>
    </div>
  );
}
