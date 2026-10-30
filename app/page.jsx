import TitlePage from '@/components/home/TitlePage';
import Atlas from '@/components/home/Atlas';
import About from '@/components/home/About';
import Footer from '@/components/site/Footer';
import snapshot from '@/lib/repos.json';

export const metadata = {
  title: 'Blare — systems programmer',
  description:
    'I build the tools I wish I had, then measure whether they were worth building. Rust disk scanners, stream-copy video tools, reproducible machine configs.',
};

/**
 * The front page is an introduction: a title page, one living figure, and
 * a few paragraphs. The measured work has its own page at /work so a first
 * visit meets a person before a dataset.
 */
export default function Home() {
  return (
    <>
      <main id="main" tabIndex={-1}>
        <TitlePage />
        <Atlas />
        <About />
      </main>
      <Footer syncedAt={snapshot.syncedAt} />
    </>
  );
}
