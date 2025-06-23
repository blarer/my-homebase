'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import FuzzyText from './FuzzyText';

export default function Navigation() {
  const pathname = usePathname();
  const navLinks = [
    { href: '/', name: 'Home' },
    { href: '/portfolio', name: 'Portfolio' },
    { href: '/blog', name: 'Blog' },
  ];

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
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    pathname === link.href
                      ? 'text-white bg-white/10'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <FuzzyText text={link.name} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 