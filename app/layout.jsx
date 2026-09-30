import { Old_Standard_TT, Courier_Prime } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import ThemeScript from '@/components/ThemeScript';
import RevealScript from '@/components/RevealScript';
import { SITE_URL } from '@/lib/site';

// The title page's two letters are set in Headbang, the display face from
// Discord's client. Self-hosted so the nameplate never depends on a
// third-party CDN; used for the hero name only.
const headbang = localFont({
  src: '../public/fonts/headbang.woff2',
  weight: '400',
  style: 'normal',
  variable: '--font-headbang',
  display: 'swap',
});

// The voice of a turn-of-the-century scientific journal: Old Standard is a
// revival of the modern-face serifs those journals were set in. It carries
// the nameplate, the headings, and the running text.
const oldSerif = Old_Standard_TT({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-old-serif',
  display: 'swap',
});

// Every number, label, and identifier is typewritten: Courier Prime is
// monospaced, so columns of figures align by construction, and it reads as
// the lab report's own print rather than the journal's typesetting.
const typewriter = Courier_Prime({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-typewriter',
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
    { media: '(prefers-color-scheme: light)', color: '#f3f1ec' },
    { media: '(prefers-color-scheme: dark)', color: '#17140f' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${oldSerif.variable} ${typewriter.variable} ${headbang.variable}`}
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
