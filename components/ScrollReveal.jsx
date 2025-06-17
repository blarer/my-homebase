'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const ScrollReveal = ({ 
  children, 
  delay = 0,
  duration = 0.5,
  threshold = 0.1,
  rootMargin = "0px",
  className = "",
  direction = "up"
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

  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: 50, opacity: 0 };
      case 'down':
        return { y: -50, opacity: 0 };
      case 'left':
        return { x: 50, opacity: 0 };
      case 'right':
        return { x: -50, opacity: 0 };
      default:
        return { y: 50, opacity: 0 };
    }
  };

  return (
    <motion.div
      ref={setRef}
      initial={getInitialPosition()}
      animate={isVisible ? { 
        y: 0, 
        x: 0, 
        opacity: 1 
      } : getInitialPosition()}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal; 