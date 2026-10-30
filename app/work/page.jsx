import Link from 'next/link';
import Race from '@/components/work/Race';
import FigureIndex from '@/components/work/FigureIndex';
import Treemap from '@/components/work/Treemap';
import Languages from '@/components/work/Languages';
import Footer from '@/components/site/Footer';
import { FIGURES } from '@/lib/figures';
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
    <>
      <main id="main" tabIndex={-1}>
        <header className="shell work-head" data-running-head="The work, measured">
          <h1 className="work-title">The work, measured</h1>
          <p className="work-lede">
            Six figures. The first four are measurements I took, one per
            repository, folded under their titles. The last two are drawn from
            the repositories themselves, so they change when the code does.
          </p>
          <Link href="/" className="work-home">
            <span aria-hidden="true">← </span>Back to the introduction
          </Link>
        </header>
        <FigureIndex />
        {FIGURES.map((figure) => (
          <Race key={figure.id} {...figure} />
        ))}
        <Treemap repos={repos} />
        <Languages repos={repos} />
      </main>
      <Footer syncedAt={syncedAt} />
    </>
  );
}
