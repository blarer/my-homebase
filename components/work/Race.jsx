'use client';

import { useEffect, useRef, useState } from 'react';
import { figureLabel } from '@/lib/figures';

/**
 * A measured comparison drawn as a race, folded under a disclosure.
 *
 * Each bar advances in real time on a shared axis, scaled so the slowest run
 * takes RACE_MS of wall clock. The point lands before you finish reading the
 * title: the same work, several ways, and the gap is the argument.
 *
 * The figure is a native <details>: the summary is the figure head, the
 * body is the race. It opens without JavaScript; the race itself waits for
 * the open event and then RACE_DELAY_MS more, so the lanes settle in before
 * the needles move. Keep that constant in step with the --load-* tokens in
 * motion.css.
 *
 * Props:
 *   id        anchor and details id
 *   n         figure number; repoName names it ("Fig. 1 — mp4trim")
 *   title     "The same scan, three ways"
 *   lede      one sentence of context
 *   unit      axis label, e.g. "t / seconds"
 *   kind      which formatter: 'seconds' | 'millis' | 'megabytes'
 *   ticks     axis tick values in `unit`
 *   runs      [{ label, value, note, mine? }], lower is better
 *   caption   JSX under the race
 *   repo      href for "Full method in the repo"
 */
const RACE_MS = 2400;
const RACE_DELAY_MS = 1400;

// Formatters live here, not in props: a function cannot cross the server
// to client boundary, and the figures are declared in a server component.
const FORMAT = {
  seconds: (v) => `${v.toFixed(1)}s`,
  millis: (v) => `${Math.round(v)}ms`,
  megabytes: (v) => `${v >= 100 ? Math.round(v) : v.toFixed(1)} MB`,
};

export default function Race({ id, n, repoName, title, lede, unit, kind, ticks, runs, caption, headline, repo }) {
  const figure = figureLabel(n, repoName);
  const format = FORMAT[kind] ?? String;
  const slowest = Math.max(...runs.map((run) => run.value));
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState(false);
  const frame = useRef(0);
  const details = useRef(null);

  // A link to #clip (from the list of figures, or pasted from elsewhere)
  // should land on an open figure, not a closed one with the race hidden.
  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === `#${id}` && details.current && !details.current.open) {
        details.current.open = true;
      }
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, [id]);

  // The race only runs once the disclosure is opened: a reader who never
  // opens it never pays for the rAF loop, and one who does sees the race
  // from the start.
  useEffect(() => {
    if (!open) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      setElapsed(slowest);
      setDone(true);
      return;
    }

    let start = null;
    const tick = (now) => {
      if (start === null) start = now;
      const progress = Math.min((now - start) / RACE_MS, 1);
      setElapsed(progress * slowest);
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
  }, [open, slowest]);

  return (
    <details
      ref={details}
      id={id}
      className="section benchmark"
      data-running-head={figure}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="shell benchmark-summary">
        <span className="section-head benchmark-head">
          <span className="benchmark-title">
            {title}
            <span className="benchmark-chevron" aria-hidden="true" />
          </span>
          <span className="tag">{figure}</span>
          <span className="benchmark-hint">
            <span className="benchmark-hint-result num">{headline}</span>
            <span className="benchmark-hint-action" aria-hidden="true">
              <span className="benchmark-hint-closed">Run the figure</span>
              <span className="benchmark-hint-open">Fold it away</span>
            </span>
          </span>
        </span>
      </summary>

      <div className="shell benchmark-body">
        <p className="section-lede">{lede}</p>

        <div className="race" aria-label={`${title}, ${unit}`}>
          {/* The axis the lanes are plotted against. Decorative for screen
              readers; the lanes carry the numbers. */}
          <div className="race-axis" aria-hidden="true">
            <span className="race-axis-label tag">{unit}</span>
            <span className="race-axis-track">
              {ticks.map((t) => (
                <span
                  key={t}
                  className="num race-axis-tick"
                  style={{ left: `${(t / slowest) * 100}%` }}
                >
                  {t}
                </span>
              ))}
            </span>
            <span />
          </div>
          {/* Without JavaScript the rAF loop never advances the inline
              styles, so this stylesheet draws the finished race instead:
              full bars, real values, needles resting at the finish. The
              caption's own no-JS timer lives in race.css. */}
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
          {runs.map((run, index) => {
            // Bars share one axis: a lane's final length is its share of the
            // slowest run. If every bar filled its own track, the gap the
            // chart exists to show would disappear at the finish.
            const reached = Math.min(elapsed, run.value);
            const width = (reached / slowest) * 100;
            const finished = elapsed >= run.value;
            // The lane's final geometry, exposed to CSS so a <noscript>
            // stylesheet can draw the finished race when the rAF loop that
            // normally drives these inline styles never runs.
            const finalWidth = (run.value / slowest) * 100;

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
                  data-final={format(run.value)}
                >
                  <span className="lane-time-live">{format(reached)}</span>
                </div>
              </div>
            );
          })}

          <p className="race-caption" data-done={done || undefined}>
            <span aria-hidden="true">└─ </span>
            {caption}
            {repo && (
              <>
                {' '}
                <a href={repo}>Full method in the repo.</a>
              </>
            )}
          </p>
        </div>
      </div>
    </details>
  );
}
