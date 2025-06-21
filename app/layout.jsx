import './globals.css';
import SplashCursor from "@/components/SplashCursor";

export const metadata = {
  title: 'Blare: Homebase',
  description: 'Personal website for Blare',
  openGraph: {
    title: "Blare",
    description: "The digital home of Blare.",
    url: "https://blare.lol",
    siteName: "Blare",
    images: [
      {
        url: "https://blare.lol/og.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SplashCursor />
        {children}
      </body>
    </html>
  );
}