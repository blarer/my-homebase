#!/usr/bin/env node
/**
 * Refreshes lib/repos.json from the GitHub API.
 *
 * The site renders from a committed snapshot rather than fetching at request
 * time: no rate limits, no runtime network dependency on Cloudflare Workers,
 * and the page is deterministic. Run `npm run sync:repos` to update it.
 *
 * Private repositories are included as shape only. Because this snapshot is
 * committed to a public repository, their names, descriptions and URLs are
 * dropped here at sync time rather than hidden in the UI: anything that
 * reaches repos.json is published, so redaction has to happen before the file
 * is written. Only the language byte counts survive.
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
const INCLUDE_PRIVATE = process.env.INCLUDE_PRIVATE !== "0";

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

// Listing private repos needs a token with `repo` scope. Falling back to
// public-only would quietly rewrite the snapshot with a smaller picture, so
// this stops instead and leaves the committed file alone.
if (INCLUDE_PRIVATE && !process.env.GITHUB_TOKEN) {
  console.error(
    "Listing private repositories needs GITHUB_TOKEN with `repo` scope.\n" +
      "Refusing to rewrite the snapshot without them; set INCLUDE_PRIVATE=0 to\n" +
      "sync public repositories only. lib/repos.json left untouched.",
  );
  process.exit(1);
}

const list = INCLUDE_PRIVATE
  ? await api("/user/repos?per_page=100&affiliation=owner&sort=pushed")
  : await api(`/users/${USER}/repos?per_page=100&sort=pushed`);

let privateSeq = 0;
const repos = await Promise.all(
  list
    .filter((r) => !r.fork && !r.archived)
    .map(async (r) => {
      const languages = await api(`/repos/${r.full_name}/languages`);

      // Redact before writing. A private repo becomes an anonymous shape: its
      // language mix and volume are real, everything identifying is gone.
      if (r.private) {
        privateSeq += 1;
        return {
          name: `private-${String(privateSeq).padStart(2, "0")}`,
          private: true,
          description: "",
          url: null,
          homepage: null,
          pushedAt: null,
          createdAt: null,
          stars: 0,
          languages,
        };
      }

      return {
        name: r.name,
        private: false,
        description: r.description ?? "",
        url: r.html_url,
        homepage: r.homepage || null,
        pushedAt: r.pushed_at.slice(0, 10),
        createdAt: r.created_at.slice(0, 10),
        stars: r.stargazers_count,
        languages,
      };
    }),
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

const serialised = `${JSON.stringify(snapshot, null, 2)}\n`;

// Last line of defence: no private repo name may appear in what we emit for a
// private repo. Scoped to the redacted entries on purpose. A private name can
// legitimately appear in a *public* repo's own description (nix-windows-config
// describes itself as the counterpart to the private nix-darwin-config), and
// GitHub already publishes that text, so rejecting it would block a correct
// sync over a string that is not ours to hide.
if (INCLUDE_PRIVATE) {
  const privateNames = list.filter((r) => r.private).map((r) => r.name);
  const emitted = JSON.stringify(repos.filter((r) => r.private)).toLowerCase();
  const leaked = privateNames.filter((name) =>
    emitted.includes(name.toLowerCase()),
  );
  if (leaked.length > 0) {
    throw new Error(
      `Refusing to write: private repo names present in snapshot: ${leaked.join(", ")}`,
    );
  }
}

await writeFile(OUT, serialised);
const privateCount = repos.filter((r) => r.private).length;
console.log(
  `Wrote ${repos.length} repos (${repos.length - privateCount} public, ${privateCount} private, redacted) to lib/repos.json`,
);
