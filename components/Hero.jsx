"use client";
import BlurText from '@/components/BlurText';
import ScrollReveal from '@/components/ScrollReveal';
import Link from 'next/link';
import Silk from '@/components/react-bits/Backgrounds/Silk/Silk';

export default function Hero() {
  return (
    <section className="relative min-h-[50vh] flex items-center justify-center px-2 sm:px-4 pb-6 sm:pb-8 overflow-hidden">
      {/* Silk background - fixed to fill section */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <Silk
          speed={5}
          scale={1}
          color="#7B7481"
          noiseIntensity={1.5}
          rotation={0}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className="relative w-full max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 z-10">
        <BlurText 
          text="Welcome to My Digital Homebase" 
          animateBy="words"
          direction="top"
          delay={100}
          className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-bold tracking-tight"
        />
        <ScrollReveal delay={0.5}>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-xl sm:max-w-2xl mx-auto leading-relaxed">
            A place where I share my thoughts, projects, and journey through the digital world.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.7}>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-6 sm:mt-8 w-full">
            <Link
              href="/portfolio"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 border border-white/20 text-base font-medium rounded-md text-white bg-black/30 hover:bg-black/50 backdrop-blur-lg transition-all duration-300"
            >
              View My Work
            </Link>
            <Link
              href="/blog"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 border border-white/20 text-base font-medium rounded-md text-white bg-black/30 hover:bg-black/50 backdrop-blur-lg transition-all duration-300"
            >
              Read My Blog
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
} 