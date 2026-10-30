'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BLOCKS, PART, repoUrl } from '@/lib/datasheet';
import { Caption } from '@/components/ui/Section';

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

export default function BlockDiagram() {
  const [active, setActive] = useState(null);
  const bind = (id) => ({
    onMouseEnter: () => setActive(id),
    onMouseLeave: () => setActive(null),
    onFocus: () => setActive(id),
    onBlur: () => setActive(null),
  });

  return (
    <div className="fbd" data-active={active ?? undefined}>
      <figure className="ds-figure fbd-figure">
        <svg
          className="fbd-svg"
          viewBox={`0 0 ${W} ${DIE.y + DIE.h + 24}`}
          role="group"
          aria-label={`Functional block diagram of ${PART}: six blocks, one per public project, each linked to its measurement or source.`}
        >
          <rect className="fbd-die" x={DIE.x} y={DIE.y} width={DIE.w} height={DIE.h} />
          <text className="fbd-die-label" x={DIE.x + 10} y={DIE.y + 16}>
            {PART}
          </text>
          <text className="fbd-die-label fbd-die-label-r" x={DIE.x + DIE.w - 10} y={DIE.y + 16}>
            LAYER BELOW
          </text>

          {BLOCKS.map((b, i) => {
            const y = TOP + i * ROW;
            const mid = y + BLOCK.h / 2;
            const on = active === b.id;
            return (
              <a
                key={b.id}
                href={href(b)}
                className="fbd-block"
                data-block={b.id}
                data-on={on || undefined}
                aria-label={`${b.name}, ${b.repo}: ${b.layer}${b.measured ? `, ${b.measured}` : ''}`}
                {...bind(b.id)}
              >
                {/* Input: signal name, then a line into the die with a pin. */}
                <text className="fbd-sig" x={DIE.x - 14} y={mid + 4} textAnchor="end">
                  {b.input}
                </text>
                <line className="fbd-wire" x1={DIE.x - 8} y1={mid} x2={BLOCK.x} y2={mid} />
                <rect className="fbd-pin" x={DIE.x - 4} y={mid - 4} width="8" height="8" />
                <path className="fbd-arrow" d={`M${BLOCK.x - 7} ${mid - 4} L${BLOCK.x} ${mid} L${BLOCK.x - 7} ${mid + 4}Z`} />

                <rect className="fbd-box" x={BLOCK.x} y={y} width={BLOCK.w} height={BLOCK.h} />
                <text className="fbd-name" x={BLOCK.x + 12} y={mid + 5}>
                  {b.name}
                </text>
                <text className="fbd-layer" x={BLOCK.x + 72} y={mid + 4}>
                  {b.layer}
                </text>
                {b.measured && (
                  <text className="fbd-measured" x={BLOCK.x + BLOCK.w - 10} y={mid + 4} textAnchor="end">
                    {b.measured}
                  </text>
                )}

                <line className="fbd-wire" x1={BLOCK.x + BLOCK.w} y1={mid} x2={DIE.x + DIE.w + 8} y2={mid} />
                <rect className="fbd-pin" x={DIE.x + DIE.w - 4} y={mid - 4} width="8" height="8" />
                <text className="fbd-sig" x={DIE.x + DIE.w + 14} y={mid + 4}>
                  {b.output}
                </text>
              </a>
            );
          })}
        </svg>
        <figcaption>
          <Caption n={1} as="span">
            Functional block diagram. One block per public project, named for
            the layer where the fix lived. Point at a block to find it in
            Table 1.
          </Caption>
        </figcaption>
      </figure>

      <div className="ds-table-wrap">
        <table className="ds-table fbd-table">
          <caption>
            <Caption kind="Table" n={1} as="span">
              Block summary
            </Caption>
          </caption>
          <thead>
            <tr>
              <th scope="col">Block</th>
              <th scope="col">Repository</th>
              <th scope="col">Mechanism</th>
              <th scope="col" className="ds-num">Result</th>
            </tr>
          </thead>
          <tbody>
            {BLOCKS.map((b) => (
              <tr key={b.id} data-block={b.id} data-on={active === b.id || undefined} {...bind(b.id)}>
                <th scope="row" className="num">
                  {b.name}
                </th>
                <td>
                  <a href={repoUrl(b.repo)} className="num">
                    {b.repo}
                  </a>
                </td>
                <td>{b.mechanism}</td>
                <td className="ds-num">
                  {b.measured ? (
                    <Link href={href(b)} className="ds-measured">
                      {b.measured}
                    </Link>
                  ) : (
                    <span className="ds-dash" aria-label="not measured">
                      —
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
