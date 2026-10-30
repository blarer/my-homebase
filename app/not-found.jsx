import Link from 'next/link';
import SheetHeader from '@/components/sheet/SheetHeader';

export default function NotFound() {
  return (
    <>
      <SheetHeader page="0" />
      <main id="main" className="sheet notfound">
        <h1 className="ds-h1">
          <span className="ds-h1-part num">404</span>
          <span className="ds-h1-name">No such page in this datasheet</span>
        </h1>
        <p className="ds-p">
          Nothing is served at this address. The datasheet has two pages.
        </p>
        <p className="ds-p">
          <Link href="/">Page 1, datasheet</Link> · <Link href="/work/">Page 2, characterization</Link>
        </p>
      </main>
    </>
  );
}
