import BlurText from '@/components/BlurText';
import Layout from '@/components/Layout';
import ScrollReveal from '@/components/ScrollReveal';
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
        {/* Features Section */}
        <section className="py-8 sm:py-10 md:py-12 px-2 sm:px-4 mt-0">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <div className="text-center mb-8 sm:mb-12">
              <BlurText 
                text="What's Inside" 
                animateBy="words"
                direction="top"
                delay={100}
                className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight"
              />
            </div>
            
            <HomeCards />
          </div>
        </section>
      </main>
    </Layout>
  );
}
