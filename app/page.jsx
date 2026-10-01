import Hero from '@/components/Hero';
import Atlas from '@/components/Atlas';
import About from '@/components/About';
import Footer from '@/components/Footer';
import snapshot from '@/lib/repos.json';

export const metadata = {
  title: 'Blare — systems programmer',
  description:
    'I build the tools I wish I had, then measure whether they were worth building. Rust disk scanners, stream-copy video tools, reproducible machine configs.',
};

/**
 * The front page is an introduction: a title page, one living figure, and
 * a few paragraphs. The measured work (benchmark, treemap, languages) has
 * its own page at /work so a first visit meets a person before a dataset.
 */
export default function Home() {
  const { syncedAt } = snapshot;

  return (
    <main>
      <Hero />
      <Atlas />
      <About />
      <Footer syncedAt={syncedAt} />
    </main>
  );
}
