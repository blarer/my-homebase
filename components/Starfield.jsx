'use client';

import { useEffect, useRef } from 'react';

// parallaxFactor: how much of the scroll delta each layer inherits
// Far stars barely react; near stars rush past
const LAYERS_DESKTOP = [
  { count: 180, speed: 0.012, minSize: 0.3, maxSize: 0.8,  opacity: 0.35, parallaxFactor: 0.03 },
  { count: 90,  speed: 0.025, minSize: 0.6, maxSize: 1.2,  opacity: 0.55, parallaxFactor: 0.08 },
  { count: 35,  speed: 0.045, minSize: 1.0, maxSize: 1.8,  opacity: 0.80, parallaxFactor: 0.18 },
];
const LAYERS_MOBILE = [
  { count: 80,  speed: 0.012, minSize: 0.3, maxSize: 0.8,  opacity: 0.35, parallaxFactor: 0.03 },
  { count: 40,  speed: 0.025, minSize: 0.6, maxSize: 1.2,  opacity: 0.55, parallaxFactor: 0.08 },
  { count: 15,  speed: 0.045, minSize: 1.0, maxSize: 1.8,  opacity: 0.80, parallaxFactor: 0.18 },
];
const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function buildStars(w, h) {
  const LAYERS = isMobile() ? LAYERS_MOBILE : LAYERS_DESKTOP;
  return LAYERS.flatMap(({ count, speed, minSize, maxSize, opacity, parallaxFactor }) =>
    Array.from({ length: count }, () => ({
      x:              Math.random() * w,
      y:              Math.random() * h,
      size:           rand(minSize, maxSize),
      speed,
      parallaxFactor,
      opacity:        rand(opacity * 0.6, opacity),
      phase:          rand(0, Math.PI * 2),
      period:         rand(3000, 9000),
    }))
  );
}

export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let stars          = [];
    let raf;
    let startTime      = null;
    let lastTimestamp  = null;

    // Smoothed scroll velocity — decays each frame
    let scrollVel   = 0;
    let lastScrollY = window.scrollY;
    let hidden      = false;

    const onVisibility = () => { hidden = document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

    // Normalise all movement to a 60 fps baseline.
    // At 120 fps dt ≈ 0.5 → each frame moves half as far → same visual speed.
    const FRAME_MS = 1000 / 60;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = buildStars(canvas.width, canvas.height);
    };

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const rawDelta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
      scrollVel = scrollVel * 0.82 + rawDelta * 0.18;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const draw = (timestamp) => {
      if (hidden) { raf = requestAnimationFrame(draw); return; }
      if (!startTime)     startTime    = timestamp;
      if (!lastTimestamp) lastTimestamp = timestamp;

      const elapsed   = timestamp - startTime;
      const deltaMs   = timestamp - lastTimestamp;
      lastTimestamp   = timestamp;

      // dt = 1.0 at 60 fps · 0.5 at 120 fps · 0.42 at 144 fps
      // Clamp to 4 frames so a backgrounded tab doesn't cause a jump
      const dt = Math.min(deltaMs / FRAME_MS, 4);

      // Frame-rate-independent exponential decay
      scrollVel = scrollVel * Math.pow(0.82, dt);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const star of stars) {
        // Scale movement by dt so speed is identical at 60/120/144 Hz
        star.y += (star.speed + scrollVel * star.parallaxFactor) * dt;

        // Wrap — handle both downward and upward scroll
        if (star.y > canvas.height + star.size) {
          star.y = -star.size;
          star.x = Math.random() * canvas.width;
        } else if (star.y < -star.size) {
          star.y = canvas.height + star.size;
          star.x = Math.random() * canvas.width;
        }

        // Gentle independent pulse
        const pulse = 0.5 + 0.5 * Math.sin((elapsed / star.period) * Math.PI * 2 + star.phase);
        const alpha = star.opacity * (0.7 + 0.3 * pulse);

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);

    const ro = new ResizeObserver(resize);
    ro.observe(document.documentElement);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden
    />
  );
}
