'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const BlurText = ({ 
  text, 
  animateBy = "words", 
  direction = "top", 
  delay = 200,
  stepDuration = 0.35,
  threshold = 0.1,
  rootMargin = "0px",
  onAnimationComplete
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (ref) {
      observer.observe(ref);
    }

    return () => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [ref, threshold, rootMargin]);

  const words = text.split(' ');
  const letters = text.split('');

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
      ref={setRef}
      variants={container}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      onAnimationComplete={onAnimationComplete}
      className="flex flex-wrap justify-center"
    >
      {animateBy === "words"
        ? words.map((word, index) => (
            <motion.span
              key={index}
              variants={child}
              className="mr-2"
            >
              {word}
            </motion.span>
          ))
        : letters.map((letter, index) => (
            <motion.span
              key={index}
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