'use client';

import { motion } from 'framer-motion';
import { useGpu } from '@/lib/useGpu';

const orbs = [
  {
    width: 640,
    height: 640,
    style: { top: '-15%', left: '-8%' },
    color: 'rgba(139, 92, 246, 0.13)',
    blur: 90,
    mobileBlur: 25,
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
    mobileBlur: 20,
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
    mobileBlur: 20,
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
    mobileBlur: 20,
    animate: {
      x: [0, -40, 60, -20, 0],
      y: [0, 40, -30, 60, 0],
      scale: [1, 1.05, 1.2, 0.9, 1],
    },
    duration: 26,
  },
];

export default function AuroraBackground() {
  const { hasGpu, mobile } = useGpu();

  // No GPU: static gradient, no animations
  if (!hasGpu) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 30% 40%, rgba(139,92,246,0.08) 0%, transparent 70%), ' +
              'radial-gradient(ellipse 50% 40% at 70% 60%, rgba(99,102,241,0.06) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(8,8,8,0.6) 100%)',
          }}
        />
      </div>
    );
  }

  // Mobile with GPU: 2 orbs, reduced blur
  // Desktop with GPU: all 4 orbs, full blur
  const activeOrbs = mobile ? orbs.slice(0, 2) : orbs;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(8,8,8,0.6) 100%)',
        }}
      />

      {activeOrbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.width,
            height: orb.height,
            ...orb.style,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: `blur(${mobile ? orb.mobileBlur : orb.blur}px)`,
            willChange: 'transform',
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
