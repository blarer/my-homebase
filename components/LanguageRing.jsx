"use client";

import { useMemo, useState } from "react";
import { languageColor } from "@/lib/languageColors";

/**
 * Every language across every repository, public and private, as one ring.
 *
 * The ranked bars below answer "how much of each"; this answers "what is the
 * shape of the whole", which a list of eighteen rows cannot show at a glance.
 * It is a donut rather than a pie because the hole carries the total, and
 * because comparing arc lengths on a common radius is easier than comparing
 * wedge angles through a centre.
 *
 * Hovering a segment reads it out in the middle rather than in a tooltip, so
 * the number appears in one predictable place instead of chasing the cursor.
 */

const SIZE = 260;
const STROKE = 34;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function bytes(total) {
  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(2)} MB`;
  if (total >= 1_000) return `${Math.round(total / 1_000)} KB`;
  return `${total} B`;
}

export default function LanguageRing({ repos }) {
  const [active, setActive] = useState(null);

  const { segments, total } = useMemo(() => {
    const totals = new Map();
    for (const repo of repos) {
      for (const [name, value] of Object.entries(repo.languages)) {
        totals.set(name, (totals.get(name) ?? 0) + value);
      }
    }

    const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]);
    const grand = ranked.reduce((sum, [, value]) => sum + value, 0);

    // Offsets accumulate so segments meet exactly, with no seam or overlap.
    let offset = 0;
    const segments = ranked.map(([name, value]) => {
      const share = value / grand;
      const segment = { name, value, share, offset };
      offset += share;
      return segment;
    });

    return { segments, total: grand };
  }, [repos]);

  const current = segments.find((s) => s.name === active) ?? null;

  return (
    <div className="ring-wrap">
      <svg
        className="ring"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Language distribution across ${repos.length} repositories, ${bytes(total)} of source in total.`}
        onMouseLeave={() => setActive(null)}
      >
        {/* Rotated so the largest language starts at twelve o'clock, which is
            where the eye begins reading a dial. */}
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          {segments.map((segment) => (
            <circle
              key={segment.name}
              className="ring-seg"
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={languageColor(segment.name)}
              strokeWidth={STROKE}
              // A dash as long as the share, then a gap covering the rest of
              // the ring, offset to this segment's start.
              strokeDasharray={`${segment.share * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={-segment.offset * CIRCUMFERENCE}
              data-active={active === segment.name || undefined}
              data-dimmed={(active && active !== segment.name) || undefined}
              onMouseEnter={() => setActive(segment.name)}
            />
          ))}
        </g>
      </svg>

      <div className="ring-centre" aria-live="polite">
        {current ? (
          <>
            <span className="num ring-pct">
              {(current.share * 100).toFixed(1)}%
            </span>
            <span className="ring-name">
              <span
                className="swatch"
                style={{ background: languageColor(current.name) }}
                aria-hidden="true"
              />
              {current.name}
            </span>
            <span className="num ring-bytes">{bytes(current.value)}</span>
          </>
        ) : (
          <>
            <span className="num ring-pct">{bytes(total)}</span>
            <span className="ring-name">
              across {segments.length} languages
            </span>
            <span className="num ring-bytes">{repos.length} repositories</span>
          </>
        )}
      </div>
    </div>
  );
}
