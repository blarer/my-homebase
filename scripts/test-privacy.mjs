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

// Content: no real private repo name may appear anywhere in a private entry.
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
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
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
} catch {
  console.log('skip  name comparison needs an authenticated gh');
}

if (failures.length > 0) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log('\nSnapshot publishes shape only.');
