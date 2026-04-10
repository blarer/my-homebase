import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import Work from '@/components/Work';
import Stack from '@/components/Stack';
import About from '@/components/About';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Blare',
  description: 'Developer crafting exceptional digital experiences.',
};

export default function Home() {
  return (
    <Layout>
      <Hero />
      <Work />
      <Stack />
      <About />
      <Footer />
    </Layout>
  );
}
