import WalletLogin from "./WalletLogin"
export default function Navbar() {
    return (
        <div className="flex items-center w-full">
            <div className="ml-auto">
                <WalletLogin />
            </div>
        </div>
    );
}
