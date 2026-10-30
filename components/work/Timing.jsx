'use client';

import { useEffect, useRef, useState } from 'react';
import { Caption } from '@/components/ui/Section';

/**
 * A benchmark drawn as a timing diagram.
 *
 * Each run is a BUSY signal: it rises at t = 0 and falls when that run
 * finishes, all on one shared time (or size) axis, so the gap between the
 * falling edges is the measurement. The figure is captured like a logic
 * analyser: a cursor sweeps the axis in whole steps (TICKS steps of one
 * --tick each) and each trace is drawn up to the cursor. Once the sweep
 * ends the falling edges are marked and the values printed.
 *
 * Without JavaScript, or with reduced motion, the capture is already
 * complete: the server renders the final frame, and the sweep only starts
 * after hydration when the figure scrolls into view.
 *
 * For size measurements (MB) the axis is size rather than time, and the
 * "signal" is the run's extent on that axis; the caption says so.
 */
const TICKS = 24;
const TICK_MS = 100;
const W = 640;
const LEFT = 204;
const RIGHT = 78;
const LANE = 34;
const TOPPAD = 34;

const FORMAT = {
  seconds: (v) => `${v.toFixed(1)} s`,
  millis: (v) => `${Math.round(v)} ms`,
  megabytes: (v) => `${v >= 100 ? Math.round(v) : v.toFixed(1)} MB`,
};

export default function Timing({ id, n, repoName, title, lede, unit, kind, ticks, runs, caption, headline, repo }) {
  const format = FORMAT[kind] ?? String;
  const slowest = Math.max(...runs.map((r) => r.value));
  const axisMax = Math.max(slowest, ticks[ticks.length - 1]);
  const plotW = W - LEFT - RIGHT;
  const x = (v) => LEFT + (v / axisMax) * plotW;
  const H = TOPPAD + runs.length * LANE + 30;

  // Server render and no-JS: the finished capture.
  const [step, setStep] = useState(TICKS);
  const [armed, setArmed] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;
    // Only sweep a figure that is not already on screen at load, so the
    // first paint never flashes from complete to empty.
    if (node.getBoundingClientRect().top < window.innerHeight * 0.85) return;
    setStep(0);
    setArmed(true);
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        timer = window.setInterval(() => {
          setStep((s) => {
            if (s + 1 >= TICKS) window.clearInterval(timer);
            return Math.min(s + 1, TICKS);
          });
        }, TICK_MS);
      },
      { rootMargin: '0px 0px -20% 0px' },
    );
    io.observe(node);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  const cursor = (step / TICKS) * axisMax;
  const done = step >= TICKS;

  return (
    <article id={id} className="timing" data-done={done || undefined} data-armed={armed || undefined} ref={ref}>
      <h3 className="ds-h3">
        <span className="num">7.{n}</span> {title}
        <span className="timing-headline num">{headline}</span>
      </h3>
      <p className="timing-lede">{lede}</p>
      <figure className="ds-figure">
        <svg className="timing-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}: ${runs.map((r) => `${r.label} ${format(r.value)}`).join(', ')}.`}>
          {/* Axis grid: one hairline per tick value. */}
          {ticks.map((t) => (
            <g key={t}>
              <line className="timing-grid" x1={x(t)} x2={x(t)} y1={TOPPAD - 8} y2={H - 26} />
              <text className="timing-tick" x={x(t)} y={H - 10} textAnchor="middle">
                {t}
              </text>
            </g>
          ))}
          <text className="timing-unit" x={W - 4} y={TOPPAD - 14} textAnchor="end">
            {unit}
          </text>

          {runs.map((run, i) => {
            const base = TOPPAD + i * LANE + LANE - 8;
            const high = base - 16;
            const reached = Math.min(cursor, run.value);
            const fell = cursor >= run.value;
            // Low before t=0, rise at 0, high until the run ends, then low.
            const d = [
              `M${LEFT - 12} ${base}`,
              `H${x(0)}`,
              `V${high}`,
              `H${x(reached)}`,
              fell ? `V${base} H${x(cursor)}` : '',
            ].join(' ');
            return (
              <g key={run.label} className={`timing-lane${run.mine ? ' timing-mine' : ''}`} data-lane={i}>
                <text className="timing-label" x={LEFT - 18} y={base - 4} textAnchor="end">
                  {run.label}
                </text>
                <path className="timing-trace" d={d} />
                {fell && (
                  <text className="timing-value" x={Math.min(x(run.value) + 6, W - RIGHT + 6)} y={high + 2}>
                    {format(run.value)}
                  </text>
                )}
              </g>
            );
          })}

          {!done && <line className="timing-cursor" x1={x(cursor)} x2={x(cursor)} y1={TOPPAD - 10} y2={H - 26} />}
        </svg>
        <figcaption>
          <Caption n={n + 2} as="span">
            <span className="num">{repoName}</span>. {caption}{' '}
            {repo && <a href={repo}>Full method in the repo.</a>}
          </Caption>
        </figcaption>
      </figure>
      <ul className="timing-notes">
        {runs.map((run) => (
          <li key={run.label} className={run.mine ? 'timing-mine' : undefined}>
            <span className="timing-notes-label">{run.label}</span> {run.note}
          </li>
        ))}
      </ul>
    </article>
  );
}
