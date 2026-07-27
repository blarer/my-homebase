import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="shell notfound">
      <p className="num notfound-code">404</p>
      <h1 className="display notfound-title">No such path</h1>
      <p className="notfound-body">
        Nothing is served at this address. The work is on the home page.
      </p>
      <Link className="notfound-link" href="/">
        Back to the index
      </Link>
    </main>
  );
}
