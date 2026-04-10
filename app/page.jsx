import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import HomeCards from '@/components/HomeCards';

export const metadata = {
  title: 'Blare: Homebase',
  description: 'Welcome to my digital homebase.',
};

export default function Home() {
  return (
    <Layout>
      <main className="flex-1">
        <Hero />
        <section id="about" className="py-8 sm:py-10 md:py-12 px-4 mt-0">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                What&apos;s Inside
              </h2>
            </div>
            <HomeCards />
          </div>
        </section>
      </main>
    </Layout>
  );
}
