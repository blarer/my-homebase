import Link from 'next/link';
import Layout from '@/components/Layout';

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="label mb-6">404</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
            Lost in the void.
          </h1>
          <p className="text-base mb-10" style={{ color: 'var(--text-secondary)' }}>
            This page doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-white border border-white/15 rounded-full px-5 py-2.5 hover:bg-white/5 hover:border-white/30 transition-all duration-200"
          >
            Back home
          </Link>
        </div>
      </div>
    </Layout>
  );
}
