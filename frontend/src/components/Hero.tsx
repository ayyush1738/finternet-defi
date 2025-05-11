import { TextGenerateEffect } from './ui/TextGenerateEffect';
import MagicButton from './MagicButton';
import { FaLocationArrow } from 'react-icons/fa6';


export default function Hero() {
    return (
        <div className="relative h-screen overflow-hidden w-full">
            {/* Background image layer */}
            <div className="absolute inset-0 bg-[url('/sol.png')] bg-cover bg-center z-0 w-full" />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-10" />

            {/* Content Layer */}
            <div className="relative z-20 flex flex-col items-center justify-center h-full w-full text-center px-4">
                <h1 className="text-white text-5xl font-bold mb-4">ChainVoice</h1>
                <div className='w-1/2'>
                    <TextGenerateEffect
                        className="text-white text-[10px] md:text-xl lg:text-2xl"
                        words="A decentralized marketplace for tokenized invoices, enabling SMEs to access instant liquidity and investors to earn fixed returns. Verified by AI, secured on Solana, and settled via Finternet’s unified ledger — bringing trustless, global invoice financing to the on-chain economy. No banks. No delays. Just capital, unlocked."
                    />
                    <div className="w-56 mx-auto mt-6">
                        <a href="/enterprise">
                            <MagicButton
                                title="For Enterprises"
                                icon={<FaLocationArrow />}
                                position="right"
                            />
                        </a>
                    </div>

                </div>
            </div>
        </div>
    );
}
