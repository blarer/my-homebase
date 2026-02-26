import Link from 'next/link';
import BlurText from '@/components/BlurText';
import Layout from '@/components/Layout';
import ScrollReveal from '@/components/ScrollReveal';
import Hero from '@/components/Hero';

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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-2xl md:max-w-3xl mx-auto">
              <ScrollReveal direction="left" delay={0.2}>
                <div className="h-full bg-black/30 backdrop-blur-lg rounded-lg p-6 sm:p-8 border border-white/10 hover:border-white/20 transition-all duration-300 text-center flex flex-col items-center">
                  <div className="text-3xl sm:text-4xl mb-4 sm:mb-6 animate-float">💻</div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Portfolio</h3>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base">Explore my latest projects and coding adventures.</p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right" delay={0.4}>
                <div className="h-full bg-black/30 backdrop-blur-lg rounded-lg p-6 sm:p-8 border border-white/10 hover:border-white/20 transition-all duration-300 text-center flex flex-col items-center">
                  <div className="text-3xl sm:text-4xl mb-4 sm:mb-6 animate-float" style={{ animationDelay: '0.4s' }}>🚀</div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">About</h3>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base">Learn more about me and my journey in tech.</p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}