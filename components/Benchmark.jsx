'use client';

import { useEffect, useRef, useState } from 'react';
import '@/app/components.css';
import '@/app/motion.css';

/**
 * The benchmark table from storage-manager-swift, run as a race.
 *
 * Each bar advances in real time, scaled so the slowest run (du -sk, 22.7s)
 * takes 2.4 seconds of wall clock. The point lands before you finish reading
 * the headline: the same work, three ways, and the gap is the whole argument.
 *
 * The figure is a <details> disclosure folded under the /work title: the
 * summary is the figure head, the body is the race. Native <details> means
 * it opens without JavaScript; the race itself waits for the open event and
 * then RACE_DELAY_MS more, so the lanes settle in before the needles move.
 * Keep that constant in step with the --load-* tokens in motion.css.
 */
const RUNS = [
  { label: 'du -sk', seconds: 22.7, note: 'one lstat per file' },
  { label: 'parallel read_dir + lstat', seconds: 3.5, note: 'threads, same syscall' },
  { label: 'storage-manager', seconds: 2.2, note: 'getattrlistbulk, batched', mine: true },
];

const SLOWEST = Math.max(...RUNS.map((run) => run.seconds));
const RACE_MS = 2400;
const RACE_DELAY_MS = 1400;

export default function Benchmark() {
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState(false);
  const frame = useRef(0);

  // The race only runs once the disclosure is opened: the figure is folded
  // under the page title by default, so a reader who never opens it never
  // pays for the rAF loop, and one who does sees the race from the start.
  useEffect(() => {
    if (!open) return;

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

    const timer = setTimeout(() => {
      frame.current = requestAnimationFrame(tick);
    }, RACE_DELAY_MS);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame.current);
    };
  }, [open]);

  return (
    <details
      id="benchmark"
      className="section benchmark"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="shell benchmark-summary">
        <span className="section-head benchmark-head">
          <span className="tag">Fig. 1 — Benchmark</span>
          <span className="benchmark-title">
            The same scan, three ways
            <span className="benchmark-chevron" aria-hidden="true" />
          </span>
          <span className="benchmark-hint">Open the figure</span>
        </span>
      </summary>

      <div className="shell benchmark-body">
        <p className="section-lede">
          296&nbsp;GB, 956k files, one machine. The gap between the lanes is
          the whole argument for building the tool.
        </p>

        <div className="race" aria-label="Disk scan benchmark, seconds to completion">
          {/* The time axis the lanes are plotted against: second ticks in the
              track column, labelled every 5s. Decorative for screen readers;
              the lanes carry the numbers. */}
          <div className="race-axis" aria-hidden="true">
            <span className="race-axis-label tag">t / seconds</span>
            <span className="race-axis-track">
              {[0, 5, 10, 15, 20].map((s) => (
                <span
                  key={s}
                  className="num race-axis-tick"
                  style={{ left: `${(s / SLOWEST) * 100}%` }}
                >
                  {s}
                </span>
              ))}
            </span>
            <span />
          </div>
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
          {RUNS.map((run, index) => {
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
              <div
                className={`lane${run.mine ? ' lane-mine' : ''}`}
                key={run.label}
                data-lane={index}
              >
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
    </details>
  );
}
