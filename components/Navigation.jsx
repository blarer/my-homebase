'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 glass-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-white font-bold text-xl glow-effect">
              Blare
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  pathname === '/'
                    ? 'text-white bg-white/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Home
              </Link>
              <Link
                href="/portfolio"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  pathname === '/portfolio'
                    ? 'text-white bg-white/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Portfolio
              </Link>
              <Link
                href="/blog"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  pathname === '/blog'
                    ? 'text-white bg-white/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Blog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 