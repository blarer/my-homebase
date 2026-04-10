'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import AuroraBackground from '@/components/AuroraBackground';

const stats = [
  { value: '4+', label: 'Years building' },
  { value: '20+', label: 'Projects shipped' },
  { value: '∞', label: 'Bugs fixed' },
];

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="about" className="relative py-32 px-6 border-t overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      <AuroraBackground />
      <div className="relative z-10 max-w-6xl mx-auto">
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

          {/* Left */}
          <div>
            <motion.div
              className="flex items-center gap-3 mb-3"
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5 }}
            >
              <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.14em', fontVariantNumeric: 'tabular-nums' }}>02</span>
              <span className="label">About</span>
            </motion.div>
            <motion.h2
              className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            >
              Building at the intersection of design and code.
            </motion.h2>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t"
              style={{ borderColor: 'var(--border)' }}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-white tracking-tight">{s.value}</p>
                  <p className="label mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right */}
          <motion.div
            className="space-y-5 text-base leading-[1.8]"
            style={{ color: 'var(--text-secondary)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p>
              Hey everyone! I&apos;m diving into machine learning, focusing on Large Language Models, their architecture like transformers and self-attention, and how they differ from other AI methods like diffusion models.
            </p>
            <p>
              I want to explore how LLMs can go beyond their usual capabilities, especially with agents. I&apos;m excited about AI making development easier — but I believe it&apos;s key to understand the code deeply. Syntax, structure, the fundamentals.
            </p>
            <p>
              That way I can use AI as a smart tool and strategist, aligning with machine learning&apos;s core as a universal function approximator.
            </p>

            <div className="flex items-center gap-5 pt-4">
              {[
                { label: 'GitHub', href: 'https://github.com/blarer' },
                { label: 'Twitter', href: '#' },
                { label: 'Email', href: 'mailto:hi@blare.lol' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium border-b transition-all duration-200 pb-px"
                  style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
