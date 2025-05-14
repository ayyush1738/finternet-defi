import { TextGenerateEffect } from './ui/TextGenerateEffect';
import MagicButton from './MagicButton';
import { FaLocationArrow } from 'react-icons/fa6';
import { WavyBackground } from './ui/wavy-background'



export default function Hero() {
    return (
        <div className="relative h-screen overflow-hidden w-full">
            {/* Background image layer */}
            <div className='z-10 absolute inset-0'>
                <WavyBackground backgroundFill="#020009" />
            </div>
            <div className="absolute inset-0 bg-cover bg-center z-0 w-full" />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-10" />

            {/* Content Layer */}
            <div className="relative z-20 flex flex-col items-center justify-center h-full w-full text-center px-4">
                <div className='flex'>
                    <h1 className="text-white text-5xl font-bold mb-4">Cha</h1><h1 className="text-fuchsia-600 text-5xl font-bold mb-4">inVoice</h1>
                </div>
                <div className='w-1/2'>
                    <TextGenerateEffect
                        className="text-white text-[10px] md:text-xl lg:text-2xl"
                        words="A decentralized marketplace for tokenized invoices, enabling instant liquidity for SMEs and returns for investors"
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
