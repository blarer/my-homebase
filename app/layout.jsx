import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

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

export const metadata = {
  metadataBase: new URL('https://blare.lol'),
  title: 'Blare — systems programming, measured',
  description:
    'I build native tools and measure what they cost. Rust disk scanners, stream-copy video tools, reproducible machine configs.',
  openGraph: {
    title: 'Blare — systems programming, measured',
    description:
      'I build native tools and measure what they cost. Rust disk scanners, stream-copy video tools, reproducible machine configs.',
    url: 'https://blare.lol',
    siteName: 'Blare',
    locale: 'en_US',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#eceef0',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
