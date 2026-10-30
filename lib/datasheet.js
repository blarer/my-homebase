/**
 * The datasheet's fixed content, as data.
 *
 * Everything here is either quoted from the About copy, taken from a
 * repository README via lib/figures.js, or computed from lib/repos.json.
 * Nothing is estimated. Section numbers run across both routes: the front
 * page is sections 1 to 5, /work continues at 6, the way a printed
 * datasheet continues over pages.
 */
import { FIGURES } from '@/lib/figures';
import snapshot from '@/lib/repos.json';

export const PART = 'BLARE-1';
export const DOC = 'LOUDS-DS-001';
export const TITLE = 'Systems-Software Engineer, Measured One Layer Below';

const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);

/** Totals computed from the committed snapshot. */
export function totals(repos = snapshot.repos) {
  const languages = new Map();
  for (const repo of repos) {
    for (const [name, value] of Object.entries(repo.languages)) {
      languages.set(name, (languages.get(name) ?? 0) + value);
    }
  }
  const sizes = repos.map((r) => sum(r.languages)).sort((a, b) => a - b);
  const mid = Math.floor(sizes.length / 2);
  const median = sizes.length % 2 ? sizes[mid] : (sizes[mid - 1] + sizes[mid]) / 2;
  return {
    repos: repos.length,
    publicRepos: repos.filter((r) => !r.private).length,
    privateRepos: repos.filter((r) => r.private).length,
    bytes: sizes.reduce((a, b) => a + b, 0),
    languages: languages.size,
    min: sizes[0] ?? 0,
    median,
    max: sizes[sizes.length - 1] ?? 0,
  };
}

const fig = (id) => FIGURES.find((f) => f.id === id);

/**
 * The functional blocks of the part: one per public project, with the
 * layer the fix lived in. `figure` links a block to its measurement on
 * /work; blocks without a measurement link to the repository only.
 * Coordinates are in the block diagram's own 640 x 400 viewBox.
 */
export const BLOCKS = [
  {
    id: 'scan',
    name: 'SCAN',
    repo: 'storage-manager-swift',
    input: 'Filesystem',
    output: 'Treemap',
    layer: 'Syscall',
    mechanism: 'getattrlistbulk(2), batched directory attributes',
    measured: fig('benchmark').headline,
    figure: 'benchmark',
  },
  {
    id: 'dict',
    name: 'DICT',
    repo: 'outloud',
    input: 'Microphone',
    output: 'Text field',
    layer: 'Transport',
    mechanism: 'Accessibility write into the focused field',
    measured: fig('dictation').headline,
    figure: 'dictation',
  },
  {
    id: 'pwr',
    name: 'PWR',
    repo: 'wattsbar',
    input: 'SMC sensors',
    output: 'Menu bar W',
    layer: 'Direct sensor read',
    mechanism: 'IOKit, read once a second instead of polling the gauge',
    measured: fig('footprint').headline,
    figure: 'footprint',
  },
  {
    id: 'trim',
    name: 'TRIM',
    repo: 'mp4trim',
    input: 'MP4 source',
    output: 'Clip ≤ limit',
    layer: 'Stream copy',
    mechanism: '-map 0 -c copy, Dolby Vision intact; budgeted re-encode',
    measured: fig('clip').headline,
    figure: 'clip',
  },
  {
    id: 'cfg',
    name: 'CFG',
    repo: 'nix-windows-config',
    input: 'Nix modules',
    output: 'Windows host',
    layer: 'Configuration',
    mechanism: 'WSL2 + home-manager, modules shared 1:1 with Darwin',
    measured: null,
    figure: null,
  },
  {
    id: 'site',
    name: 'SITE',
    repo: 'my-homebase',
    input: 'GitHub API',
    output: 'louds.net',
    layer: 'Static build',
    mechanism: 'Next.js, prerendered; this datasheet',
    measured: null,
    figure: null,
  },
];

export const repoUrl = (name) => `https://github.com/blarer/${name}`;

/**
 * Pin assignment of the package drawn in section 4. Pins are the ways
 * in and out: the work, the code, the inbox, and each public repository.
 * Pin 10 is a genuine no-connect, as on any part with a spare pin.
 */
export const PINS = [
  { n: 1, name: 'WORK', type: 'O', href: '/work/', description: 'Characterization data: benchmarks, floorplan, composition (section 6 onward)' },
  { n: 2, name: 'GH', type: 'O', href: 'https://github.com/blarer', description: 'github.com/blarer, every public repository' },
  { n: 3, name: 'MAIL', type: 'I', href: 'mailto:blare@louds.net', description: 'blare@louds.net' },
  { n: 4, name: 'SCAN', type: 'O', href: repoUrl('storage-manager-swift'), description: 'storage-manager-swift source' },
  { n: 5, name: 'DICT', type: 'O', href: repoUrl('outloud'), description: 'outloud source' },
  { n: 6, name: 'PWR', type: 'O', href: repoUrl('wattsbar'), description: 'wattsbar source' },
  { n: 7, name: 'TRIM', type: 'O', href: repoUrl('mp4trim'), description: 'mp4trim source' },
  { n: 8, name: 'CFG', type: 'O', href: repoUrl('nix-windows-config'), description: 'nix-windows-config source' },
  { n: 9, name: 'SITE', type: 'O', href: repoUrl('my-homebase'), description: 'my-homebase source, this site' },
  { n: 10, name: 'NC', type: 'NC', href: null, description: 'No internal connection' },
];
