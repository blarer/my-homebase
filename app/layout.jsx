import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import ThemeScript from '@/components/site/ThemeScript';
import SiteShell from '@/components/site/SiteShell';
import { SITE_URL } from '@/lib/site';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Blare — systems programming, measured',
  description:
    'I build native tools and measure what they cost. Rust disk scanners, stream-copy video tools, reproducible machine configs.',
  openGraph: {
    title: 'Blare — systems programming, measured',
    description:
      'I build native tools and measure what they cost. Rust disk scanners, stream-copy video tools, reproducible machine configs.',
    url: SITE_URL,
    siteName: 'Blare',
    locale: 'en_US',
    type: 'website',
  },
};

// Browser chrome colour follows the scheme; the page itself paints from the
// theme's tokens, so these name the CSS system colours rather than a hex.
export const viewport = {
  colorScheme: 'light dark',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
