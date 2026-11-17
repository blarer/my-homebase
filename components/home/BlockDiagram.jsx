'use client';

import { useState } from 'react';
import { BLOCKS, PART, repoUrl } from '@/lib/datasheet';
import { Caption } from '@/components/ui/Section';
import { VStack } from '@astryxdesign/core/Stack';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '@astryxdesign/core/Table';

/**
 * Figure 1, the functional block diagram, and Table 1, its block summary.
 *
 * This is the page's signature interaction: pointing at a block (hover or
 * keyboard focus) selects it, and the selection is shown in three places at
 * once, the block in the diagram, its row in Table 1, and its pins on the
 * die edge, so the drawing and the table read as one instrument. Pointing at
 * a table row selects the block the same way. Nothing is hidden behind the
 * selection: with no JavaScript every block and row is still there, linked.
 *
 * The diagram is drawn in its own 640 x 420 user space. Each block sits on a
 * row: an input signal enters from the left edge of the die, passes through
 * the block (named for the layer where the fix lived), and leaves on the
 * right. Measured blocks carry their result in the manufacturer colour.
 */
const W = 640;
const ROW = 58;
const TOP = 46;
const DIE = { x: 132, y: 22, w: 376, h: TOP + ROW * BLOCKS.length - 6 };
const BLOCK = { x: 176, w: 288, h: 40 };

const href = (b) => (b.figure ? `/work/#${b.figure}` : repoUrl(b.repo));
// A private repository has no name or link on the page, only its label.
const source = (b) => b.repo ?? b.label;

