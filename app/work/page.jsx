import Link from 'next/link';
import Benchmark from '@/components/Benchmark';
import Work from '@/components/Work';
import Stack from '@/components/Stack';
import Footer from '@/components/Footer';
import snapshot from '@/lib/repos.json';

export const metadata = {
  title: 'Blare — the work, measured',
  description:
    'A disk-scan benchmark run as a race, every repository drawn to scale, and the languages they are written in, counted from the GitHub API.',
};

/**
 * The figures. Everything on this page is a measurement: the benchmark
 * race, the treemap of real source bytes, the language ring and table.
 */
export default function WorkPage() {
  const { repos, syncedAt } = snapshot;

  return (
    <main>
      <header className="shell work-head">
        <Link href="/" className="work-home tag">
          <span aria-hidden="true">← </span>Home
        </Link>
        <h1 className="work-title">The work, measured</h1>
        <p className="work-lede">
          Three figures. The first is a benchmark I ran; the other two are
          drawn from the repositories themselves, so they change when the
          code does.
        </p>
      </header>
      <Benchmark />
      <Work repos={repos} />
      <Stack repos={repos} />
      <Footer syncedAt={syncedAt} />
    </main>
  );
}
