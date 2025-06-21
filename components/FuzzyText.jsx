'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

const FuzzyText = ({ text, className, hoverIntensity = 0.3 }) => {
  const characters = useMemo(() => text.split(''), [text]);

  return (
    <motion.div initial="initial" whileHover="hover" className={`flex ${className}`}>
      {characters.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          variants={{
            initial: {
              filter: `blur(0px)`,
              opacity: 1,
            },
            hover: {
              filter: `blur(${Math.random() * hoverIntensity}px)`,
              transform: `translateX(${(Math.random() - 0.5) * hoverIntensity * 5}px) translateY(${(Math.random() - 0.5) * hoverIntensity * 5}px)`,
              opacity: 1 - (Math.random() * hoverIntensity * 2),
            }
          }}
          transition={{ duration: 0.3, ease: 'circOut' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default FuzzyText; 