'use client';

import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';
import GlareHover from '@/components/react-bits/Animations/GlareHover/GlareHover';
import ShinyText from '@/components/react-bits/TextAnimations/ShinyText/ShinyText';

export default function HomeCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-2xl md:max-w-3xl mx-auto">
      <ScrollReveal direction="left" delay={0.2}>
        <Link href="/portfolio" className="block h-full">
          <GlareHover
            borderRadius="12px"
            glareColor="#ffffff"
            glareOpacity={0.15}
            transitionDuration={800}
            className="h-full border border-white/10 hover:border-white/20"
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(16px)' }}
          >
            <div className="p-6 sm:p-8 text-center flex flex-col items-center relative z-10">
              <div className="text-3xl sm:text-4xl mb-4 sm:mb-6 animate-float">&#x1F4BB;</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Portfolio</h3>
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">Explore my latest projects and coding adventures.</p>
            </div>
          </GlareHover>
        </Link>
      </ScrollReveal>

      <ScrollReveal direction="right" delay={0.4}>
        <GlareHover
          borderRadius="12px"
          glareColor="#ffffff"
          glareOpacity={0.15}
          transitionDuration={800}
          className="h-full border border-white/10 hover:border-white/20"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(16px)' }}
        >
          <div className="p-6 sm:p-8 text-center flex flex-col items-center relative z-10">
            <div className="text-3xl sm:text-4xl mb-4 sm:mb-6 animate-float" style={{ animationDelay: '0.4s' }}>&#x1F680;</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">About</h3>
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">Learn more about me and my journey in tech.</p>
          </div>
        </GlareHover>
      </ScrollReveal>
    </div>
  );
}
