import Link from 'next/link';
import { PART, DOC } from '@/lib/datasheet';
import { revision } from '@/lib/revision';

/**
 * The page footer rule: document number and page on the left, where the
 * values came from in the middle, the ways out on the right.
 */
export default function SheetFooter({ page, syncedAt }) {
  const rev = revision();
  return (
    <footer className="sheet-foot">
      <div className="sheet-foot-inner">
        <p className="sheet-foot-id num">
          {PART} · {DOC} REV {rev.rev} · page {page} of 2
        </p>
        <p className="sheet-foot-colophon">
          Set in Hanken Grotesk and Red Hat Mono. Repository values counted from
          the GitHub API, last synced <span className="num">{syncedAt}</span>.
        </p>
        <nav className="sheet-foot-links" aria-label="Elsewhere">
          <Link href={page === '1' ? '/work/' : '/'}>{page === '1' ? 'Characterization, p.2' : 'Datasheet, p.1'}</Link>
          <a href="https://github.com/blarer">GitHub</a>
          <a href="mailto:blare@louds.net">Email</a>
        </nav>
      </div>
    </footer>
  );
}
