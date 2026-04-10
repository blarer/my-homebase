import { Inter } from 'next/font/google';
import './globals.css';
import Cursor from '@/components/Cursor';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Blare',
  description: 'Developer crafting exceptional digital experiences.',
  openGraph: {
    title: 'Blare',
    description: 'Developer crafting exceptional digital experiences.',
    url: 'https://blare.lol',
    siteName: 'Blare',
    images: [{ url: 'https://blare.lol/og.png', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <Cursor />
        {children}
      </body>
    </html>
  );
}
