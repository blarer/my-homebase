import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import '@/app/motion.css';

export default function Footer({ syncedAt }) {
  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <p className="tag">
          Repository data synced <span className="num">{syncedAt}</span> from the GitHub API
        </p>
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
