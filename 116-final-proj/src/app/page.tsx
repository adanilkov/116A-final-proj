import Image from "next/image";
import Dropdown from "@/components/dropdown";
import MapVis from "@/components/map";
import BarVis from "@/components/barchart";
import BarCharVis from "@/components/avgpricevis";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-4 sm:p-10 gap-6 font-luxury bg-black text-white">
      {/* Header with Title */}
      <header className="row-start-1 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 via-gray-500 to-gray-300">[INSERT TITLE]</h1>
        <p className="text-sm sm:text-md text-gray-400 mt-2 italic tracking-wide">
          Created by Alex Danilkovas, Bryan Jiang, Jason Saez, Eric Xiao
        </p>
      </header>

      {/* Main Content */}
      <main className="row-start-2 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Map Visualization */}
        <div className="md:col-span-2 bg-gray-900 rounded-lg shadow-lg p-4">
          <h2 className="text-2xl font-light mb-4 text-gray-300">Geographical Analysis</h2>
          <MapVis />
        </div>

        {/* Right: Visualization Placeholder */}
        <div className="bg-gray-900 rounded-lg shadow-lg p-4">
          <h2 className="text-2xl font-light mb-4 text-gray-300">Additional Insights</h2>
        </div>
      </main>

      {/* Bottom Visualization */}
      <section className="row-start-3 bg-gray-900 rounded-lg shadow-lg p-4">
        <h2 className="text-2xl font-light mb-4 text-gray-300">Trends & Comparisons</h2>
        <BarVis />
      </section>

      {/* Footer */}
      <footer className="row-start-4 text-center mt-8">
        <a
          className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-300 hover:underline text-md"
          href="https://github.com/adanilkov/116A-final-proj"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={20}
            height={20}
          />
          View Project on Github
        </a>
      </footer>
    </div>
  );
}
