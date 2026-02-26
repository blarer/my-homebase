"use client";
import BlurText from '@/components/BlurText';
import ScrollReveal from '@/components/ScrollReveal';
import Link from 'next/link';
import Silk from '@/components/react-bits/Backgrounds/Silk/Silk';

export default function Hero() {
  return (
    <section className="relative min-h-[50vh] flex items-center justify-center px-2 sm:px-4 pb-6 sm:pb-8 overflow-hidden">
      {/* Background Effects Container */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Silk background */}
        <Silk
          speed={5}
          scale={1}
          color="#1a1a1a"
          noiseIntensity={1.5}
          rotation={0}
          style={{ width: '100%', height: '100%' }}
        />
        
        {/* Horizontal Oval Blur Effect */}
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            {/* Primary oval blur */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100/10 via-gray-50/8 to-gray-100/10 rounded-full blur-3xl animate-float-oval"></div>
            
            {/* Secondary oval blur for depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200/8 via-gray-100/6 to-gray-200/8 rounded-full blur-2xl animate-float-oval-delayed"></div>
            
            {/* Subtle glow rings */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-50/3 via-gray-25/3 to-gray-50/3 rounded-full blur-xl animate-pulse-slow"></div>
          </div>
        </div>
      </div>
      
      {/* Gradient Fade Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black z-5 pointer-events-none"></div>
      
      {/* Foreground Content */}
      <div className="relative flex flex-col items-center w-full max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 z-10">
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

          </div>
        </ScrollReveal>
      </div>
    </section>
  );
} 