import { githubFetch, GITHUB_API } from '@/lib/github';

// Basic allowlist: repo names are alphanumeric, hyphens, underscores, dots
const SAFE_REPO = /^[a-zA-Z0-9._-]{1,100}$/;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get('repo');
  const username = process.env.PUBLIC_GITHUB_USERNAME;

  if (!repo || !SAFE_REPO.test(repo)) {
    return Response.json({ error: 'Invalid repo parameter' }, { status: 400 });
  }

  if (!username) {
    return Response.json({ error: 'Missing GitHub username config' }, { status: 500 });
  }

  const url = `${GITHUB_API}/repos/${username}/${repo}/readme`;
  const res = await githubFetch(url, process.env.GHUB_TOKEN);

  if (res.status === 404) {
    return Response.json({ error: 'No README found for this repository' }, { status: 404 });
  }

  if (!res.ok) {
    return Response.json({ error: `GitHub API error: ${res.status}` }, { status: res.status });
  }

  const data = await res.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');

  return Response.json({ content, name: data.name });
}
