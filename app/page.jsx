import Link from 'next/link';
import BlurText from '@/components/BlurText';
import Layout from '@/components/Layout';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata = {
  title: 'Blare: Homebase',
  description: 'Welcome to my digital homebase.',
};

export default function Home() {
  return (
    <Layout>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[50vh] flex items-center justify-center px-2 sm:px-4 pb-6 sm:pb-8 overflow-hidden">
          {/* Silk background */}
          <div className="absolute inset-0 pointer-events-none z-0 silk-bg" />
          <div className="relative w-full max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 z-10">
            <BlurText 
              text="Welcome to My Digital Homebase" 
              animateBy="words"
              direction="top"
              delay={100}
              className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-bold tracking-tight"
            />
            <ScrollReveal delay={0.5}>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-xl sm:max-w-2xl mx-auto leading-relaxed">
                A place where I share my thoughts, projects, and journey through the digital world.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.7}>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-6 sm:mt-8 w-full">
                <Link
                  href="/portfolio"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 border border-white/20 text-base font-medium rounded-md text-white bg-black/30 hover:bg-black/50 backdrop-blur-lg transition-all duration-300"
                >
                  View My Work
                </Link>
                <Link
                  href="/blog"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 border border-white/20 text-base font-medium rounded-md text-white bg-black/30 hover:bg-black/50 backdrop-blur-lg transition-all duration-300"
                >
                  Read My Blog
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-8 sm:py-10 md:py-12 px-2 sm:px-4 mt-0">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <BlurText 
                text="What's Inside" 
                animateBy="words"
                direction="top"
                delay={100}
                className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 max-w-2xl md:max-w-4xl xl:max-w-5xl mx-auto">
              <ScrollReveal direction="left" delay={0.2}>
                <div className="h-full bg-black/30 backdrop-blur-lg rounded-lg p-6 sm:p-8 border border-white/10 hover:border-white/20 transition-all duration-300 text-center flex flex-col items-center">
                  <div className="text-3xl sm:text-4xl mb-4 sm:mb-6 animate-float">💻</div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Portfolio</h3>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base">Explore my latest projects and coding adventures.</p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.4}>
                <div className="h-full bg-black/30 backdrop-blur-lg rounded-lg p-6 sm:p-8 border border-white/10 hover:border-white/20 transition-all duration-300 text-center flex flex-col items-center">
                  <div className="text-3xl sm:text-4xl mb-4 sm:mb-6 animate-float" style={{ animationDelay: '0.2s' }}>📝</div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Blog</h3>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base">Read my thoughts on technology, design, and development.</p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right" delay={0.6}>
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