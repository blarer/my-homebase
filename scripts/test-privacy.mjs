#!/usr/bin/env node
/**
 * Asserts the committed snapshot publishes public repositories only, and that
 * it is current against GitHub.
 *
 * lib/repos.json ships inside a public repository and is inlined into the
 * static build, so anything in it is published. Private repositories are left
 * out entirely: no entry, no language bytes, no count. This checks the
 * artefact rather than the sync code, so it also catches a hand-edited file.
 *
 * Structural checks always run. The comparison against the live API needs
 * `gh` (authenticated or not: only public endpoints are used). When it cannot
 * run it says so, and REQUIRE_NAME_CHECK=1 turns that into a failure.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import snapshot from '../lib/repos.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const failures = [];
const check = (name, ok, detail) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}`);
  if (!ok) failures.push(`${name}${detail ? `: ${detail}` : ''}`);
};

const sum = (languages) => Object.values(languages).reduce((total, n) => total + n, 0);

// Structural: nothing in the file marks or names a private repository.
const flagged = snapshot.repos.filter((r) => r.private === true);
check('no entry is marked private', flagged.length === 0, flagged.map((r) => r.name).join(', '));

const placeholders = snapshot.repos.filter((r) => /^private-/i.test(r.name));
check('no private-N placeholder entries', placeholders.length === 0, placeholders.map((r) => r.name).join(', '));

const unlinked = snapshot.repos.filter((r) => !r.url);
check('every entry links to its public repository', unlinked.length === 0, unlinked.map((r) => r.name).join(', '));

// Live: the snapshot is exactly the public, active, measured set GitHub
// reports, and no private repository name appears anywhere in it.
const REQUIRE_NAME_CHECK = process.env.REQUIRE_NAME_CHECK === '1';
let liveCheckRan = false;

try {
  const gh = (args) =>
    execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

  const owner = snapshot.user;
  const listed = JSON.parse(
    gh([
      'api',
      `users/${owner}/repos?per_page=100&type=owner`,
      '--jq',
      '[.[] | select(.private == false and .archived == false and .fork == false) | .name]',
    ]),
  );
  // The sync leaves out repositories with no language bytes, so compare
  // against the same set; recomputed from the API, not read from the file.
  const expected = listed
    .filter((name) => sum(JSON.parse(gh(['api', `repos/${owner}/${name}/languages`]))) > 0)
    .sort();
  const actual = snapshot.repos.map((r) => r.name).sort();
  check(
    'snapshot is current: same public repositories as GitHub',
    JSON.stringify(expected) === JSON.stringify(actual),
    `snapshot [${actual.join(', ')}], GitHub [${expected.join(', ')}]`,
  );

  // Private names are only listable with an authenticated gh. Without that,
  // the public-set comparison above still proves no extra entry slipped in.
  let privateNames = [];
  try {
    privateNames = JSON.parse(
      gh(['api', 'user/repos?per_page=100&affiliation=owner&visibility=private', '--jq', '[.[] | .name]']),
    );
  } catch {
    console.log('note  private names not listable (gh not authenticated); public-set check covers extra entries');
  }
  const published = JSON.stringify(snapshot.repos.map((r) => ({ name: r.name, url: r.url, homepage: r.homepage }))).toLowerCase();
  const leaked = privateNames.filter((name) => published.includes(`"${name.toLowerCase()}"`) || published.includes(`/${name.toLowerCase()}"`));
  check('no private repository is published by name or URL', leaked.length === 0, leaked.join(', '));

  // The page is built from more than the snapshot: lib/ and components/ hold
  // hand-written content (figures, blocks, pins, notes) that is published
  // too. A repository that turns private must vanish from those by name.
  // Matched as a whole word, case-insensitive, so a name is not "found"
  // inside a longer unrelated word.
  const sources = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.(m?js|jsx|json|css)$/.test(entry.name)) sources.push(path);
    }
  };
  for (const dir of ['app', 'components', 'lib']) walk(join(ROOT, dir));
  const inSource = [];
  for (const name of privateNames) {
    const word = new RegExp(`(^|[^a-z0-9_-])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z0-9_-])`, 'i');
    for (const file of sources) {
      if (word.test(readFileSync(file, 'utf8'))) inSource.push(`${name} in ${file.slice(ROOT.length + 1)}`);
    }
  }
  check(
    'no private repository name appears in app/, components/ or lib/',
    inSource.length === 0,
    // Counted, not listed: the failure output should not itself publish names.
    `${inSource.length} occurrence(s); run locally to see where`,
  );
  if (inSource.length && process.env.SHOW_PRIVATE_HITS === '1') console.log(inSource.join('\n'));
  liveCheckRan = true;
} catch (err) {
  const reason = String(err.stderr || err.message).trim().split('\n')[0];
  const detail = err.code === 'ENOENT' ? 'gh is not installed' : `gh failed: ${reason}`;
  if (REQUIRE_NAME_CHECK) {
    check('live comparison could run', false, detail);
  } else {
    console.log(`UNVERIFIED  live comparison did not run (${detail})`);
  }
}

if (failures.length > 0) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}

console.log(
  liveCheckRan
    ? '\nSnapshot publishes public repositories only, and is current.'
    : '\nStructural checks passed; the live comparison did not run, so currency is not verified.',
);