export default function BlockDiagram() {
  const [active, setActive] = useState(null);
  const bind = (id) => ({
    onMouseEnter: () => setActive(id),
    onMouseLeave: () => setActive(null),
    onFocus: () => setActive(id),
    onBlur: () => setActive(null),
  });

  const st = (on) => (active === null ? S.idle : on ? S.on : S.off);

  return (
    <VStack gap={4}>
      <VStack gap={2} as="figure">
        <Card padding={2}>
          <svg
            width="100%"
            viewBox={`0 0 ${W} ${DIE.y + DIE.h + 24}`}
            role="group"
            aria-label={`Functional block diagram of ${PART}: six blocks, one per public project, each linked to its measurement or source.`}
          >
            <rect style={S.die} x={DIE.x} y={DIE.y} width={DIE.w} height={DIE.h} />
            <text style={S.dieLabel} x={DIE.x + 10} y={DIE.y + 16}>
              {PART}
            </text>
            <text style={S.dieLabel} x={DIE.x + DIE.w - 10} y={DIE.y + 16} textAnchor="end">
              LAYER BELOW
            </text>

            {BLOCKS.map((b, i) => {
              const y = TOP + i * ROW;
              const mid = y + BLOCK.h / 2;
              const s = st(active === b.id);
              return (
                <a
                  key={b.id}
                  href={href(b)}
                  data-block={b.id}
                  aria-label={`${b.name}, ${source(b)}: ${b.layer}${b.measured ? `, ${b.measured}` : ''}`}
                  {...bind(b.id)}
                >
                  <text style={S.sig} x={DIE.x - 14} y={mid + 4} textAnchor="end">
                    {b.input}
                  </text>
                  <line style={s.wire} x1={DIE.x - 8} y1={mid} x2={BLOCK.x} y2={mid} />
                  <rect style={s.pin} x={DIE.x - 4} y={mid - 4} width="8" height="8" />
                  <path style={s.pin} d={`M${BLOCK.x - 7} ${mid - 4} L${BLOCK.x} ${mid} L${BLOCK.x - 7} ${mid + 4}Z`} />

                  <rect style={s.box} x={BLOCK.x} y={y} width={BLOCK.w} height={BLOCK.h} rx="4" />
                  <text style={s.name} x={BLOCK.x + 12} y={mid + 5}>
                    {b.name}
                  </text>
                  <text style={S.layer} x={BLOCK.x + 72} y={mid + 4}>
                    {b.layer}
                  </text>
                  {b.measured && (
                    <text style={S.measured} x={BLOCK.x + BLOCK.w - 10} y={mid + 4} textAnchor="end">
                      {b.measured}
                    </text>
                  )}

                  <line style={s.wire} x1={BLOCK.x + BLOCK.w} y1={mid} x2={DIE.x + DIE.w + 8} y2={mid} />
                  <rect style={s.pin} x={DIE.x + DIE.w - 4} y={mid - 4} width="8" height="8" />
                  <text style={S.sig} x={DIE.x + DIE.w + 14} y={mid + 4}>
                    {b.output}
                  </text>
                </a>
              );
            })}
          </svg>
        </Card>
        <Caption n={1}>
          Functional block diagram. One block per public project, named for the
          layer where the fix lived. Point at a block to find it in Table 1.
        </Caption>
      </VStack>

      <VStack gap={2}>
        <Caption kind="Table" n={1}>Block summary</Caption>
        <Card padding={0}>
          <Table density="compact" dividers="rows">
            <TableHeader>
              <TableRow isHeaderRow>
                <TableHeaderCell scope="col">Block</TableHeaderCell>
                <TableHeaderCell scope="col">Repository</TableHeaderCell>
                <TableHeaderCell scope="col">Mechanism</TableHeaderCell>
                <TableHeaderCell scope="col">Result</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {BLOCKS.map((b) => {
                const on = active === b.id;
                return (
                  <TableRow key={b.id} data-block={b.id} aria-selected={on || undefined} style={on ? S.rowOn : undefined} {...bind(b.id)}>
                    <TableHeaderCell scope="row">
                      <Text type="code" color={on ? 'accent' : 'primary'} weight="semibold">{b.name}</Text>
                    </TableHeaderCell>
                    <TableCell>
                      {b.repo ? (
                        <Link href={repoUrl(b.repo)} type="code">{b.repo}</Link>
                      ) : (
                        <Text type="supporting" color="secondary">{b.label}</Text>
                      )}
                    </TableCell>
                    <TableCell><Text type="supporting">{b.mechanism}</Text></TableCell>
                    <TableCell>
                      {b.measured ? (
                        <Link href={href(b)} type="code">{b.measured}</Link>
                      ) : (
                        <Text type="code" color="secondary" aria-label="not measured">—</Text>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </VStack>
    </VStack>
  );
}

// SVG presentation from theme tokens only. Three states: nothing selected,
// the selected block (accent, heavier), the others (receded).
const code = { fontFamily: 'var(--font-family-code)', fontSize: 'var(--text-supporting-size)' };
const look = (stroke, width, fill, nameFill) => ({
  wire: { stroke, strokeWidth: width },
  pin: { fill: stroke },
  box: { fill, stroke, strokeWidth: width },
  name: { ...code, fontSize: 'var(--text-body-size)', fontWeight: 'var(--font-weight-semibold)', fill: nameFill },
});
const S = {
  die: { fill: 'var(--color-background-muted)', stroke: 'var(--color-text-primary)', strokeWidth: 1.5 },
  dieLabel: { ...code, fill: 'var(--color-text-secondary)' },
  sig: { ...code, fill: 'var(--color-text-secondary)' },
  layer: { fontFamily: 'var(--font-family-body)', fontSize: 'var(--text-supporting-size)', fill: 'var(--color-text-secondary)' },
  measured: { ...code, fill: 'var(--color-text-accent)', fontWeight: 'var(--font-weight-semibold)' },
  idle: look('var(--color-text-primary)', 1, 'var(--color-background-card)', 'var(--color-text-primary)'),
  on: look('var(--color-accent)', 2, 'var(--color-accent-muted)', 'var(--color-text-accent)'),
  off: look('var(--color-border)', 1, 'var(--color-background-card)', 'var(--color-text-secondary)'),
  rowOn: { background: 'var(--color-accent-muted)' },
};
