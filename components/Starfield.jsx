'use client';

import { useEffect, useRef } from 'react';

const LAYERS = [
  { count: 180, speed: 0.012, minSize: 0.3, maxSize: 0.8,  opacity: 0.35 }, // far — tiny, slow, dim
  { count: 90,  speed: 0.025, minSize: 0.6, maxSize: 1.2,  opacity: 0.55 }, // mid
  { count: 35,  speed: 0.045, minSize: 1.0, maxSize: 1.8,  opacity: 0.80 }, // near — larger, faster, bright
];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function buildStars(canvas) {
  return LAYERS.flatMap(({ count, speed, minSize, maxSize, opacity }) =>
    Array.from({ length: count }, () => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      size:    rand(minSize, maxSize),
      speed,
      opacity: rand(opacity * 0.6, opacity),
      // each star pulses at its own phase & period
      phase:   rand(0, Math.PI * 2),
      period:  rand(3000, 9000),
    }))
  );
}

export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let stars = [];
    let raf;
    let startTime = null;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
      stars = buildStars(canvas);
    };

    const draw = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const star of stars) {
        // Drift downward at layer speed; wrap back to top when off-screen
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = -star.size;
          star.x = Math.random() * canvas.width;
        }

        // Gentle pulse
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

    // Rebuild on resize so stars fill the new dimensions
    const ro = new ResizeObserver(resize);
    ro.observe(document.documentElement);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 1 }}
      aria-hidden
    />
  );
}
