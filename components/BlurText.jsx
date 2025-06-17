'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function BlurText({
  text = "",
  animateBy = "words",
  direction = "top",
  delay = 200,
  stepDuration = 0.35,
  threshold = 0.1,
  rootMargin = "0px",
  onAnimationComplete,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const content = animateBy === "words" ? text.split(" ") : text.split("");

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

    const element = document.getElementById("blur-text-container");
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [threshold, rootMargin]);

  return (
    <div id="blur-text-container" className="overflow-hidden">
      {content.map((item, index) => (
        <motion.span
          key={index}
          initial={{ 
            opacity: 0,
            y: direction === "top" ? -20 : 20,
            filter: "blur(10px)"
          }}
          animate={isVisible ? {
            opacity: 1,
            y: 0,
            filter: "blur(0px)"
          } : {}}
          transition={{
            duration: stepDuration,
            delay: index * (delay / 1000),
            ease: "easeOut"
          }}
          onAnimationComplete={index === content.length - 1 ? onAnimationComplete : undefined}
          className="inline-block mr-1"
        >
          {item}
        </motion.span>
      ))}
    </div>
  );
} 