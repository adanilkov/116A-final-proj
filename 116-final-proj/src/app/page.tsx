import Image from "next/image";
import Dropdown from "@/components/dropdown";
import LinkedVis from "@/components/LinkedVisualization";
// import CountyTable from "@/components/tablevis";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-4 sm:p-10 gap-6 font-luxury bg-base-100 text-black">
      {/* Header with Title */}
      <header className="row-start-1 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-500 to-gray-500">[INSERT TITLE]</h1>
        <p className="text-sm sm:text-md text-gray-400 mt-2 italic tracking-wide">
          Created by Alex Danilkovas, Bryan Jiang, Jason Saez, Eric Xiao
        </p>
      </header>

      {/* Main Content */}
      <main className="row-start-2 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Map Visualization */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-xl p-4">
          <h2 className="text-2xl font-light mb-4 text-neutral">Geographical Analysis</h2>
          <div id="map-container" className="w-full h-full"></div>
        </div>

        {/* Right: Visualization Placeholder */}
        <div className="bg-white rounded-lg shadow-xl p-4">
          <h2 className="text-2xl font-light mb-4 text-neutral">Selected Counties</h2>
          <div id="table-container">
            {/* <CountyTable /> */}
          </div>
        </div>
      </main>

      {/* Bottom Visualization */}
      <section className="row-start-3 bg-white rounded-lg shadow-xl p-4">
        <h2 className="text-2xl font-light mb-4 text-neutral">Trends & Comparisons</h2>
        <div id="barchart-container" className="w-full h-full"></div>
      </section>

      {/* LinkedVisualization Component */}
      <LinkedVis />

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