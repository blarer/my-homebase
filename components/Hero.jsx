'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TypewriterText from '@/components/TypewriterText';

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const fade = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    transition: { duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] },
  });

  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 overflow-hidden">
      {/* Gradient orbs */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.11) 0%, rgba(139,92,246,0.03) 50%, transparent 70%)' }}
      />
      <div
        className="absolute top-[30%] right-[15%] w-[320px] h-[320px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />

      {/* Content — negative mt offsets the fixed nav height so content is visually centred */}
      <div className="max-w-6xl mx-auto w-full -mt-16">
        <motion.p className="label mb-3" {...fade(0.1)}>
          Available for work · 2025
        </motion.p>

        <div>
          <motion.h1
            className="text-[clamp(56px,10vw,136px)] font-bold tracking-[-0.04em] leading-[0.9] text-white mb-10"
            initial={{ opacity: 0, y: 60 }}
            animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            Blare
          </motion.h1>
        </div>

        <motion.p
          className="text-base mb-3"
          style={{ color: 'var(--text-secondary)' }}
          {...fade(0.35)}
        >
          Currently: <TypewriterText />
        </motion.p>

        <motion.p
          className="text-lg md:text-xl leading-relaxed max-w-md mb-12"
          style={{ color: 'var(--text-secondary)' }}
          {...fade(0.45)}
        >
          Developer crafting exceptional digital experiences at the intersection of design and code.
        </motion.p>

        <motion.div className="flex items-center gap-6" {...fade(0.55)}>
          <a
            href="#work"
            className="inline-flex items-center gap-2 text-sm font-medium text-white border border-white/15 rounded-full px-5 py-2.5 hover:bg-white/5 hover:border-white/30 transition-all duration-200"
          >
            View Work
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 7h10M8 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a
            href="#about"
            className="text-sm font-medium transition-colors duration-200"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            About me
          </a>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        {...fade(1.1)}
      >
        <span className="label">Scroll</span>
        <motion.div
          className="w-px h-12"
          style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)' }}
          animate={mounted ? { scaleY: [1, 0.4, 1], opacity: [0.6, 1, 0.6] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
}
