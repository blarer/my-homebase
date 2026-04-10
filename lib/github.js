const GITHUB_API = 'https://api.github.com';

const REVALIDATE_SECONDS = 3600; // Re-fetch repos at most once per hour

async function githubFetch(url, token) {
  const headers = { Accept: 'application/vnd.github.v3+json' };
  if (token) headers.Authorization = `token ${token}`;

  let res = await fetch(url, { headers, next: { revalidate: REVALIDATE_SECONDS } });

  // Token invalid — retry unauthenticated (public repos still accessible)
  if (res.status === 401) {
    res = await fetch(url, {
      headers: { Accept: 'application/vnd.github.v3+json' },
      next: { revalidate: REVALIDATE_SECONDS },
    });
  }
  return res;
}

export async function fetchGitHubRepos() {
  const username = process.env.PUBLIC_GITHUB_USERNAME;
  if (!username) throw new Error('Missing PUBLIC_GITHUB_USERNAME in environment');

  const url = `${GITHUB_API}/users/${username}/repos?per_page=100&sort=updated`;
  const res = await githubFetch(url, process.env.GHUB_TOKEN);

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`GitHub API error: ${res.status} ${msg}`);
  }

  const repos = await res.json();
  return repos.filter((repo) => !repo.fork);
}

export { githubFetch, GITHUB_API };