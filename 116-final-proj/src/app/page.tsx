import Image from "next/image";
import Dropdown from "@/components/dropdown";
import MapVis from "@/components/map";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-8 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Header
      <header className="row-start-1 flex justify-between items-center">
        <Dropdown />
      </header> */}

      {/* Main Content */}
      <main className="row-start-2 flex flex-row gap-8">
        {/* Left: Map Visualization */}
        <div className="flex-1 h-full">
          <MapVis />
        </div>

        {/* Right: Visualization Placeholder */}
        <div className="flex-1 h-full border border-white bg-black p-2">
          <p>Right-side Visualization Placeholder</p>
        </div>
      </main>

      {/* Bottom Visualization */}
      <section className="row-start-3 border border-white bg-black">
        <p>Bottom-center Visualization Placeholder</p>
      </section>

      {/* Footer */}
      <footer className="row-start-4 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Github
        </a>
      </footer>
    </div>
  );
}
