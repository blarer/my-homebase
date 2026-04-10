import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center px-4 pb-8 overflow-hidden">
      <div className="flex flex-col items-center w-full max-w-3xl mx-auto text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight text-white">
          Welcome to My Digital Homebase
        </h1>
        <p className="text-base sm:text-lg text-gray-400 max-w-xl leading-relaxed">
          A place where I share my projects and journey through the digital world.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-4">
          <Link
            href="/portfolio"
            className="px-6 py-2.5 rounded-md border border-white/20 text-white text-sm font-medium hover:bg-white/5 hover:border-white/40 transition-all duration-200"
          >
            View My Work
          </Link>
          <Link
            href="#about"
            className="px-6 py-2.5 rounded-md text-gray-400 text-sm font-medium hover:text-white transition-colors duration-200"
          >
            About Me
          </Link>
        </div>
      </div>
    </section>
  );
}
