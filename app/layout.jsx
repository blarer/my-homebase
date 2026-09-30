import { Space_Mono, Instrument_Sans } from 'next/font/google';
import './globals.css';
import ThemeScript from '@/components/ThemeScript';
import RevealScript from '@/components/RevealScript';
import { SITE_URL } from '@/lib/site';

// One face for everything measured: headings at 700 are the engraved
// nameplate, numbers and labels at 400 are the recorder's own print. A
// monospace display face aligns every column of figures by construction.
const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-space-mono',
  display: 'swap',
});

// Running text is Instrument Sans: the operator's voice between the plots.
const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-instrument',
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
    { media: '(prefers-color-scheme: light)', color: '#f3f5ef' },
    { media: '(prefers-color-scheme: dark)', color: '#0b100d' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${spaceMono.variable} ${instrumentSans.variable}`}
      data-theme="light"
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        {children}
        {/* Runs after the sections exist; see RevealScript for why it lives
            at the end of <body> rather than in <head>. */}
        <RevealScript />
      </body>
    </html>
  );
}
