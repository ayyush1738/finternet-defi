import Hero from '@/components/Hero';
import Navbar from "@/components/Navbar";
import Market from "@/components/MarketPlace";
import Features from "@/components/Features";
import Collections from '@/components/Collections';
import OffsetTracking from '@/components/OffsetTracking';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Features />
      <Market />
      <OffsetTracking/>
      <Collections />
      <Footer />
    </main>
  );
}
