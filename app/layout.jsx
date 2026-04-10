import { Inter } from 'next/font/google';
import './globals.css';
import Cursor from '@/components/Cursor';
import ScrollProgress from '@/components/ScrollProgress';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  metadataBase: new URL('https://blare.lol'),
  title: 'Blare',
  description: 'Developer crafting exceptional digital experiences.',
  openGraph: {
    title: 'Blare',
    description: 'Developer crafting exceptional digital experiences.',
    url: 'https://blare.lol',
    siteName: 'Blare',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <ScrollProgress />
        <Cursor />
        {children}
      </body>
    </html>
  );
}
