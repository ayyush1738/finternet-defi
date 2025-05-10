import Navbar from "./Navbar"
export default function Hero() {
    return (
        <div className="flex p-6 h-full bg-violet-800">
            <section>Logo</section>
            <div className="ml-auto">
                <Navbar />
            </div>
        </div>
    );
}
