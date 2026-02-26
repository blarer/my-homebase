/**
 * Lightweight helper to fetch your public GitHub repos.
 * Returns an array of repos sorted by updated date.
 */

const GITHUB_API = 'https://api.github.com';

/**
 * Fetch public repos for the configured user.
 * You must set GITHUB_TOKEN and GITHUB_USERNAME in your environment.
 */
export async function fetchGitHubRepos() {
  const token = process.env.GHUB_TOKEN;
  const username = process.env.PUBLIC_GITHUB_USERNAME;

  if (!username) {
    throw new Error('Missing PUBLIC_GITHUB_USERNAME in environment');
  }

  const url = `${GITHUB_API}/users/${username}/repos?per_page=100&sort=updated`;

  // Try with token first, fall back to unauthenticated if credentials are bad
  let res;
  if (token) {
    res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${token}`,
      },
      next: { revalidate: 0 },
    });
    if (res.status === 401) {
      // Token is invalid/expired -- retry without it (works for public repos)
      res = await fetch(url, {
        headers: { Accept: 'application/vnd.github.v3+json' },
        next: { revalidate: 0 },
      });
    }
  } else {
    res = await fetch(url, {
      headers: { Accept: 'application/vnd.github.v3+json' },
      next: { revalidate: 0 },
    });
  }

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`GitHub API error: ${res.status} ${msg}`);
  }

  const repos = await res.json();
  // Only return repos that are not forks
  return repos.filter(repo => !repo.fork);
}