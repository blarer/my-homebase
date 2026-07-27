'use client';

import { useEffect, useRef, useState } from 'react';

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
          {RUNS.map((run) => {
            // Bars share one time axis: a lane's final length is its share of
            // the slowest run. If every bar filled its own track, the gap the
            // chart exists to show would disappear at the finish.
            const reached = Math.min(elapsed, run.seconds);
            const width = (reached / SLOWEST) * 100;
            const finished = elapsed >= run.seconds;

            return (
              <div className={`lane${run.mine ? ' lane-mine' : ''}`} key={run.label}>
                <div className="lane-label">
                  <span className="lane-name">{run.label}</span>
                  <span className="lane-note">{run.note}</span>
                </div>

                <div className="lane-track">
                  <div className="lane-fill" style={{ width: `${width}%` }} />
                  <div
                    className="lane-head"
                    style={{ left: `${width}%` }}
                    data-finished={finished || undefined}
                  />
                </div>

                <div className="num lane-time" data-finished={finished || undefined}>
                  {reached.toFixed(1)}s
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
