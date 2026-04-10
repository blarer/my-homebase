import Link from 'next/link';
import Layout from '@/components/Layout';

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            404 — Page Not Found
          </h1>
          <p className="text-lg text-gray-400 mb-8 max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-2.5 border border-white/20 text-sm font-medium rounded-md text-white hover:bg-white/5 hover:border-white/40 transition-all duration-200"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </Layout>
  );
}
