'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * The running head. A journal prints the title of the article being read
 * at the top of every page; this does the same, following whichever
 * section carries `data-running-head` and sits under the head line.
 *
 * It tucks away while the reader scrolls down and returns on the first
 * scroll up, so it is there when wanted and never on top of a figure. The
 * hairline along its foot is reading progress, drawn by a CSS
 * scroll-driven animation, so it costs no script at all.
 *
 * Server-rendered with the page title as the running head, so it reads
 * correctly with JavaScript off.
 */
const NAV = [
  { href: '/', label: 'Introduction' },
  { href: '/work/', label: 'The work' },
];

const normalise = (path) => (path.endsWith('/') ? path : `${path}/`);

export default function Masthead() {
  const pathname = normalise(usePathname() ?? '/');
  const fallback = pathname === '/work/' ? 'The work, measured' : 'An introduction';
  const [running, setRunning] = useState(null);
  const [tucked, setTucked] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    setRunning(null);
    const sections = [...document.querySelectorAll('[data-running-head]')];
    if (!sections.length || !('IntersectionObserver' in window)) return;

    const visible = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target, e.boundingClientRect.top);
          else visible.delete(e.target);
        }
        // The topmost section still crossing the band under the masthead.
        const current = sections.find((s) => visible.has(s));
        setRunning(current ? current.dataset.runningHead : null);
      },
      { rootMargin: '-64px 0px -70% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;
        if (Math.abs(delta) > 6) {
          setTucked(delta > 0 && y > 240);
          lastY.current = y;
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const head = running ?? fallback;

  return (
    <header
      className="masthead"
      data-tucked={tucked || undefined}
      onFocusCapture={() => setTucked(false)}
    >
      <div className="masthead-inner">
        <Link href="/" className="masthead-mark" aria-label="Blare, home">
          <span aria-hidden="true">J</span>
          <span className="masthead-mark-dot" aria-hidden="true" />
          <span aria-hidden="true">L</span>
        </Link>

        <p className="masthead-running" aria-live="off">
          <span className="masthead-running-text" key={head}>
            {head}
          </span>
        </p>

        <nav className="masthead-nav" aria-label="Site">
          {NAV.map((item) => {
            const current = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="masthead-link"
                aria-current={current ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <span className="masthead-progress" aria-hidden="true" />
    </header>
  );
}
