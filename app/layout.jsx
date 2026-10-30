import { Hanken_Grotesk, Red_Hat_Mono } from 'next/font/google';
import './styles/index.css';
import ThemeScript from '@/components/site/ThemeScript';
import { SITE_URL } from '@/lib/site';

// Datasheets are set in a plain grotesk: the face has to disappear behind
// the parameters. Hanken Grotesk is a sober neo-grotesk with real weights
// and no display mannerisms, self-hosted by next/font at build time.
const grotesk = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-grotesk',
  display: 'swap',
});

// Values are set in a monospace so every column of MIN / TYP / MAX lines up
// by construction. Used for figures, units, pin names and identifiers only,
// never for running text.
const figures = Red_Hat_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-figures',
  display: 'swap',
});

const description =
  'Datasheet for BLARE-1, a systems-software engineer. Native tools made faster by removing work one layer below: syscalls, stream copy, transport, direct sensor reads. Every value measured.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'BLARE-1 datasheet: systems-software engineer, measured',
  description,
  openGraph: {
    title: 'BLARE-1 datasheet: systems-software engineer, measured',
    description,
    url: SITE_URL,
    siteName: 'Blare',
    locale: 'en_US',
    type: 'website',
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1d1f21' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${grotesk.variable} ${figures.variable}`}
      data-theme="light"
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
