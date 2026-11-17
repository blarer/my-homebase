#!/usr/bin/env node
/**
 * Refreshes lib/repos.json from the GitHub API.
 *
 * The site renders from a committed snapshot rather than fetching at request
 * time: no rate limits, no runtime network dependency on Cloudflare Workers,
 * and the page is deterministic. Run `npm run sync:repos` to update it.
 *
 * Only public repositories are published. Private repositories are left out
 * completely: no entry, no language bytes, no count. The listing comes from
 * the public endpoint, so private data never reaches this process, and a
 * check before the write refuses any entry GitHub marks private.
 *
 * GITHUB_TOKEN is optional and only raises the API rate limit; no scope is
 * needed.
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const USER = "blarer";
const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "lib",
  "repos.json",
);
const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": `${USER}-homebase-sync`,
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
};

async function api(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub ${res.status} on ${path}`);
  return res.json();
}

// The public listing for the user: never includes private repositories,
// whatever token is used.
const list = await api(`/users/${USER}/repos?per_page=100&type=owner&sort=pushed`);

const active = list.filter((r) => !r.private && !r.fork && !r.archived);

const fetched = await Promise.all(
  active.map(async (r) => ({
    repo: r,
    languages: await api(`/repos/${r.full_name}/languages`),
  })),
);

// A repo whose language breakdown is empty (docs-only, or nothing linguist
// counts) would be a zero-area tile the treemap cannot render, so it is left
// out.
const measured = fetched.filter((m) => sum(m.languages) > 0);

const repos = measured.map(({ repo: r, languages }) => ({
  name: r.name,
  description: r.description ?? "",
  url: r.html_url,
  homepage: r.homepage || null,
  pushedAt: r.pushed_at.slice(0, 10),
  createdAt: r.created_at.slice(0, 10),
  stars: r.stargazers_count,
  languages,
}));

repos.sort((a, b) => sum(b.languages) - sum(a.languages));

function sum(languages) {
  return Object.values(languages).reduce((total, bytes) => total + bytes, 0);
}

const snapshot = {
  user: USER,
  syncedAt: new Date().toISOString().slice(0, 10),
  repos,
};

const serialised = `${JSON.stringify(snapshot, null, 2)}\n`;

// Last line of defence: the public endpoint should never return a private
// repository, but if it ever did, nothing about it may be written.
if (active.length !== list.filter((r) => !r.fork && !r.archived).length) {
  throw new Error("Refusing to write: the listing contained a private repository.");
}

await writeFile(OUT, serialised);
console.log(`Wrote ${repos.length} public repos to lib/repos.json`);
