import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import ThemeScript from '@/components/site/ThemeScript';
import SiteShell from '@/components/site/SiteShell';
import { SITE_URL } from '@/lib/site';
import { PART, DOC } from '@/lib/datasheet';
import { revision, buildDate } from '@/lib/revision';

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

// The page paints from the theme's tokens; the browser chrome follows the
// colour scheme.
export const viewport = {
  colorScheme: 'light dark',
};

export default function RootLayout({ children }) {
  const rev = revision();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <SiteShell part={PART} doc={`${DOC} · REV ${rev.rev} · ${buildDate()}`}>
          {children}
        </SiteShell>
      </body>
    </html>
  );
}
