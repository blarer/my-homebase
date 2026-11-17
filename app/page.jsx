import { VStack, Layout, LayoutContent } from '@astryxdesign/core/Layout';
import { Section } from '@astryxdesign/core/Section';
import Hero from '@/components/home/Hero';
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
 * The front page, scaffolded from Astryx's `centered-hero` template: a
 * centred headline, blurb and paired calls to action resting on one wide
 * picture. The picture is the Atlas, the living figure. Below it, About.
 * The measured work has its own page at /work so a first visit meets a
 * person before a dataset.
 */
export default function Home() {
  return (
    <Layout
      height="auto"
      contentWidth={1200}
      content={
        <LayoutContent padding={6} isScrollable={false}>
          <VStack gap={10}>
            <Hero />
            <Section variant="transparent" padding={0}>
              <Atlas />
            </Section>
            <About />
            <Footer syncedAt={snapshot.syncedAt} />
          </VStack>
        </LayoutContent>
      }
    />
  );
}
