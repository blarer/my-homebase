'use client';

import { useScroll, useSpring, motion } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[60] origin-left h-px pointer-events-none"
      style={{
        scaleX,
        background: 'linear-gradient(to right, rgba(139,92,246,0.8), rgba(99,102,241,0.6))',
      }}
    />
  );
}
