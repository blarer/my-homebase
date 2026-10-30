#!/usr/bin/env node
/**
 * Writes lib/revisions.json, the datasheet's revision history, from git log.
 *
 * Commits are grouped by day, one revision per working day, oldest first
 * so revision letters stay stable as history grows. Each revision keeps the
 * day's commit count and its subjects (merges excluded). Committed rather
 * than computed at build time because the deploy build runs in a shallow
 * clone where the history is not there to read.
 *
 *   node scripts/sync-revisions.mjs
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const log = execFileSync('git', ['log', '--no-merges', '--date=short', '--format=%ad%x09%h%x09%s'], {
  encoding: 'utf8',
});

const days = new Map();
for (const line of log.trim().split('\n').reverse()) {
  const [date, hash, subject] = line.split('\t');
  if (!days.has(date)) days.set(date, []);
  days.get(date).push({ hash, subject });
}

// A, B, ... Z, AA, AB ...
const letter = (i) => (i < 26 ? String.fromCharCode(65 + i) : letter(Math.floor(i / 26) - 1) + letter(i % 26));

const revisions = [...days.entries()].map(([date, commits], i) => ({
  rev: letter(i),
  date,
  commits: commits.length,
  subjects: commits.map((c) => c.subject),
  last: commits[commits.length - 1].hash,
}));

writeFileSync('lib/revisions.json', `${JSON.stringify({ revisions }, null, 2)}\n`);
console.log(`wrote ${revisions.length} revisions`);
