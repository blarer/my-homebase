// Randomized property test for the squarified treemap.
// Run: node scripts/test-treemap.mjs
import { squarify } from '../lib/treemap.js';

const RECT = { x: 0, y: 0, width: 900, height: 520 };
const EPS = 1e-6;
let failures = 0;

function fail(msg, ctx) {
  failures += 1;
  console.error(`FAIL ${msg}`, JSON.stringify(ctx));
}

function overlaps(a, b) {
  return (
    a.x < b.x + b.width - EPS &&
    b.x < a.x + a.width - EPS &&
    a.y < b.y + b.height - EPS &&
    b.y < a.y + a.height - EPS
  );
}

function check(items, rect, label) {
  const tiles = squarify(items, rect);
  const expected = items.filter((i) => i.value > 0);

  if (tiles.length !== expected.length) {
    fail(`${label}: tile count`, { got: tiles.length, want: expected.length });
    return;
  }
  if (expected.length === 0) return;

  // Order preserved: caller relies on tiles[i] matching items[i].
  expected.forEach((item, i) => {
    if (tiles[i].key !== item.key) fail(`${label}: order`, { i, got: tiles[i].key });
  });

  const totalValue = expected.reduce((s, i) => s + i.value, 0);
  const rectArea = rect.width * rect.height;
  let covered = 0;

  for (const tile of tiles) {
    covered += tile.width * tile.height;

    if (tile.width < -EPS || tile.height < -EPS) {
      fail(`${label}: negative size`, tile);
    }
    if (
      tile.x < rect.x - EPS ||
      tile.y < rect.y - EPS ||
      tile.x + tile.width > rect.x + rect.width + EPS ||
      tile.y + tile.height > rect.y + rect.height + EPS
    ) {
      fail(`${label}: out of bounds`, tile);
    }

    // Area must be proportional to value.
    const want = (tile.value / totalValue) * rectArea;
    const got = tile.width * tile.height;
    if (Math.abs(got - want) > Math.max(1e-4, want * 1e-6)) {
      fail(`${label}: area not proportional`, { key: tile.key, got, want });
    }
  }

  if (Math.abs(covered - rectArea) > 1e-3) {
    fail(`${label}: coverage`, { covered, rectArea });
  }

  for (let i = 0; i < tiles.length; i += 1) {
    for (let j = i + 1; j < tiles.length; j += 1) {
      if (overlaps(tiles[i], tiles[j])) {
        fail(`${label}: overlap`, { a: tiles[i].key, b: tiles[j].key });
      }
    }
  }
}

// Edge cases
check([], RECT, 'empty');
check([{ key: 'a', value: 5 }], RECT, 'single');
check([{ key: 'a', value: 1 }, { key: 'b', value: 0 }], RECT, 'zero value dropped');
check([{ key: 'a', value: 1 }, { key: 'b', value: 1 }], RECT, 'equal pair');
check(
  [{ key: 'huge', value: 1e9 }, { key: 'tiny', value: 1 }],
  RECT,
  'extreme ratio',
);
check(
  Array.from({ length: 40 }, (_, i) => ({ key: `r${i}`, value: 1 })),
  RECT,
  'many equal',
);
check([{ key: 'a', value: 3 }, { key: 'b', value: 2 }], { x: 0, y: 0, width: 10, height: 900 }, 'tall rect');

// Randomized runs
let seed = 42;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

for (let run = 0; run < 300; run += 1) {
  const n = 1 + Math.floor(rand() * 25);
  const items = Array.from({ length: n }, (_, i) => ({
    key: `k${i}`,
    value: Math.floor(rand() * 100000) + 1,
  }));
  const rect = {
    x: 0,
    y: 0,
    width: 40 + rand() * 1400,
    height: 40 + rand() * 900,
  };
  check(items, rect, `random#${run}`);
}

// Aspect ratio quality: squarified layout should beat naive slice-and-dice.
const repoLike = [
  { key: 'nix', value: 52645 },
  { key: 'storage', value: 43124 },
  { key: 'homebase', value: 40073 },
  { key: 'mp4trim', value: 34551 },
];
const tiles = squarify(repoLike, RECT);
const worstAspect = Math.max(
  ...tiles.map((t) => Math.max(t.width / t.height, t.height / t.width)),
);
if (worstAspect > 3) {
  fail('repo-like aspect ratio too extreme', { worstAspect });
}

if (failures === 0) {
  console.log(`treemap: all checks passed (worst aspect on real data ${worstAspect.toFixed(2)})`);
} else {
  console.error(`treemap: ${failures} failure(s)`);
  process.exit(1);
}
