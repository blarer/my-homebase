'use client';

import { useEffect, useRef, useState } from 'react';
import { Caption } from '@/components/ui/Section';
import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Card } from '@astryxdesign/core/Card';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { Code } from '@astryxdesign/core/Code';
import { Link } from '@astryxdesign/core/Link';
import { List, ListItem } from '@astryxdesign/core/List';

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
    <VStack gap={3} as="article" id={id} ref={ref} data-armed={armed || undefined}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Heading level={3}>
          <Text type="inherit" color="secondary">7.{n}</Text> {title}
        </Heading>
        <Badge variant="info" label={headline} />
      </HStack>
      <Text as="p" color="secondary" textWrap="pretty">{lede}</Text>
      <Card padding={2}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`${title}: ${runs.map((r) => `${r.label} ${format(r.value)}`).join(', ')}.`}>
          {/* Axis grid: one hairline per tick value. */}
          {ticks.map((t) => (
            <g key={t}>
              <line style={S.grid} x1={x(t)} x2={x(t)} y1={TOPPAD - 8} y2={H - 26} />
              <text style={S.tick} x={x(t)} y={H - 10} textAnchor="middle">
                {t}
              </text>
            </g>
          ))}
          <text style={S.tick} x={W - 4} y={TOPPAD - 14} textAnchor="end">
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
              <g key={run.label} data-lane={i}>
                <text style={run.mine ? S.labelMine : S.label} x={LEFT - 18} y={base - 4} textAnchor="end">
                  {run.label}
                </text>
                <path style={run.mine ? S.traceMine : S.trace} d={d} />
                {fell && (
                  <text style={run.mine ? S.valueMine : S.value} x={Math.min(x(run.value) + 6, W - RIGHT + 6)} y={high + 2}>
                    {format(run.value)}
                  </text>
                )}
              </g>
            );
          })}

          {!done && <line style={S.cursor} x1={x(cursor)} x2={x(cursor)} y1={TOPPAD - 10} y2={H - 26} />}
        </svg>
      </Card>
      <Caption n={n + 2}>
        <Code size="inherit" color="inherit">{repoName}</Code>. {caption}{' '}
        {repo && <Link href={repo} type="inherit">Full method in the repo.</Link>}
      </Caption>
      <List density="compact">
        {runs.map((run) => (
          <ListItem
            key={run.label}
            label={<Text type="label" color={run.mine ? 'accent' : 'primary'}>{run.label}</Text>}
            description={run.note}
            layout="inline"
          />
        ))}
      </List>
    </VStack>
  );
}

// SVG presentation from theme tokens only: the plot is drawn, not laid out.
const mono = { fontFamily: 'var(--font-family-code)', fontSize: 'var(--text-supporting-size)' };
const S = {
  grid: { stroke: 'var(--color-border)', strokeWidth: 1 },
  tick: { ...mono, fill: 'var(--color-text-secondary)' },
  label: { ...mono, fill: 'var(--color-text-primary)' },
  labelMine: { ...mono, fill: 'var(--color-text-accent)', fontWeight: 'var(--font-weight-semibold)' },
  trace: { fill: 'none', stroke: 'var(--color-text-secondary)', strokeWidth: 1.5 },
  traceMine: { fill: 'none', stroke: 'var(--color-accent)', strokeWidth: 2.5 },
  value: { ...mono, fill: 'var(--color-text-primary)' },
  valueMine: { ...mono, fill: 'var(--color-text-accent)', fontWeight: 'var(--font-weight-semibold)' },
  cursor: { stroke: 'var(--color-accent)', strokeWidth: 1 },
};
