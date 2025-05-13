import Hero from '@/components/Hero';
import Navbar from "@/components/Navbar";
import Market from "@/components/MarketPlace"

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Market />
    </main>
  );
}
