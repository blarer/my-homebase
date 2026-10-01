import Link from 'next/link';
import { DiskScan, Dictation, Footprint, Clip } from '@/components/Benchmark';
import Work from '@/components/Work';
import Stack from '@/components/Stack';
import Footer from '@/components/Footer';
import snapshot from '@/lib/repos.json';

export const metadata = {
  title: 'Blare — the work, measured',
  description:
    'Benchmarks from four repositories run as races, every repository drawn to scale, and the languages they are written in, counted from the GitHub API.',
};

/**
 * The figures. The first four are measurements from individual
 * repositories, each folded under its own title; the last two are drawn
 * from the repositories themselves and change when the code does.
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
          Six figures. The first four are measurements I took, one per
          repository, folded under their titles. The last two are drawn from
          the repositories themselves, so they change when the code does.
        </p>
      </header>
      <DiskScan />
      <Dictation />
      <Footprint />
      <Clip />
      <Work repos={repos} />
      <Stack repos={repos} />
      <Footer syncedAt={syncedAt} />
    </main>
  );
}
