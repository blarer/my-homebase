'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * One-shot section reveals via IntersectionObserver.
 *
 * Sections start dimmed (see motion.css, scoped to `html.reveal-ready`) and
 * get `.in-view` once as they enter the viewport. The dimmed state only
 * exists under `reveal-ready`, which is added *after* the observer is wired,
 * so no JS (or a throw) means fully visible static content.
 *
 * This runs as an effect keyed on the pathname, not as an inline script,
 * because the App Router swaps page content on client-side navigation
 * without re-running inline scripts. The first version was inline and
 * worked on a cold load but left every section invisible after clicking
 * from / to /work: `reveal-ready` persisted on <html> while the new
 * sections never received `.in-view`. The effect re-arms on each route.
 *
 * prefers-reduced-motion bails out before any class is added: no dimming,
 * no observer, no motion.
 *
 * A section that ends up ABOVE the viewport also counts as revealed. The
 * observer's root is inflated 100000px upward so skipped-past sections still
 * intersect it: an instant jump (End key, anchor link, find-in-page) can
 * move a section from below the viewport to above it without a single
 * intersecting frame, so the callback also treats a negative top as
 * revealed for belt-and-braces.
 */
export default function RevealScript() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    // Drop the armed state from the previous route first so that, if
    // anything below bails, the new page renders fully visible.
    root.classList.remove('reveal-ready');

    try {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!('IntersectionObserver' in window)) return;
      const els = document.querySelectorAll('.section');
      if (!els.length) return;

      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
              entry.target.classList.add('in-view');
              io.unobserve(entry.target);
            }
          }
        },
        { rootMargin: '100000px 0px -10% 0px' },
      );

      for (const el of els) {
        if (el.getBoundingClientRect().top < innerHeight * 0.9) {
          el.classList.add('in-view');
        } else {
          io.observe(el);
        }
      }

      root.classList.add('reveal-ready');
      return () => {
        io.disconnect();
        root.classList.remove('reveal-ready');
      };
    } catch {
      // Leave the page visible.
    }
  }, [pathname]);

  return null;
}
