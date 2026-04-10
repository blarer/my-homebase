'use client';

import { motion } from 'framer-motion';

const orbs = [
  {
    width: 640,
    height: 640,
    style: { top: '-15%', left: '-8%' },
    color: 'rgba(139, 92, 246, 0.13)',
    blur: 90,
    animate: {
      x: [0, 60, -30, 80, 0],
      y: [0, 80, 40, -40, 0],
      scale: [1, 1.1, 0.95, 1.05, 1],
    },
    duration: 22,
  },
  {
    width: 480,
    height: 480,
    style: { bottom: '-10%', right: '-5%' },
    color: 'rgba(99, 102, 241, 0.10)',
    blur: 80,
    animate: {
      x: [0, -70, 30, -50, 0],
      y: [0, -50, 70, 20, 0],
      scale: [1, 0.9, 1.15, 0.95, 1],
    },
    duration: 28,
  },
  {
    width: 360,
    height: 360,
    style: { top: '35%', left: '45%' },
    color: 'rgba(167, 139, 250, 0.07)',
    blur: 70,
    animate: {
      x: [0, 50, -60, 20, 0],
      y: [0, -60, 20, 50, 0],
      scale: [1, 1.2, 0.85, 1.1, 1],
    },
    duration: 34,
  },
  {
    width: 280,
    height: 280,
    style: { top: '10%', right: '15%' },
    color: 'rgba(124, 58, 237, 0.08)',
    blur: 60,
    animate: {
      x: [0, -40, 60, -20, 0],
      y: [0, 40, -30, 60, 0],
      scale: [1, 1.05, 1.2, 0.9, 1],
    },
    duration: 26,
  },
];

export default function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Subtle vignette */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(8,8,8,0.6) 100%)',
        }}
      />

      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.width,
            height: orb.height,
            ...orb.style,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: `blur(${orb.blur}px)`,
          }}
          animate={orb.animate}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatType: 'mirror',
          }}
        />
      ))}
    </div>
  );
}
