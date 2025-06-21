'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const BlurText = ({ 
  text, 
  animateBy = "words", 
  direction = "top", 
  delay = 200,
  stepDuration = 0.35,
  threshold = 0.1,
  rootMargin = "0px",
  onAnimationComplete,
  className = ""
}) => {
  const [ref, isVisible] = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true
  });

  const words = useMemo(() => text.split(' '), [text]);
  const letters = useMemo(() => text.split(''), [text]);

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: delay / 1000 },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration: stepDuration,
      },
    },
    hidden: {
      opacity: 0,
      y: direction === "top" ? 20 : -20,
      filter: 'blur(10px)',
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration: stepDuration,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      onAnimationComplete={onAnimationComplete}
      className={`flex flex-wrap justify-center ${className}`}
    >
      {animateBy === "words"
        ? words.map((word, index) => (
            <motion.span
              key={`${word}-${index}`}
              variants={child}
              className="mr-2"
            >
              {word}
            </motion.span>
          ))
        : letters.map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              variants={child}
              className="inline-block"
            >
              {letter}
            </motion.span>
          ))}
    </motion.div>
  );
};

export default BlurText; 