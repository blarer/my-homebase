import Link from 'next/link';
import BlurText from '@/components/BlurText';
import Layout from '@/components/Layout';

export const metadata = {
  title: 'Blare: Homebase',
  description: 'Welcome to my personal website and blog',
};

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <BlurText 
              text="Welcome to My Homebase" 
              animateBy="words"
              direction="top"
              delay={200}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            />
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              I'm a web developer passionate about creating beautiful, interactive experiences.
              Explore my portfolio, read my blog, and let's connect!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                View My Work
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Read My Blog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center glass-card p-6 rounded-lg hover:scale-105 transition-transform duration-300">
              <div className="text-white text-4xl mb-4 animate-float">💻</div>
              <h3 className="text-xl font-bold text-white mb-2">Portfolio</h3>
              <p className="text-gray-400">Explore my latest projects and see my work in action.</p>
            </div>
            <div className="text-center glass-card p-6 rounded-lg hover:scale-105 transition-transform duration-300">
              <div className="text-white text-4xl mb-4 animate-float" style={{ animationDelay: '0.2s' }}>📝</div>
              <h3 className="text-xl font-bold text-white mb-2">Blog</h3>
              <p className="text-gray-400">Read my thoughts on web development and technology.</p>
            </div>
            <div className="text-center glass-card p-6 rounded-lg hover:scale-105 transition-transform duration-300">
              <div className="text-white text-4xl mb-4 animate-float" style={{ animationDelay: '0.4s' }}>🚀</div>
              <h3 className="text-xl font-bold text-white mb-2">Latest Updates</h3>
              <p className="text-gray-400">Stay up to date with my latest work and achievements.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}