import { FaGlobe, FaMoneyBillWave } from 'react-icons/fa';
import { BsShieldCheck, BsGraphUpArrow } from 'react-icons/bs';

export default function Features() {
    return (
        <section className="relative overflow-hidden text-white py-16 px-6 flex flex-col items-center">
            {/* Background Image */}
            <div className="absolute inset-0 bg-center bg-cover bg-no-repeat bg-[url('/sol.png')]">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>
            </div>

            {/* Foreground Content */}
            <div className="relative z-10">
                <h1 className="text-4xl font-bold text-center mb-4">Redefining Carbon Offsetting</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
                    <div className="bg-white/10 border border-gray-700 rounded-xl p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <BsShieldCheck className="text-2xl" />
                            <h3 className="text-xl font-semibold">Tokenize Carbon Credits</h3>
                        </div>
                        <p>
                            CarbonPay securely transforms verified carbon credits into blockchain-based tokens,
                            ensuring transparency and authenticity.
                        </p>
                    </div>

                    <div className="bg-white/10 border border-gray-700 rounded-xl p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <FaGlobe className="text-2xl" />
                            <h3 className="text-xl font-semibold">Facilitate Global Trading</h3>
                        </div>
                        <p>
                            Enables seamless buying and selling of carbon credits globally, removing intermediaries
                            and promoting market accessibility.
                        </p>
                    </div>

                    <div className="bg-white/10 border border-gray-700 rounded-xl p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <BsGraphUpArrow className="text-2xl" />
                            <h3 className="text-xl font-semibold">Real-Time Tracking</h3>
                        </div>
                        <p>
                            Provides real-time insights into carbon credit ownership, usage, and compliance through
                            a user-friendly dashboard.
                        </p>
                    </div>

                    <div className="bg-white/10 border border-gray-700 rounded-xl p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <FaMoneyBillWave className="text-2xl" />
                            <h3 className="text-xl font-semibold">Multi-Currency & Payment Options</h3>
                        </div>
                        <p>
                            Support payments in stablecoins, fiat, and crypto, providing flexibility for businesses
                            and institutions worldwide.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
