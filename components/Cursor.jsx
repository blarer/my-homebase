'use client';

import { useEffect, useRef } from 'react';

const INTERACTIVE = 'a, button, [role="button"]';
const HEADING     = 'h1, h2, h3';

export default function Cursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;
    let raf;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        dotRef.current.style.opacity = '1';
      }
      if (ringRef.current) ringRef.current.style.opacity = '1';
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.1;
      ringY += (mouseY - ringY) * 0.1;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px)`;
      }
      raf = requestAnimationFrame(animate);
    };

    const onMouseOver = (e) => {
      const ring = ringRef.current;
      const dot  = dotRef.current;
      if (!ring) return;

      if (e.target.closest(INTERACTIVE)) {
        ring.classList.add('hovered');
        ring.classList.remove('on-heading');
        if (dot) dot.style.opacity = '0';
      } else if (e.target.closest(HEADING)) {
        ring.classList.add('on-heading');
        ring.classList.remove('hovered');
        if (dot) dot.style.opacity = '1';
      }
    };

    const onMouseOut = (e) => {
      const ring = ringRef.current;
      const dot  = dotRef.current;
      if (!ring) return;

      if (e.target.closest(INTERACTIVE)) {
        ring.classList.remove('hovered');
        if (dot) dot.style.opacity = '1';
      } else if (e.target.closest(HEADING)) {
        ring.classList.remove('on-heading');
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="cursor-dot"  style={{ opacity: 0 }} />
      <div ref={ringRef} className="cursor-ring" style={{ opacity: 0 }} />
    </>
  );
}
