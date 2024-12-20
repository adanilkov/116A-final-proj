"use client"

import Image from "next/image";
import LinkedVis from "@/components/LinkedVisualization";
// import CountyTable from "@/components/tablevis";
import { useState } from "react";
import Filters from "@/components/filters"

export default function Home() {
  const [previewToggled, setPreviewToggled] = useState(false);

  const togglePreview = () => {
    setPreviewToggled((prev) => !prev);
  };

  const [filteredCounties, setFilteredCounties] = useState([]);

  const handleFilterChange = (filtered) => {
    setFilteredCounties(filtered);
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-4 sm:p-10 gap-6 font-luxury bg-base-100 text-black">
      {/* Header with Title */}
      <header className="row-start-1 text-center">
        <div className="p-4">
          <h1 className="h-16 text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-600 to-gray-500">
            U.S. Real Estate Insights by County
          </h1>
        </div>
        <p className="text-sm sm:text-md text-gray-400 mt-2 italic tracking-wide">
          Created by Alex Danilkovas, Bryan Jiang, Jason Saez, Eric Xiao
          
        </p>
      </header>

      {/* Main Content */}
      <main className="">

        {/* Left: Map Visualization */}
        <div className="flex items-stretch justify-center space-x-4 h-[80vh]">
        <div
          className={`flex-grow transition-all duration-500 ease-in-out bg-white rounded-lg shadow-xl p-4 h-[85vh] ${previewToggled ? "w-[70%]" : "w-full"}`}
        >
          <div className="text-2xl flex font-sans font-light mb-4 text-neutral w-full justify-between items-center">
            Geographical Analysis
            <button
              className="btn items-center justify-end bg-white min-h-2 rounded-lg h-8 w-20 focus:outline-none"
              onClick={togglePreview}
            >
              <span className="font-light text-sm -translate-x-1">Filters</span>
            </button>
          </div>
          <div id="map-container" className="w-full h-full"></div>
        </div>




          {/* Right: Filter Panel */}
          {/* class={`shadow-lg rounded-xl flex-grow-0 transition-all duration-500 ease-in-out ${previewToggled ? "w-[30%]" : "w-0"} overflow-auto`} */}
          <div
            className={`bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-500 ease-in-out ${
              previewToggled ? "w-[30%] opacity-100 visible" : "w-0 opacity-0 invisible"
            }`}
          >
            <div className="p-4">
              <h2 className="text-2xl font-sans font-light mb-4 text-neutral">
                Heatmap Filters
              </h2>
              <Filters onFilterChange={handleFilterChange}/>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Visualization */}
      <section className="row-start-3 bg-white rounded-lg shadow-xl p-4">
        <h2 className="text-2xl font-sans font-light mb-4 text-neutral">
          Trends & Comparisons
        </h2>
        <div id="barchart-container" className="w-full h-full"></div>
      </section>

      {/* LinkedVisualization Component */}
      <LinkedVis filteredCounties={filteredCounties} previewToggled={previewToggled} />

      {/* Video Section */}
      <section className="bg-white rounded-lg shadow-xl p-4 mb-6">
        <h2 className="text-2xl font-sans font-light mb-4 text-neutral">
         Project Video
        </h2>
        <div className="w-full aspect-video flex justify-center items-center rounded-lg overflow-hidden">
        <iframe 
      width="100%"
      height="100%"
      src="https://www.youtube.com/embed/7whopGv3bZA"
      title="Project Video"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="border-none"
    />
  </div>
</section>
      {/* Google Doc Section */}
  <section className="bg-white rounded-lg shadow-xl p-4 mb-6">
  <h2 className="text-2xl font-sans font-light mb-4 text-neutral">
    Project Documentation
  </h2>
  <div className="w-full h-[800px] overflow-hidden rounded-lg flex justify-center items-center">
    <iframe 
      className="w-[850px] h-full border-none" 
      src="https://docs.google.com/document/d/e/2PACX-1vQsxKoo5W22BoqPcXUINZmrKlu5CuPCIQ1Ce_yapHXX9clAnSJMWpfRKse2GXePT5odF73ulO-9Gnuw/pub?embedded=true"
    />
  </div>
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
            src="../file.svg"
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
