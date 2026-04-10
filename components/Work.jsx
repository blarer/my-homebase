'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function Work() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="work" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex items-end justify-between mb-10 pb-8 border-b border-white/[0.06]"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.14em', fontVariantNumeric: 'tabular-nums' }}>01</span>
              <span className="label">Selected Work</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Things I&apos;ve built
            </h2>
          </div>
        </motion.div>

        {/* Coming soon */}
        <motion.div
          className="py-16 flex flex-col items-center justify-center text-center gap-3 border-b border-white/[0.06]"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center mb-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
              <circle cx="7" cy="7" r="5" />
              <path d="M7 4.5v3l1.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm font-medium text-white/50">Coming soon</p>
          <p className="text-xs max-w-xs" style={{ color: 'var(--text-muted)' }}>
            Projects are on their way. Check back soon.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
