'use client';

import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export default function HomeCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-2xl md:max-w-3xl mx-auto">
      <ScrollReveal direction="left" delay={0.2}>
        <Link href="/portfolio" className="block h-full">
          <div className="h-full rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.02] transition-colors duration-300">
            <div className="p-6 sm:p-8 text-center flex flex-col items-center">
              <div className="text-3xl sm:text-4xl mb-4 sm:mb-6">&#x1F4BB;</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-white">Portfolio</h3>
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base">Explore my latest projects and coding adventures.</p>
            </div>
          </div>
        </Link>
      </ScrollReveal>

      <ScrollReveal direction="right" delay={0.4}>
        <Link href="#about" className="block h-full">
          <div className="h-full rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.02] transition-colors duration-300">
            <div className="p-6 sm:p-8 text-center flex flex-col items-center">
              <div className="text-3xl sm:text-4xl mb-4 sm:mb-6">&#x1F680;</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-white">About</h3>
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base">Learn more about me and my journey in tech.</p>
            </div>
          </div>
        </Link>
      </ScrollReveal>
    </div>
  );
}
