'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const phrases = [
  'exploring LLMs',
  'building agents',
  'learning transformers',
  'studying self-attention',
  'pushing boundaries',
];

export default function TypewriterText() {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setIndex(i => (i + 1) % phrases.length), 2800);
    return () => clearInterval(id);
  }, []);

  if (!mounted) {
    return <span className="inline-block" style={{ color: 'var(--text-muted)' }}>{phrases[0]}</span>;
  }

  return (
    <span className="inline-block relative" style={{ minWidth: '180px' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={phrases[index]}
          className="inline-block"
          style={{ color: 'var(--text-muted)' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {phrases[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
