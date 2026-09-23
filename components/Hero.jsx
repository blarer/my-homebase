'use client';

import { useEffect, useRef, useState } from 'react';
import '@/app/components.css';

/**
 * The hero is the benchmark table from storage-manager-swift, run as a race.
 *
 * Each bar advances in real time, scaled so the slowest run (du -sk, 22.7s)
 * takes 2.4 seconds of wall clock. The point lands before you finish reading
 * the headline: the same work, three ways, and the gap is the whole argument.
 */
const RUNS = [
  { label: 'du -sk', seconds: 22.7, note: 'one lstat per file' },
  { label: 'parallel read_dir + lstat', seconds: 3.5, note: 'threads, same syscall' },
  { label: 'storage-manager', seconds: 2.2, note: 'getattrlistbulk, batched', mine: true },
];

const SLOWEST = Math.max(...RUNS.map((run) => run.seconds));
const RACE_MS = 2400;

export default function Hero() {
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const frame = useRef(0);

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      setElapsed(SLOWEST);
      setDone(true);
      return;
    }

    let start = null;
    const tick = (now) => {
      if (start === null) start = now;
      const progress = Math.min((now - start) / RACE_MS, 1);
      setElapsed(progress * SLOWEST);
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, []);

  return (
    <section className="hero">
      <div className="shell hero-inner">
        <header className="hero-head">
          <h1 className="display hero-name">Blare</h1>
          <p className="hero-thesis">
            I build native tools and measure what they cost. Below: the same
            296&nbsp;GB scan, 956k files, three implementations.
          </p>
        </header>

        <div className="race" aria-label="Disk scan benchmark, seconds to completion">
          {/* Without JavaScript the rAF loop never advances the inline
              styles, so this stylesheet draws the finished race instead:
              full bars, real times, needles resting at the finish. The
              caption's own no-JS timer lives in components.css. */}
          <noscript>
            <style>{`
              .lane-fill { width: var(--final) !important; }
              .lane-head { left: var(--final) !important; opacity: 0.28; }
              .lane-time-live { display: none; }
              .lane-time::after { content: attr(data-final); }
              .lane-time { color: var(--ink); }
              .lane-mine .lane-time { color: var(--accent); font-weight: 600; }
            `}</style>
          </noscript>
          {RUNS.map((run) => {
            // Bars share one time axis: a lane's final length is its share of
            // the slowest run. If every bar filled its own track, the gap the
            // chart exists to show would disappear at the finish.
            const reached = Math.min(elapsed, run.seconds);
            const width = (reached / SLOWEST) * 100;
            const finished = elapsed >= run.seconds;
            // The lane's final geometry, exposed to CSS so a <noscript>
            // stylesheet can draw the finished race when the rAF loop that
            // normally drives these inline styles never runs.
            const finalWidth = (run.seconds / SLOWEST) * 100;

            return (
              <div className={`lane${run.mine ? ' lane-mine' : ''}`} key={run.label}>
                <div className="lane-label">
                  <span className="lane-name">{run.label}</span>
                  <span className="lane-note">{run.note}</span>
                </div>

                <div className="lane-track">
                  <div
                    className="lane-fill"
                    style={{ width: `${width}%`, '--final': `${finalWidth}%` }}
                  />
                  <div
                    className="lane-head"
                    style={{ left: `${width}%`, '--final': `${finalWidth}%` }}
                    data-finished={finished || undefined}
                  />
                </div>

                <div
                  className="num lane-time"
                  data-finished={finished || undefined}
                  data-final={`${run.seconds.toFixed(1)}s`}
                >
                  <span className="lane-time-live">{reached.toFixed(1)}s</span>
                </div>
              </div>
            );
          })}

          <p className="race-caption" data-done={done || undefined}>
            <span aria-hidden="true">└─ </span>
            10.3&times; faster than <span className="num">du</span>, because batching
            directory attributes beats one syscall per file. Full method in the repo.
          </p>
        </div>
      </div>
    </section>
  );
}
