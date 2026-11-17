'use client';

import { useEffect, useState } from 'react';
import { VStack, HStack, StackItem } from '@astryxdesign/core/Stack';
import { Card } from '@astryxdesign/core/Card';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { Link } from '@astryxdesign/core/Link';
import { figureLabel } from '@/lib/figures';

/**
 * A measured comparison drawn as a race, folded under a Collapsible.
 *
 * Each lane is a ProgressBar on a shared axis (max = the slowest run), and
 * advances in real time so the slowest run takes RACE_MS of wall clock. The
 * values are server-rendered at their finish, so the figure reads with
 * JavaScript off; the race replays from zero only once it is opened.
 *
 * The lane marked `mine` is drawn in the accent colour, which on this site
 * means "measured, and the one I built".
 */
const RACE_MS = 2400;

// Formatters live here, not in props: a function cannot cross the server
// to client boundary, and the figures are declared in a server component.
const FORMAT = {
  seconds: (v) => `${v.toFixed(1)}s`,
  millis: (v) => `${Math.round(v)}ms`,
  megabytes: (v) => `${v >= 100 ? Math.round(v) : v.toFixed(1)} MB`,
};

export default function Race({ id, n, repoName, title, lede, unit, kind, runs, caption, headline, repo }) {
  const figure = figureLabel(n, repoName);
  const format = FORMAT[kind] ?? String;
  const slowest = Math.max(...runs.map((run) => run.value));
  const [open, setOpen] = useState(false);
  // null = not started: show the finished race (also the no-JS state).
  const [elapsed, setElapsed] = useState(null);

  // A link to #id should land on an open figure.
  useEffect(() => {
    const fromHash = () => {
      if (window.location.hash === `#${id}`) setOpen(true);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [id]);

  useEffect(() => {
    if (!open) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setElapsed(null);
      return;
    }
    let frame = 0;
    let start = null;
    const tick = (now) => {
      if (start === null) start = now;
      const progress = Math.min((now - start) / RACE_MS, 1);
      setElapsed(progress * slowest);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [open, slowest]);

  return (
    <VStack id={id}>
    <Card padding={4}>
      <Collapsible
        isOpen={open}
        onOpenChange={setOpen}
        trigger={
          <HStack gap={3} vAlign="center" wrap="wrap" width="100%">
            <StackItem size="fill">
              <VStack gap={0.5}>
                <Heading level={3}>{title}</Heading>
                <Text type="supporting">{figure}</Text>
              </VStack>
            </StackItem>
            <Badge variant="info" label={headline} />
          </HStack>
        }
      >
        <VStack gap={4} paddingBlockStart={3}>
          <Text as="p" color="secondary" textWrap="pretty">{lede}</Text>
          <VStack gap={3} aria-label={`${title}, ${unit}`}>
            {runs.map((run) => {
              const reached = elapsed === null ? run.value : Math.min(elapsed, run.value);
              return (
                <VStack gap={1} key={run.label}>
                  <HStack gap={2} hAlign="between" vAlign="end" wrap="wrap">
                    <VStack gap={0}>
                      <Text type="label" weight={run.mine ? 'semibold' : undefined}>{run.label}</Text>
                      <Text type="supporting">{run.note}</Text>
                    </VStack>
                    <Text type="code" color={run.mine ? 'accent' : 'primary'} hasTabularNumbers>
                      {format(reached)}
                    </Text>
                  </HStack>
                  <ProgressBar
                    label={`${run.label}: ${format(run.value)}`}
                    isLabelHidden
                    value={reached}
                    max={slowest}
                    variant={run.mine ? 'accent' : 'neutral'}
                  />
                </VStack>
              );
            })}
            <Text type="supporting">Axis: {unit}, lower is better.</Text>
          </VStack>
          <Text as="p" textWrap="pretty">
            {caption}
            {repo && (
              <>
                {' '}
                <Link href={repo} type="inherit">Full method in the repo.</Link>
              </>
            )}
          </Text>
        </VStack>
      </Collapsible>
    </Card>
    </VStack>
  );
}
