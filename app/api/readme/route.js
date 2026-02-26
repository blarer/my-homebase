const GITHUB_API = 'https://api.github.com';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get('repo');
  const username = process.env.PUBLIC_GITHUB_USERNAME;

  if (!repo) {
    return Response.json({ error: 'Missing repo parameter' }, { status: 400 });
  }

  if (!username) {
    return Response.json({ error: 'Missing GitHub username config' }, { status: 500 });
  }

  const token = process.env.GHUB_TOKEN;
  const url = `${GITHUB_API}/repos/${username}/${repo}/readme`;

  let res;
  if (token) {
    res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${token}`,
      },
    });
    if (res.status === 401) {
      res = await fetch(url, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
    }
  } else {
    res = await fetch(url, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
  }

  if (res.status === 404) {
    return Response.json({ error: 'No README found for this repository' }, { status: 404 });
  }

  if (!res.ok) {
    const msg = await res.text();
    return Response.json({ error: `GitHub API error: ${res.status}` }, { status: res.status });
  }

  const data = await res.json();

  // GitHub returns README content as base64
  const content = Buffer.from(data.content, 'base64').toString('utf-8');

  return Response.json({ content, name: data.name });
}
