'use client';

import { motion, useAnimationControls } from 'framer-motion';
import { useMemo, useCallback } from 'react';

const FuzzyText = ({ text, className, hoverIntensity = 0.3 }) => {
  const characters = useMemo(() => text.split(''), [text]);
  const controls = useAnimationControls();

  const handleHoverStart = useCallback(() => {
    controls.start((i) => ({
      filter: `blur(${Math.random() * hoverIntensity}px)`,
      x: (Math.random() - 0.5) * hoverIntensity * 5,
      y: (Math.random() - 0.5) * hoverIntensity * 5,
      opacity: 1 - (Math.random() * hoverIntensity * 2),
      transition: { duration: 0.3, ease: 'circOut' },
    }));
  }, [controls, hoverIntensity]);

  const handleHoverEnd = useCallback(() => {
    controls.start({
      filter: 'blur(0px)',
      x: 0,
      y: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: 'circOut' },
    });
  }, [controls]);

  return (
    <motion.div
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      className={`flex ${className}`}
    >
      {characters.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          custom={i}
          animate={controls}
          initial={{ filter: 'blur(0px)', opacity: 1, x: 0, y: 0 }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default FuzzyText; 