import Link from 'next/link';
import ThemeToggle from '@/components/site/ThemeToggle';
import { PART, DOC, TITLE } from '@/lib/datasheet';
import { revision, buildDate } from '@/lib/revision';

/**
 * The header every page of the datasheet carries: the manufacturer bar with
 * the part number, the document number and revision, then the page's own
 * running line. `page` is "1" or "2"; the sheet has two.
 */
const PAGES = [
  { href: '/', n: '1', label: 'Datasheet' },
  { href: '/work/', n: '2', label: 'Characterization' },
];

export default function SheetHeader({ page }) {
  const rev = revision();
  return (
    <header className="sheet-head">
      <div className="sheet-bar">
        <div className="sheet-bar-inner">
          <Link href="/" className="sheet-part" aria-label={`${PART}, datasheet page 1`}>
            {PART}
          </Link>
          <p className="sheet-doc num">
            <span>{DOC}</span>
            <span aria-hidden="true"> · </span>
            <span>REV {rev.rev}</span>
            <span aria-hidden="true"> · </span>
            <time dateTime={buildDate()}>{buildDate()}</time>
          </p>
        </div>
      </div>
      <div className="sheet-run">
        <p className="sheet-run-title">
          <span className="num">{PART}</span> {TITLE}
        </p>
        <nav className="sheet-nav" aria-label="Datasheet pages">
          {PAGES.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="sheet-nav-link"
              aria-current={p.n === page ? 'page' : undefined}
            >
              <span className="num">p.{p.n}</span> {p.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
