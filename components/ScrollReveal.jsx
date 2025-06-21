'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const ScrollReveal = ({ 
  children, 
  delay = 0,
  duration = 0.5,
  threshold = 0.1,
  rootMargin = "0px",
  className = "",
  direction = "up"
}) => {
  const [ref, isVisible] = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true
  });

  const initialPosition = useMemo(() => {
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
  }, [direction]);

  const finalPosition = useMemo(() => ({ 
    y: 0, 
    x: 0, 
    opacity: 1 
  }), []);

  return (
    <motion.div
      ref={ref}
      initial={initialPosition}
      animate={isVisible ? finalPosition : initialPosition}
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