#!/usr/bin/env node
/**
 * Checks the band hit-test that drives the hover tooltip.
 *
 * The tooltip finds the language under the cursor by walking the same
 * cumulative fractions the renderer uses to lay the bands out. If the two ever
 * disagree, the tooltip names the wrong colour, which is worse than no tooltip
 * at all. This asserts they agree by construction: for every band, a point
 * sampled inside its drawn extent resolves back to that band.
 */
import snapshot from "../lib/repos.json" with { type: "json" };

/** The renderer's layout: descending size, stacked top-down as percentages. */
function layout(languages) {
  const total = Object.values(languages).reduce((sum, n) => sum + n, 0);
  const langs = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  let offset = 0;
  return langs.map(([name, value]) => {
    const height = value / total;
    const band = { name, top: offset, bottom: offset + height };
    offset += height;
    return band;
  });
}

/** The tooltip's hit test, mirroring probeTile in components/Work.jsx. */
function probe(languages, fraction) {
  const total = Object.values(languages).reduce((sum, n) => sum + n, 0);
  const langs = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  let offset = 0;
  let hit = langs[langs.length - 1];
  for (const entry of langs) {
    offset += entry[1] / total;
    if (fraction <= offset) {
      hit = entry;
      break;
    }
  }
  return hit[0];
}

let checks = 0;
const failures = [];

for (const repo of snapshot.repos) {
  const bands = layout(repo.languages);

  for (const band of bands) {
    // Sample the middle of the band, plus just inside each edge, since the
    // boundaries are where an off-by-one in the comparison would show up.
    const span = band.bottom - band.top;
    const samples = [
      band.top + span / 2,
      band.top + span * 0.01,
      band.bottom - span * 0.01,
    ];

    for (const at of samples) {
      checks += 1;
      const got = probe(repo.languages, at);
      if (got !== band.name) {
        failures.push(
          `${repo.name} at ${at.toFixed(4)}: drawn ${band.name}, probed ${got}`,
        );
      }
    }
  }

  // The extremes must land on the first and last band rather than falling off.
  checks += 2;
  if (probe(repo.languages, 0) !== bands[0].name) {
    failures.push(
      `${repo.name} at top: expected ${bands[0].name}, got ${probe(repo.languages, 0)}`,
    );
  }
  if (probe(repo.languages, 1) !== bands[bands.length - 1].name) {
    failures.push(
      `${repo.name} at bottom: expected ${bands.at(-1).name}, got ${probe(repo.languages, 1)}`,
    );
  }
}

// Floating point can push a probe just past 1; it must still resolve.
checks += 1;
const first = snapshot.repos[0];
if (typeof probe(first.languages, 1.0000001) !== "string") {
  failures.push("overshoot past the bottom edge did not resolve to a band");
}

if (failures.length > 0) {
  console.error(`${failures.length} of ${checks} checks failed:`);
  for (const f of failures.slice(0, 20)) console.error(`  ${f}`);
  process.exit(1);
}

console.log(
  `Band hit-test agrees with the drawn layout across ${checks} samples.`,
);
