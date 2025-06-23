import Link from 'next/link';
import Layout from '@/components/Layout';
import BlurText from '@/components/BlurText';

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <BlurText 
            text="404 - Page Not Found" 
            animateBy="words"
            direction="top"
            delay={100}
            className="text-4xl md:text-6xl font-bold mb-6"
          />
          <p className="text-xl text-gray-300 mb-8 max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-white/20 text-base font-medium rounded-md text-white bg-black/30 hover:bg-black/50 backdrop-blur-lg transition-all duration-300"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </Layout>
  );
} 