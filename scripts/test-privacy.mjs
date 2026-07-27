#!/usr/bin/env node
/**
 * Asserts the committed snapshot publishes no private repository data.
 *
 * lib/repos.json ships inside a public repository and is inlined into the
 * static build, so anything in it is published. Private repos are included as
 * shape only, which is safe exactly as long as the redaction in
 * sync-repos.mjs holds. This checks the artefact rather than the code, so it
 * still catches a hand-edited snapshot.
 *
 * Skips the name comparison when no token is available, since the private
 * names cannot be known then; the structural assertions always run.
 */
import { execFileSync } from 'node:child_process';
import snapshot from '../lib/repos.json' with { type: 'json' };

const failures = [];
const check = (name, ok, detail) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}`);
  if (!ok) failures.push(`${name}${detail ? `: ${detail}` : ''}`);
};

const privateEntries = snapshot.repos.filter((r) => r.private);
check('snapshot marks private repos explicitly', privateEntries.length > 0 || snapshot.repos.length > 0);

// Structural: a private entry may carry language bytes and nothing else that
// identifies it.
for (const repo of privateEntries) {
  check(
    `${repo.name} uses a placeholder name`,
    /^private-\d+$/.test(repo.name),
    `got ${JSON.stringify(repo.name)}`,
  );
  check(`${repo.name} has no description`, !repo.description);
  check(`${repo.name} has no url`, repo.url === null);
  check(`${repo.name} has no homepage`, repo.homepage === null);
  check(`${repo.name} has no dates`, repo.pushedAt === null && repo.createdAt === null);
  check(`${repo.name} still carries language bytes`, Object.keys(repo.languages).length > 0);
}

// Ordering: the placeholder number must be derived from source bytes, which are
// already published in full below it, and from nothing else.
//
// This pins a regression that was briefly committed. Numbering the entries by
// their position in the API listing looks inert, but that listing is fetched
// with `sort=pushed`, so the ordinal silently became a recency rank and
// announced the most recently active private repository: the same fact
// `pushedAt: null` is there to withhold. A race in the old code had been
// scrambling that correlation, so removing the race is what exposed it.
//
// Asserting descending byte order catches that specific mistake without
// needing a token, because a recency-ordered snapshot cannot also be
// byte-ordered unless the two happen to coincide. Any future ordering key that
// is not the published byte totals will trip this.
const totalBytes = (repo) => Object.values(repo.languages).reduce((sum, n) => sum + n, 0);
const ordinalOf = (repo) => Number.parseInt(repo.name.slice('private-'.length), 10);
const byOrdinal = [...privateEntries].sort((a, b) => ordinalOf(a) - ordinalOf(b));

check(
  'private placeholders are numbered 1..n with no gaps',
  byOrdinal.every((repo, i) => ordinalOf(repo) === i + 1),
  byOrdinal.map((r) => r.name).join(', '),
);

const misordered = byOrdinal.findIndex(
  (repo, i) => i > 0 && totalBytes(byOrdinal[i - 1]) < totalBytes(repo),
);
check(
  'private placeholders are ordered by descending source bytes, not recency',
  misordered === -1,
  misordered === -1
    ? ''
    : `${byOrdinal[misordered - 1].name} (${totalBytes(byOrdinal[misordered - 1])} B) ` +
      `precedes ${byOrdinal[misordered].name} (${totalBytes(byOrdinal[misordered])} B)`,
);

// Content: no real private repo name may appear anywhere in a private entry.
//
// This is the assertion that catches the class of bug that has actually
// happened here (a private name reaching a published artefact through a field
// nobody was watching), so when it cannot run, that has to be visible.
//
// Not to be merged with the superficially identical skip in blarer-profile's
// check-no-private-names.mjs. That one is sound: without a token the generator
// refuses to run, so no private repo could have entered the SVGs, and having
// nothing to check really does mean there is nothing to find. Here the
// opposite holds. The snapshot is already on disk and already contains
// private-derived entries, so being unable to look at it proves nothing about
// what is in it. Same shape, opposite safety.
//
// REQUIRE_NAME_CHECK=1 makes an unrunnable comparison a hard failure. The
// deploy workflow sets it, because publishing on a gate that could not run is
// exactly the outcome this file exists to prevent.
const REQUIRE_NAME_CHECK = process.env.REQUIRE_NAME_CHECK === '1';
let nameCheckRan = false;

try {
  const names = JSON.parse(
    execFileSync(
      'gh',
      [
        'api',
        'user/repos?per_page=100&affiliation=owner&visibility=private',
        '--jq',
        // Archived repos are excluded from the snapshot on purpose, so compare
        // against the same set the sync actually considers.
        '[.[] | select(.archived == false and .fork == false) | .name]',
      ],
      // stderr is captured rather than discarded so an expired token can be
      // told apart from gh being absent.
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    ),
  );
  const emitted = JSON.stringify(privateEntries).toLowerCase();
  const leaked = names.filter((n) => emitted.includes(n.toLowerCase()));
  check('no private repo name appears in a private entry', leaked.length === 0, leaked.join(', '));

  check(
    'every active private repo is represented',
    privateEntries.length === names.length,
    `${privateEntries.length} entries for ${names.length} active private repos`,
  );
  nameCheckRan = true;
} catch (err) {
  const reason = String(err.stderr || err.message).trim().split('\n')[0];
  const missing = err.code === 'ENOENT';
  const detail = missing ? 'gh is not installed' : `gh failed: ${reason}`;

  if (REQUIRE_NAME_CHECK) {
    check('name comparison could run', false, detail);
  } else {
    // Deliberately not "skip": this is an unchecked assertion, and the summary
    // below must not read as a clean bill of health.
    console.log(`UNVERIFIED  name comparison did not run (${detail})`);
  }
}

if (failures.length > 0) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}

// Only claim the snapshot is clean when the check that would have caught a
// name actually ran. "The assertions I was able to run all passed" and "the
// snapshot publishes shape only" are different statements, and a gate that
// cannot tell them apart reports an unknown as an assurance.
console.log(
  nameCheckRan
    ? '\nSnapshot publishes shape only.'
    : '\nSnapshot NOT fully verified: structural checks passed, but the private\n' +
      'name comparison did not run, so no claim is made about name leakage.\n' +
      'Authenticate gh, or set REQUIRE_NAME_CHECK=1 to make this a failure.',
);
