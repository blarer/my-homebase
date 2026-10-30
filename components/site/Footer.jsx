import Link from 'next/link';
import ThemeToggle from '@/components/site/ThemeToggle';

/**
 * The colophon. A monograph closes by saying how it was made; this one says
 * what it was set in, where its numbers came from, and when they were last
 * counted, then closes the sheet with the same Oxford rule the title page
 * opened it with.
 */
export default function Footer({ syncedAt }) {
  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <div className="colophon">
          <p className="colophon-title">Colophon</p>
          <p className="colophon-body">
            Set in Old Standard and Courier Prime, the title in Headbang.
            Repository figures counted from the GitHub API, last synced{' '}
            <span className="num colophon-date">{syncedAt}</span>.
          </p>
        </div>
        <div className="footer-end">
          <nav className="footer-links" aria-label="Elsewhere">
            <Link href="/work/">Work</Link>
            <a href="https://github.com/blarer">GitHub</a>
            <a href="mailto:blare@louds.net">Email</a>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
