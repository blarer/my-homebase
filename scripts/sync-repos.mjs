#!/usr/bin/env node
/**
 * Refreshes lib/repos.json from the GitHub API.
 *
 * The site renders from a committed snapshot rather than fetching at request
 * time: no rate limits, no runtime network dependency on Cloudflare Workers,
 * and the page is deterministic. Run `npm run sync:repos` to update it.
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const USER = 'blarer';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'repos.json');

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': `${USER}-homebase-sync`,
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

async function api(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub ${res.status} on ${path}`);
  return res.json();
}

const list = await api(`/users/${USER}/repos?per_page=100&sort=pushed`);

const repos = await Promise.all(
  list
    .filter((r) => !r.fork && !r.archived && !r.private)
    .map(async (r) => ({
      name: r.name,
      description: r.description ?? '',
      url: r.html_url,
      homepage: r.homepage || null,
      pushedAt: r.pushed_at.slice(0, 10),
      createdAt: r.created_at.slice(0, 10),
      stars: r.stargazers_count,
      languages: await api(`/repos/${USER}/${r.name}/languages`),
    })),
);

repos.sort((a, b) => sum(b.languages) - sum(a.languages));

function sum(languages) {
  return Object.values(languages).reduce((total, bytes) => total + bytes, 0);
}

const snapshot = {
  user: USER,
  syncedAt: new Date().toISOString().slice(0, 10),
  repos,
};

await writeFile(OUT, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Wrote ${repos.length} repos to lib/repos.json`);
