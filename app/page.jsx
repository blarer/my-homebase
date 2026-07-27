import Hero from '@/components/Hero';
import Work from '@/components/Work';
import Stack from '@/components/Stack';
import About from '@/components/About';
import Footer from '@/components/Footer';
import snapshot from '@/lib/repos.json';

export const metadata = {
  title: 'Blare — systems programming, measured',
  description:
    'I build native tools and measure what they cost. Rust disk scanners, stream-copy video tools, reproducible machine configs.',
};

export default function Home() {
  const { repos, syncedAt } = snapshot;

  return (
    <main>
      <Hero />
      <Work repos={repos} />
      <Stack repos={repos} />
      <About />
      <Footer syncedAt={syncedAt} />
    </main>
  );
}
