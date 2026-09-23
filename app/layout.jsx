import { Archivo, IBM_Plex_Mono, IBM_Plex_Serif } from 'next/font/google';
import './globals.css';
import ThemeScript from '@/components/ThemeScript';
import { SITE_URL } from '@/lib/site';

// Archivo carries a width axis, so the display type can be stretched to fill a
// measure exactly rather than being letter-spaced by eye.
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});

// Every number on this site is set in mono with tabular figures so columns of
// measurements line up.
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
});

// Running text is set in Plex Serif — drawn on the same grid as Plex Mono, so
// prose and data read as one family in two registers: measured things stay
// mono, explained things become bookish.
const plexSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-plex-serif',
  display: 'swap',
});

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

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eae6dc' },
    { media: '(prefers-color-scheme: dark)', color: '#0f151c' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plexMono.variable} ${plexSerif.variable}`}
      data-theme="light"
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
