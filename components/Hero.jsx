'use client';

import { useEffect, useState } from 'react';

import '@/app/motion.css';

/**
 * The title page.
 *
 * Two letters, one line about the person, and the Oxford rule. The work
 * used to open the page with a benchmark; it now lives at /work, so the
 * front page can be an introduction rather than an argument.
 *
 * Each letter lights on hover, and which pair of lights you get is a coin
 * flip made once per visit:
 *
 *   elemental  J ice,  L fire
 *   celestial  J void, L solar
 *
 * The flip happens in an effect rather than during render because the
 * server has no way to agree with the client on a random number, and a
 * mismatch would be a hydration error. Until the effect runs the letters
 * are plain ink, which is also their resting state, so nothing flashes.
 *
 * `?hero=elemental` or `?hero=celestial` pins the pair, which is how the
 * screenshot and acceptance scripts get a deterministic page.
 */
const PAIRS = ['elemental', 'celestial'];

export default function Hero() {
  const [pair, setPair] = useState(null);

  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).get('hero');
    setPair(PAIRS.includes(forced) ? forced : PAIRS[Math.random() < 0.5 ? 0 : 1]);
  }, []);

  return (
    <section className="hero">
      <div className="shell hero-inner">
        <header className="hero-head">
          <h1 className="display hero-name" data-pair={pair ?? undefined}>
            <span className="hero-letter hero-letter-j" data-letter="J">
              J
            </span>
            <span className="hero-letter hero-letter-l" data-letter="L">
              L
            </span>
          </h1>
          <p className="hero-thesis">
            Systems programmer. I build the tools I wish I had, then measure
            whether they were worth building.
          </p>
        </header>
      </div>
    </section>
  );
}
